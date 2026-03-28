'use client'

import { useState, useCallback, useEffect } from 'react'
import PageShell from '@/components/layout/PageShell'
import KpiCard from '@/components/dashboard/KpiCard'
import CoverageStatusCard from '@/components/dashboard/CoverageStatusCard'
import InteractionsTable from '@/components/dashboard/InteractionsTable'
import FollowUpQueue from '@/components/dashboard/FollowUpQueue'
import HandoverSummary from '@/components/dashboard/HandoverSummary'
import ToastContainer from '@/components/dashboard/ToastContainer'
import {
  Phone, AlertTriangle, CheckCircle, MessageSquare, Clock, Radio,
} from 'lucide-react'
import {
  INITIAL_INTERACTIONS,
  INITIAL_FOLLOWUPS,
  INITIAL_HANDOVER,
  INITIAL_COVERAGE_SESSION,
  COVERAGE_USAGE,
  type CoveredInteraction,
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
  const [interactions, setInteractions] = useState<CoveredInteraction[]>(INITIAL_INTERACTIONS)
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOWUPS)
  const [handover, setHandover] = useState<HandoverItem[]>(INITIAL_HANDOVER)
  const [session, setSession] = useState<CoverageSession>(INITIAL_COVERAGE_SESSION)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // Poll live calls from Supabase every 30s
  const fetchLiveData = useCallback(() => {
    fetch('/api/calls')
      .then(r => r.json())
      .then((live: CoveredInteraction[]) => {
        if (!Array.isArray(live) || live.length === 0) return
        setInteractions(live)
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
  const callsCovered     = interactions.length
  const urgentFlagged    = interactions.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT').length
  const routineHandled   = interactions.filter(i => i.urgency === 'ROUTINE' && i.status === 'HANDLED').length
  const callbacksNeeded  = followUps.filter(i => i.type === 'URGENT_CALLBACK' || i.type === 'ROUTINE_CALLBACK').length
  const messagesCaptured = interactions.filter(i => i.status !== 'ESCALATED').length
  const totalMins        = COVERAGE_USAGE.reduce((s, u) => s + u.minutes, 0)
  const hoursActive      = (totalMins / 60).toFixed(1)

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
    setSession(prev => ({
      ...prev, status: 'ACTIVE', reason,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 0,
    }))
    logHandover(`Coverage activated — ${REASON_LABELS[reason]}.`, 'coverage')
    addToast(`VetDesk is now active — ${REASON_LABELS[reason]}`, 'success')
  }, [logHandover, addToast])

  const handleDeactivate = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'INACTIVE' }))
    logHandover('Coverage ended. Reception back online.', 'coverage')
    addToast('Coverage ended — reception back online', 'info')
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
      <div className="space-y-6">

        {/* ── KPI Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Calls Covered"
            value={callsCovered}
            context="today"
            icon={<Phone className="w-4 h-4" />}
            accentColor="blue"
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
            title="Routine Handled"
            value={routineHandled}
            context="resolved"
            icon={<CheckCircle className="w-4 h-4" />}
            accentColor="teal"
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
            title="Messages Captured"
            value={messagesCaptured}
            context="logged"
            icon={<Radio className="w-4 h-4" />}
            accentColor="slate"
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
        <div className="grid grid-cols-12 gap-5">

          {/* Left: Today's Covered Calls */}
          <div className="col-span-12 xl:col-span-8">
            <InteractionsTable
              interactions={interactions}
              onSelect={setSelectedId}
              selectedId={selectedId}
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
