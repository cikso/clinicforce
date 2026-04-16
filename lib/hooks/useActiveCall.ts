'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export interface ActiveCall {
  id:         string
  callerName: string
  /** Seconds since the call started. Updates every second while the call is active. */
  duration:   number
  /** Optional — e.g. 'Appointment enquiry', 'Urgent symptom'. */
  reason?:    string
}

/**
 * Returns the currently-active (in-progress) call handled by Stella, or null.
 *
 * Wiring plan:
 *   1. When the Twilio webhook fires (app/api/twilio/incoming/route.ts), write
 *      an `active_calls` row with `{ clinic_id, caller_name, started_at, status }`.
 *   2. Subscribe to realtime `INSERT` / `DELETE` on `active_calls` here.
 *   3. Delete the row on the `/api/twilio/status` (completed) callback.
 *
 * Demo mode: add `?demo=call` to the URL to simulate a live call for 25s,
 * then idle for 15s, on repeat. Used during design/QA; safe in production.
 */
export function useActiveCall(): ActiveCall | null {
  const searchParams = useSearchParams()
  const demo         = searchParams?.get('demo') === 'call'

  const [call, setCall] = useState<ActiveCall | null>(null)

  // Demo loop — only runs when ?demo=call is present.
  useEffect(() => {
    if (!demo) {
      setCall(null)
      return
    }

    let tickId:   ReturnType<typeof setInterval> | null = null
    let cycleId:  ReturnType<typeof setTimeout>  | null = null

    const startCall = () => {
      const id = `demo-${Date.now()}`
      const startedAt = Date.now()
      setCall({ id, callerName: 'Mrs Chen', duration: 0, reason: 'Appointment enquiry' })

      tickId = setInterval(() => {
        setCall((prev) =>
          prev && prev.id === id
            ? { ...prev, duration: Math.floor((Date.now() - startedAt) / 1000) }
            : prev,
        )
      }, 1000)

      // End after 25s
      cycleId = setTimeout(() => {
        if (tickId) clearInterval(tickId)
        setCall(null)
        // Restart after 15s idle
        cycleId = setTimeout(startCall, 15_000)
      }, 25_000)
    }

    startCall()

    return () => {
      if (tickId)  clearInterval(tickId)
      if (cycleId) clearTimeout(cycleId)
    }
  }, [demo])

  return call
}
