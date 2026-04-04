'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, Phone, AlertTriangle, CheckCheck, Clock } from 'lucide-react'
import PageShell from '@/components/layout/PageShell'
import { INITIAL_INBOX, type CallInboxItem } from '@/data/mock-dashboard'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Stats {
  callsCovered:   { today: number; yesterday: number; trend: { direction: string | null; label: string | null } }
  urgentFlagged:  { today: number; yesterday: number; trend: { direction: string | null; label: string | null } }
  unreadMessages: { today: number; yesterday: number; trend: { direction: string | null; label: string | null } }
  coverageActive: { todayMins: number; yesterdayMins: number; trend: { direction: string | null; label: string | null } }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TrendIcon({ direction }: { direction: string | null }) {
  if (direction === 'up')   return <TrendingUp   className="w-3.5 h-3.5 text-emerald-500" />
  if (direction === 'down') return <TrendingDown  className="w-3.5 h-3.5 text-red-400" />
  return <Minus className="w-3.5 h-3.5 text-slate-300" />
}

function fmtMins(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function pct(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend,
}: {
  label: string; value: string; sub?: string; trend: { direction: string | null; label: string | null }
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-[0_1px_3px_rgba(15,39,68,0.04)]">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-5xl font-bold leading-none tracking-tight text-slate-900 mb-1">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mb-2">{sub}</p>}
      {trend.label && (
        <div className="flex items-center gap-1 mt-2">
          <TrendIcon direction={trend.direction} />
          <span className="text-[11px] text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

// ── Urgency bar ───────────────────────────────────────────────────────────────

function UrgencyBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const width = pct(count, total)
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-[12px] text-slate-500 font-medium text-right flex-shrink-0">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: color }} />
      </div>
      <div className="w-12 text-[12px] text-slate-700 font-semibold tabular-nums">{count} <span className="font-normal text-slate-400">({width}%)</span></div>
    </div>
  )
}

// ── Recent call row ───────────────────────────────────────────────────────────

function RecentRow({ item }: { item: CallInboxItem }) {
  const urgencyColor =
    item.urgency === 'CRITICAL' ? 'text-red-600 bg-red-50 border-red-200' :
    item.urgency === 'URGENT'   ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                  'text-slate-500 bg-slate-100 border-slate-200'
  const statusColor =
    item.status === 'ACTIONED' ? 'text-emerald-600' :
    item.status === 'UNREAD'   ? 'text-[#1D9E75] font-semibold' :
                                 'text-slate-400'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${urgencyColor}`}>
        {item.urgency === 'CRITICAL' ? 'Critical' : item.urgency === 'URGENT' ? 'Urgent' : 'Routine'}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-medium text-slate-800">{item.callerName}</span>
        {item.petName !== '—' && (
          <span className="text-[11px] text-slate-400"> · {item.petName}</span>
        )}
      </div>
      <span className={`text-[11px] flex-shrink-0 ${statusColor}`}>
        {item.status === 'ACTIONED' ? 'Done' : item.status === 'UNREAD' ? 'New' : 'Reviewed'}
      </span>
      <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums w-14 text-right">{item.createdAt}</span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const FALLBACK_STATS: Stats = {
  callsCovered:   { today: 0, yesterday: 0, trend: { direction: null, label: null } },
  urgentFlagged:  { today: 0, yesterday: 0, trend: { direction: null, label: null } },
  unreadMessages: { today: 0, yesterday: 0, trend: { direction: null, label: null } },
  coverageActive: { todayMins: 0, yesterdayMins: 0, trend: { direction: null, label: null } },
}

export default function InsightsPage() {
  const [stats, setStats] = useState<Stats>(FALLBACK_STATS)
  const [inbox, setInbox] = useState<CallInboxItem[]>(INITIAL_INBOX)

  const fetchAll = useCallback(async () => {
    const [statsRes, inboxRes] = await Promise.allSettled([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/inbox').then(r => r.json()),
    ])
    if (statsRes.status === 'fulfilled' && statsRes.value?.callsCovered) {
      setStats(statsRes.value)
    }
    if (inboxRes.status === 'fulfilled' && Array.isArray(inboxRes.value) && inboxRes.value.length > 0) {
      setInbox(inboxRes.value)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  // ── Computed ────────────────────────────────────────────────────
  const total     = inbox.length
  const critical  = inbox.filter(i => i.urgency === 'CRITICAL').length
  const urgent    = inbox.filter(i => i.urgency === 'URGENT').length
  const routine   = inbox.filter(i => i.urgency === 'ROUTINE').length
  const actioned  = inbox.filter(i => i.status === 'ACTIONED').length
  const unread    = inbox.filter(i => i.status === 'UNREAD').length
  const actionPct = pct(actioned, total)

  // Coverage score (0–100): actioned% weighted 40%, no-critical-unread 40%, coverage mins 20%
  const criticalUnread = inbox.filter(i => i.urgency === 'CRITICAL' && i.status === 'UNREAD').length
  const criticalScore  = criticalUnread === 0 ? 40 : Math.max(0, 40 - criticalUnread * 10)
  const covMins        = stats.coverageActive.todayMins
  const covScore       = Math.min(20, Math.round(covMins / 3))
  const healthScore    = Math.min(100, Math.round(actionPct * 0.4) + criticalScore + covScore)

  const scoreColor =
    healthScore >= 80 ? '#1D9E75' :
    healthScore >= 50 ? '#D97706' : '#DC2626'

  return (
    <PageShell title="Insights" subtitle="Call analytics and clinic performance at a glance">

      {/* ── Top stat cards ────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Calls handled"
          value={String(stats.callsCovered.today || total)}
          trend={stats.callsCovered.trend}
        />
        <StatCard
          label="Urgent flags"
          value={String(stats.urgentFlagged.today || (critical + urgent))}
          trend={stats.urgentFlagged.trend}
        />
        <StatCard
          label="Unread"
          value={String(stats.unreadMessages.today || unread)}
          trend={stats.unreadMessages.trend}
        />
        <StatCard
          label="Coverage"
          value={fmtMins(covMins)}
          sub="active today"
          trend={stats.coverageActive.trend}
        />
      </div>

      {/* ── Middle row ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-4">

        {/* Urgency breakdown */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,39,68,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-slate-800">Urgency breakdown</h3>
            <span className="text-[11px] text-slate-400">{total} total calls</span>
          </div>
          {total === 0 ? (
            <p className="text-[12px] text-slate-400 text-center py-4">No call data yet</p>
          ) : (
            <div className="space-y-3">
              <UrgencyBar label="Critical" count={critical} total={total} color="#DC2626" />
              <UrgencyBar label="Urgent"   count={urgent}   total={total} color="#D97706" />
              <UrgencyBar label="Routine"  count={routine}  total={total} color="#1D9E75" />
            </div>
          )}

          {/* Resolution row */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Actioned</p>
              <p className="text-xl font-bold text-slate-900">{actioned}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Unread</p>
              <p className="text-xl font-bold text-slate-900">{unread}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Resolution rate</p>
              <p className="text-xl font-bold text-slate-900">{actionPct}%</p>
            </div>
          </div>
        </div>

        {/* Health score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,39,68,0.04)] flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Clinic Health Score</p>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 mb-3"
            style={{ borderColor: scoreColor }}
          >
            <span className="text-3xl font-bold" style={{ color: scoreColor }}>{healthScore}</span>
          </div>
          <p className="text-[12px] text-slate-500">
            {healthScore >= 80 ? 'Excellent — queue well managed'
              : healthScore >= 50 ? 'Good — a few items need attention'
              : 'Needs attention — urgent items pending'}
          </p>
          <div className="mt-4 w-full space-y-2 text-left">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> Resolution</span>
              <span className="font-semibold text-slate-700">{actionPct}%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Critical unread</span>
              <span className={`font-semibold ${criticalUnread > 0 ? 'text-red-600' : 'text-slate-700'}`}>{criticalUnread}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Coverage today</span>
              <span className="font-semibold text-slate-700">{fmtMins(covMins)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent calls table ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,39,68,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-slate-800">Recent calls</h3>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] text-slate-400">{inbox.length} total</span>
          </div>
        </div>
        {inbox.length === 0 ? (
          <p className="text-[12px] text-slate-400 text-center py-6">No calls recorded yet</p>
        ) : (
          <div>
            {inbox.slice(0, 10).map(item => (
              <RecentRow key={item.id} item={item} />
            ))}
            {inbox.length > 10 && (
              <p className="text-[11px] text-slate-400 text-center pt-3">
                +{inbox.length - 10} more calls in Call Inbox
              </p>
            )}
          </div>
        )}
      </div>

    </PageShell>
  )
}
