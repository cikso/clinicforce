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
  type CoverageMode,
} from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'
import { MODE_CONFIG } from '@/components/dashboard/CoverageStatusCard'
import type { StatTrend } from '@/app/api/stats/route'

interface StatsResponse {
  callsCovered:   { today: number; trend: StatTrend }
  urgentFlagged:  { today: number; trend: StatTrend }
  unreadMessages: { today: number; trend: StatTrend }
  coverageActive: { todayMins: number; trend: StatTrend }
}

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export default function DashboardClient() {
  const [inbox,       setInbox]       = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [mode,        setMode]        = useState<CoverageMode | null>(null)
  const [activatedAt, setActivatedAt] = useState<string | null>(null)
  const [toasts,      setToasts]      = useState<ToastItem[]>([])
  const [stats,       setStats]       = useState<StatsResponse | null>(null)

  // ── Sync mode + stats from Supabase on mount ───────────────
  useEffect(() => {
    fetch(`/api/clinic/${DEMO_CLINIC_ID}/mode`)
      .then(r => r.json())
      .then((data: { mode: CoverageMode | null; activatedAt: string | null }) => {
        setMode(data.mode ?? null)
        setActivatedAt(data.activatedAt ?? null)
      })
      .catch(() => {})

    fetch('/api/stats')
      .then(r => r.json())
      .then((data: StatsResponse) => setStats(data))
      .catch(() => {})
  }, [])

  // ── Poll inbox every 30s ─────────────────────────────────────
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

  // ── KPIs — prefer server stats, fall back to client counts ──
  const callsCovered   = stats?.callsCovered.today   ?? inbox.length
  const urgentFlagged  = stats?.urgentFlagged.today  ?? inbox.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT').length
  const unreadMessages = stats?.unreadMessages.today ?? inbox.filter(i => i.status === 'UNREAD').length
  const coverageMins   = stats?.coverageActive.todayMins ?? COVERAGE_USAGE.reduce((s, u) => s + u.minutes, 0)
  const hoursActive    = (coverageMins / 60).toFixed(1)

  // ── Helpers ──────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const activatedAtLabel = activatedAt
    ? new Date(activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  // ── Mode handlers ─────────────────────────────────────────────
  const handleModeSelect = useCallback((newMode: CoverageMode) => {
    const now = new Date().toISOString()
    setMode(newMode)
    setActivatedAt(now)
    addToast(`${MODE_CONFIG[newMode].label} coverage active`, 'success')
    fetch(`/api/clinic/${DEMO_CLINIC_ID}/mode`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mode: newMode }),
    }).catch(() => {})
  }, [addToast])

  const handleDeactivate = useCallback(() => {
    setMode(null)
    setActivatedAt(null)
    addToast('Coverage deactivated — reception back online', 'info')
    fetch(`/api/clinic/${DEMO_CLINIC_ID}/mode`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mode: null }),
    }).catch(() => {})
  }, [addToast])

  // ── Inbox handlers ────────────────────────────────────────────
  const handleInboxMarkRead = useCallback((id: string) => {
    setInbox(prev => prev.map(i => i.id === id && i.status === 'UNREAD' ? { ...i, status: 'READ' } : i))
    fetch('/api/inbox', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status: 'READ' }),
    }).catch(() => {})
  }, [])

  const handleInboxAction = useCallback((id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => {
    const item = inbox.find(i => i.id === id)
    if (!item) return
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status: 'ACTIONED' } : i))
    fetch('/api/inbox', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status: 'ACTIONED' }),
    }).catch(() => {})
    if (action === 'CALL_BACK')      addToast(`Callback marked for ${item.callerName}`, 'success')
    else if (action === 'BOOK')      addToast(`Booking request logged for ${item.petName}`, 'success')
    else                             addToast(`Marked done — ${item.callerName}`, 'success')
  }, [inbox, addToast])

  return (
    <PageShell
      title="Coverage Overview"
      clinicName={INITIAL_COVERAGE_SESSION.clinicName}
      coverage={{
        status:    mode ? 'ACTIVE' : 'INACTIVE',
        mode,
        startTime: activatedAtLabel ?? undefined,
      }}
      onNewCase={mode ? handleDeactivate : undefined}
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
            trend={stats?.callsCovered.trend}
          />
          <KpiCard
            title="Urgent Flagged"
            value={urgentFlagged}
            context="need review"
            icon={<AlertTriangle className="w-4 h-4" />}
            accentColor="red"
            pulse={urgentFlagged > 0}
            trend={stats?.urgentFlagged.trend}
          />
          <KpiCard
            title="Unread Messages"
            value={unreadMessages}
            context="in inbox"
            icon={<MessageSquare className="w-4 h-4" />}
            accentColor="amber"
            pulse={unreadMessages > 0}
            trend={stats?.unreadMessages.trend}
          />
          <KpiCard
            title="Coverage Active"
            value={`${hoursActive}h`}
            context="today"
            icon={<Clock className="w-4 h-4" />}
            accentColor="slate"
            trend={stats?.coverageActive.trend}
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
              limit={4}
              viewAllHref="/calls"
            />
          </div>

          {/* Right: Coverage Control */}
          <div className="col-span-12 xl:col-span-4">
            <CoverageStatusCard
              mode={mode}
              activatedAtLabel={activatedAtLabel}
              onModeSelect={handleModeSelect}
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
