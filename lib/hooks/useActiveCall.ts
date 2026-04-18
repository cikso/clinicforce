'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useClinic } from '@/context/ClinicContext'
import { createClient } from '@/lib/supabase/client'

export interface ActiveCall {
  id:         string
  callerName: string
  /** Seconds since the call started. Ticks locally every second. */
  duration:   number
  /** Optional — e.g. 'Appointment enquiry', 'Urgent symptom'. */
  reason?:    string
}

/** Rows older than this are ignored by the UI (safety net against stale rows
 *  if the Twilio status callback never fires for a Stella/ElevenLabs call). */
const STALE_AFTER_MS = 15 * 60 * 1000

/** After this long, the ticker assumes the call is stuck (status webhook
 *  didn't fire) and clears the pulse locally — user gets a stale indicator
 *  cleared without needing to refresh. Real calls don't last this long. */
const MAX_CALL_DURATION_MS = 10 * 60 * 1000

interface DbActiveCall {
  id:           string
  clinic_id:    string
  call_sid:     string
  caller_name:  string | null
  caller_phone: string | null
  reason:       string | null
  handled_by:   'STELLA' | 'CLINIC'
  started_at:   string
}

function toActiveCall(row: DbActiveCall): ActiveCall {
  const startedAt = new Date(row.started_at).getTime()
  return {
    id:         row.id,
    callerName: row.caller_name || row.caller_phone || 'Unknown caller',
    duration:   Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
    reason:     row.reason ?? undefined,
  }
}

/**
 * Returns the currently-active Stella call for this clinic, or null.
 *
 *   • Seeds state from a one-shot SELECT on mount (handles page reload while
 *     Stella is mid-call).
 *   • Subscribes to INSERT / DELETE events on `active_calls` for the clinic
 *     via Supabase realtime — updates are pushed in under a second.
 *   • Only shows calls handled by STELLA (not overflow dials).
 *   • Ticks `duration` locally every second.
 *   • Ignores rows older than 15 min as a stale-row safety net.
 *
 * Demo mode: `?demo=call` simulates a call (25s on / 15s idle loop).
 */
export function useActiveCall(): ActiveCall | null {
  const searchParams = useSearchParams()
  const demo         = searchParams?.get('demo') === 'call'
  const { activeClinicId } = useClinic()

  const [call, setCall]  = useState<ActiveCall | null>(null)
  const startedAtRef     = useRef<number | null>(null)

  // ── Demo loop (bypass real data) ──────────────────────────────────────────
  useEffect(() => {
    if (!demo) return

    let tickId:  ReturnType<typeof setInterval> | null = null
    let cycleId: ReturnType<typeof setTimeout>  | null = null

    const startCall = () => {
      const id = `demo-${Date.now()}`
      const startedAt = Date.now()
      startedAtRef.current = startedAt
      setCall({ id, callerName: 'Mrs Chen', duration: 0, reason: 'Appointment enquiry' })

      tickId = setInterval(() => {
        setCall((prev) =>
          prev && prev.id === id
            ? { ...prev, duration: Math.floor((Date.now() - startedAt) / 1000) }
            : prev,
        )
      }, 1000)

      cycleId = setTimeout(() => {
        if (tickId) clearInterval(tickId)
        setCall(null)
        cycleId = setTimeout(startCall, 15_000)
      }, 25_000)
    }

    startCall()

    return () => {
      if (tickId)  clearInterval(tickId)
      if (cycleId) clearTimeout(cycleId)
    }
  }, [demo])

  // ── Real data path ────────────────────────────────────────────────────────
  useEffect(() => {
    if (demo || !activeClinicId) return

    const supabase = createClient()
    let cancelled  = false
    let tickId:   ReturnType<typeof setInterval> | null = null

    // Seed from existing row if the page was refreshed mid-call.
    const seed = async () => {
      const staleCutoff = new Date(Date.now() - STALE_AFTER_MS).toISOString()
      const { data } = await supabase
        .from('active_calls')
        .select('*')
        .eq('clinic_id', activeClinicId)
        .eq('handled_by', 'STELLA')
        .gt('started_at', staleCutoff)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle<DbActiveCall>()

      if (cancelled) return
      if (data) {
        startedAtRef.current = new Date(data.started_at).getTime()
        setCall(toActiveCall(data))
      }
    }

    seed()

    // Local duration ticker — updates regardless of network traffic. If the
    // call has been "active" longer than MAX_CALL_DURATION_MS, we assume the
    // Twilio status webhook failed to fire and the row is stuck — clear it
    // locally so the user isn't stuck with a fake pulse forever.
    tickId = setInterval(() => {
      setCall((prev) => {
        if (!prev || startedAtRef.current == null) return prev
        const elapsed = Date.now() - startedAtRef.current
        if (elapsed > MAX_CALL_DURATION_MS) {
          startedAtRef.current = null
          return null
        }
        return { ...prev, duration: Math.floor(elapsed / 1000) }
      })
    }, 1000)

    // Realtime subscription — INSERT shows the pulse, DELETE hides it.
    const channel = supabase
      .channel(`active_calls:${activeClinicId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'active_calls',
          filter: `clinic_id=eq.${activeClinicId}`,
        },
        (payload) => {
          const row = payload.new as DbActiveCall
          if (row.handled_by !== 'STELLA') return
          startedAtRef.current = new Date(row.started_at).getTime()
          setCall(toActiveCall(row))
        },
      )
      .on(
        'postgres_changes',
        {
          event:  'DELETE',
          schema: 'public',
          table:  'active_calls',
          filter: `clinic_id=eq.${activeClinicId}`,
        },
        () => {
          startedAtRef.current = null
          setCall(null)
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      if (tickId) clearInterval(tickId)
      supabase.removeChannel(channel)
    }
  }, [demo, activeClinicId])

  return call
}
