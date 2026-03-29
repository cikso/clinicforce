'use client'

import { useState, useCallback, useEffect } from 'react'
import PageShell from '@/components/layout/PageShell'
import KpiCard from '@/components/dashboard/KpiCard'
import CoverageStatusCard from '@/components/dashboard/CoverageStatusCard'
import CallInbox from '@/components/dashboard/CallInbox'
import FollowUpQueue from '@/components/dashboard/FollowUpQueue'
import HandoverSummary from '@/components/dashboard/HandoverSummary'
import ToastContainer from '@/components/dashboard/ToastContainer'
import {
  Phone, AlertTriangle, MessageSquare, Clock,
} from 'lucide-react'
import {
  INITIAL_INBOX,
  INITIAL_FOLLOWUPS,
  INITIAL_HANDOVER,
  INITIAL_COVERAGE_SESSION,
  COVERAGE_USAGE,
  type CallInboxItem,
  type FollowUpItem,
  type HandoverItem,
  type CoverageSession,
  type CoverageReason,
  type HandoverType,
} from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'

const REASON_LABELS: Record<CoverageReason, string> = {
  LUNCH_BREAK: 'Lunch Break',
  MEETING: 'Team Meeting',
  SICK_LEAVE: 'Sick Leave',
  OVERFLOW: 'Overflow Period',
  AFTER_HOURS: 'After Hours',
  MORNING_RUSH: 'Morning Rush',
}

export default function DashboardClient() {
  const [inbox, setInbox]       = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOWUPS)
  const [handover, setHandover] = useState<HandoverItem[]>(INITIAL_HANDOVER)
  const [session, setSession]   = useState<CoverageSession>(INITIAL_COVERAGE_SESSION)
  const [toasts, setToasts]     = useState<ToastItem[]>([])

  // ── Sync coverage state with Supabase on mount ───────────────
  useEffect(() => {
    fetch('/api/coverage')
      .then(r => r.json())
      .then((data: { status: string; reason: string; started_at: string }) => {
        if (data?.status === 'ACTIVE') {
          setSession(prev => ({
            ...prev,
            status: 'ACTIVE',
            reason: (data.reason as CoverageReason) ?? prev.reason,
            startTime: data.started_at
              ? new Date(data.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : prev.startTime,
          }))
        } else {
          setSession(prev => ({ ...prev, status: 'INACTIVE' }))
        }
      })
      .catch(() => {})
  }, [])

  // Poll inbox + follow-ups from Supabase every 30s
  const fetchLiveData = useCallback(() => {
    fetch('/api/inbox')
      .then(r => r.json())
      .then((live: CallInboxItem[]) => {
        if (!Array.isArray(live) || live.length === 0) return
        setInbox(live)
      })
      .catch(() => {})

    fetch('/api/callback')
      .then(r => r.json())
      .then((live: FollowUpItem[]) => {
        if (!Array.isArray(live) || live.length === 0) return
        setFollowUps(prev => {
          const existingIds = new Set(prev.map(f => f.id))
          const fresh = live.filter(f => !existingIds.has(f.id))
          return fresh.length > 0 ? [...fresh, ...prev] : prev
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 30_000)
    return () => clearInterval(interval)
  }, [fetchLiveData])

  // ── KPIs ─────────────────────────────────────────────────────
  const callsCovered    = inbox.length
  const urgentFlagged   = inbox.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT').length
  const unreadMessages  = inbox.filter(i => i.status === 'UNREAD').length
  const callbacksNeeded = followUps.filter(i => i.type === 'URGENT_CALLBACK' || i.type === 'ROUTINE_CALLBACK').length
  const totalMins       = COVERAGE_USAGE.reduce((s, u) => s + u.minutes, 0)
  const hoursActive     = (totalMins / 60).toFixed(1)

  // ── Helpers ──────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const logHandover = useCallback((message: string, type: HandoverType) => {
    const item: HandoverItem = { id: `h-${Date.now()}`, message, timestamp: new Date(), type }
    setHandover(prev => [item, ...prev].slice(0, 20))
  }, [])

  const handleActivate = useCallback((reason: CoverageReason) => {
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Update local state immediately for instant UI response
    setSession(prev => ({ ...prev, status: 'ACTIVE', reason, startTime, durationMinutes: 0 }))
    logHandover(`Coverage activated — ${REASON_LABELS[reason]}.`, 'coverage')
    addToast(`VetForce is now active — ${REASON_LABELS[reason]}`, 'success')

    // Persist to Supabase → Twilio will read this on the next incoming call
    fetch('/api/coverage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }).catch(() => {
      // Non-fatal: UI already updated, log silently
      console.warn('[coverage] Failed to persist activation to Supabase')
    })
  }, [logHandover, addToast])

  const handleDeactivate = useCallback(() => {
    // Update local state immediately
    setSession(prev => ({ ...prev, status: 'INACTIVE' }))
    logHandover('Coverage ended. Reception back online.', 'coverage')
    addToast('Coverage ended — reception back online', 'info')

    // Persist to Supabase → next Twilio call will route to real number
    fetch('/api/coverage', { method: 'DELETE' }).catch(() => {
      console.warn('[coverage] Failed to persist deactivation to Supabase')
    })
  }, [logHandover, addToast])

  const handleFollowUpAction = useCallback((id: string, action: string) => {
    const item = followUps.find(f => f.id === id)
    if (!item) return
    if (action === 'BOOK') {
      setFollowUps(prev => prev.filter(f => f.id !== id))
      logHandover(`Booking confirmed — ${item.callerName} / ${item.petName}`, 'booking')
      addToast(`Booking confirmed for ${item.petName}`, 'success')
    } else if (action === 'CALL_BACK') {
      setFollowUps(prev => prev.filter(f => f.id !== id))
      logHandover(`Callback complete — ${item.callerName}`, 'callback')
      addToast(`Callback marked complete — ${item.callerName}`, 'success')
    }
  }, [followUps, logHandover, addToast])

  // ── Inbox handlers ────────────────────────────────────────────
  const handleInboxMarkRead = useCallback((id: string) => {
    setInbox(prev => prev.map(i => i.id === id && i.status === 'UNREAD' ? { ...i, status: 'READ' } : i))
    fetch('/api/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'READ' }),
    }).catch(() => {})
  }, [])

  const handleInboxAction = useCallback((id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => {
    const item = inbox.find(i => i.id === id)
    if (!item) return
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status: 'ACTIONED' } : i))
    fetch('/api/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'ACTIONED' }),
    }).catch(() => {})
    if (action === 'CALL_BACK') {
      logHandover(`Callback actioned — ${item.callerName} / ${item.petName}`, 'callback')
      addToast(`Callback marked for ${item.callerName}`, 'success')
    } else if (action === 'BOOK') {
      logHandover(`Booking requested — ${item.callerName} / ${item.petName}`, 'booking')
      addToast(`Booking request logged for ${item.petName}`, 'success')
    } else {
      logHandover(`Message actioned — ${item.callerName}`, 'handled')
      addToast(`Marked done — ${item.callerName}`, 'success')
    }
  }, [inbox, logHandover, addToast])

  return (
    <PageShell
      title="Coverage Overview"
      clinicName={session.clinicName}
      coverage={{
        status: session.status,
        reason: session.reason,
        startTime: session.status === 'ACTIVE' ? session.startTime : undefined,
      }}
      onNewCase={session.status === 'ACTIVE' ? handleDeactivate : undefined}
    >
      <div className="space-y-5">

        {/* ── KPI Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <KpiCard
            title="Calls Covered"
            value={callsCovered}
            context="today"
            icon={<Phone className="w-4 h-4" />}
            accentColor="teal"
          />
          <KpiCard
            title="Urgent Flagged"
            value={urgentFlagged}
            context="need review"
            icon={<AlertTriangle className="w-4 h-4" />}
            accentColor="red"
            pulse={urgentFlagged > 0}
          />
          <KpiCard
            title="Unread Messages"
            value={unreadMessages}
            context="need review"
            icon={<MessageSquare className="w-4 h-4" />}
            accentColor="green"
            pulse={unreadMessages > 0}
          />
          <KpiCard
            title="Callbacks Needed"
            value={callbacksNeeded}
            context="awaiting"
            icon={<MessageSquare className="w-4 h-4" />}
            accentColor="amber"
            pulse={callbacksNeeded > 0}
          />
          <KpiCard
            title="Coverage Active"
            value={`${hoursActive}h`}
            context="today"
            icon={<Clock className="w-4 h-4" />}
            accentColor="slate"
          />
        </div>

        {/* ── Main Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Left: Call Inbox */}
          <div className="col-span-12 xl:col-span-8">
            <CallInbox
              items={inbox}
              onAction={handleInboxAction}
              onMarkRead={handleInboxMarkRead}
            />
          </div>

          {/* Right: Coverage Control + Follow-Up + Handover */}
          <div className="col-span-12 xl:col-span-4 space-y-4">
            <CoverageStatusCard
              session={session}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
            <FollowUpQueue
              items={followUps}
              onAction={handleFollowUpAction}
            />
            <HandoverSummary
              items={handover}
              sessionStart={session.startTime}
              sessionReason={REASON_LABELS[session.reason]}
            />
          </div>

        </div>
      </div>

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </PageShell>
  )
}
