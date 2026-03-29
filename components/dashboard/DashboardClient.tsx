'use client'

import { useState, useCallback, useEffect } from 'react'
import PageShell from '@/components/layout/PageShell'
import KpiCard from '@/components/dashboard/KpiCard'
import CoverageStatusCard from '@/components/dashboard/CoverageStatusCard'
import CallInbox from '@/components/dashboard/CallInbox'
import ToastContainer from '@/components/dashboard/ToastContainer'
import { Phone, AlertTriangle, MessageSquare, Clock } from 'lucide-react'
import {
  INITIAL_INBOX,
  INITIAL_COVERAGE_SESSION,
  COVERAGE_USAGE,
  type CallInboxItem,
  type CoverageSession,
  type CoverageReason,
} from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'

const REASON_LABELS: Record<CoverageReason, string> = {
  LUNCH_BREAK:  'Lunch Break',
  MEETING:      'Team Meeting',
  SICK_LEAVE:   'Sick Leave',
  OVERFLOW:     'Overflow Period',
  AFTER_HOURS:  'After Hours',
  MORNING_RUSH: 'Morning Rush',
}

export default function DashboardClient() {
  const [inbox, setInbox]   = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [session, setSession] = useState<CoverageSession>(INITIAL_COVERAGE_SESSION)
  const [toasts, setToasts]   = useState<ToastItem[]>([])

  // ── Sync coverage state from Supabase on mount ───────────────
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

  // ── Poll inbox from Supabase every 30s ───────────────────────
  const fetchInbox = useCallback(() => {
    fetch('/api/inbox')
      .then(r => r.json())
      .then((live: CallInboxItem[]) => {
        if (Array.isArray(live) && live.length > 0) setInbox(live)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchInbox()
    const interval = setInterval(fetchInbox, 30_000)
    return () => clearInterval(interval)
  }, [fetchInbox])

  // ── KPIs ─────────────────────────────────────────────────────
  const callsCovered   = inbox.length
  const urgentFlagged  = inbox.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT').length
  const unreadMessages = inbox.filter(i => i.status === 'UNREAD').length
  const totalMins      = COVERAGE_USAGE.reduce((s, u) => s + u.minutes, 0)
  const hoursActive    = (totalMins / 60).toFixed(1)

  // ── Helpers ──────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  // ── Coverage handlers ─────────────────────────────────────────
  const handleActivate = useCallback((reason: CoverageReason) => {
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setSession(prev => ({ ...prev, status: 'ACTIVE', reason, startTime, durationMinutes: 0 }))
    addToast(`VetForce is now active — ${REASON_LABELS[reason]}`, 'success')
    fetch('/api/coverage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }).catch(() => console.warn('[coverage] Failed to persist activation'))
  }, [addToast])

  const handleDeactivate = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'INACTIVE' }))
    addToast('Coverage ended — reception back online', 'info')
    fetch('/api/coverage', { method: 'DELETE' })
      .catch(() => console.warn('[coverage] Failed to persist deactivation'))
  }, [addToast])

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
      addToast(`Callback marked for ${item.callerName}`, 'success')
    } else if (action === 'BOOK') {
      addToast(`Booking request logged for ${item.petName}`, 'success')
    } else {
      addToast(`Marked done — ${item.callerName}`, 'success')
    }
  }, [inbox, addToast])

  return (
    <PageShell
      title="Coverage Overview"
      clinicName={session.clinicName}
      coverage={{
        status:    session.status,
        reason:    session.reason,
        startTime: session.status === 'ACTIVE' ? session.startTime : undefined,
      }}
      onNewCase={session.status === 'ACTIVE' ? handleDeactivate : undefined}
    >
      <div className="space-y-5">

        {/* ── KPI Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            context="in inbox"
            icon={<MessageSquare className="w-4 h-4" />}
            accentColor="amber"
            pulse={unreadMessages > 0}
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

          {/* Right: Coverage Control */}
          <div className="col-span-12 xl:col-span-4">
            <CoverageStatusCard
              session={session}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
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
