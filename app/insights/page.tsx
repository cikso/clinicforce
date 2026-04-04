'use client'

import { useState } from 'react'
import {
  BarChart3, LayoutDashboard, Inbox, ListChecks, Settings, Users,
  Phone, Calendar, Bell, Search, Download, TrendingUp, TrendingDown,
  ChevronDown, MapPin, Activity, Clock, Zap, Target, BookOpen,
  MessageSquare, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import Link from 'next/link'

// ── Mock Data ─────────────────────────────────────────────────────────────────

const AREA_DATA = [
  { day: 'Mon', handled: 72, transferred: 8 },
  { day: 'Tue', handled: 88, transferred: 5 },
  { day: 'Wed', handled: 95, transferred: 12 },
  { day: 'Thu', handled: 81, transferred: 7 },
  { day: 'Fri', handled: 104, transferred: 10 },
  { day: 'Sat', handled: 63, transferred: 4 },
  { day: 'Sun', handled: 44, transferred: 3 },
]

const CALL_REASONS = [
  { label: 'Appointment booking',   count: 189, max: 250 },
  { label: 'Prescription refill',   count: 134, max: 250 },
  { label: 'Test results enquiry',  count: 98,  max: 250 },
  { label: 'Emergency triage',      count: 76,  max: 250 },
  { label: 'Post-op follow-up',     count: 61,  max: 250 },
  { label: 'General enquiry',       count: 54,  max: 250 },
  { label: 'Billing question',      count: 35,  max: 250 },
]

const AI_PERFORMANCE = [
  { label: 'Intent recognition',   pct: 96 },
  { label: 'Triage accuracy',      pct: 91 },
  { label: 'Booking conversion',   pct: 71 },
  { label: 'Caller satisfaction',  pct: 88 },
  { label: 'First call resolution',pct: 83 },
]

// 7 days × 11 hours (8am–6pm)
const DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS   = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm']
const HEATMAP = [
  [2,  8,  14, 18, 12, 10, 7,  9,  11, 6,  2],  // Mon
  [3,  11, 19, 22, 15, 13, 10, 14, 12, 8,  3],  // Tue
  [4,  13, 21, 25, 18, 15, 12, 16, 14, 9,  4],  // Wed
  [3,  10, 17, 20, 14, 12, 9,  13, 11, 7,  3],  // Thu
  [5,  14, 22, 26, 20, 17, 13, 15, 16, 10, 5],  // Fri
  [1,  5,  9,  11, 8,  6,  5,  6,  7,  4,  1],  // Sat
  [1,  3,  6,  7,  5,  4,  3,  4,  4,  2,  1],  // Sun
]
const MAX_HEAT = 26

const MISSED_OPPORTUNITIES = [
  { caller: 'Emma Richardson', reason: 'Long wait — hung up', time: '2h ago', value: '$180' },
  { caller: 'James Whitfield', reason: 'Voicemail — no callback', time: '3h ago', value: '$240' },
  { caller: 'Sophie Turner',   reason: 'After-hours — missed', time: '5h ago', value: '$120' },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Overview',     href: '/overview',     icon: LayoutDashboard, active: false },
  { label: 'Call Inbox',   href: '/calls',         icon: Inbox,           active: false },
  { label: 'Action Queue', href: '/referrals',    icon: ListChecks,      active: false },
  { label: 'Insights',     href: '/insights',     icon: BarChart3,       active: true  },
]
const ADMIN_ITEMS = [
  { label: 'Team',     href: '/users',    icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

function InsightsSidebar() {
  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen overflow-y-auto" style={{ background: '#0f1729', borderRight: '1px solid #1e2d4a' }}>

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid #1e2d4a' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0">
          <circle cx="16" cy="16" r="15" fill="#0D9488"/>
          <path d="M8 16 Q11 10 14 16 Q17 22 20 16 Q23 10 24 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
        <div className="min-w-0">
          <h1 className="font-semibold text-lg text-white leading-snug">VetForce</h1>
          <p className="text-xs truncate mt-px" style={{ color: '#6b7fa3' }}>Happy Paws</p>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-2 pt-5 pb-2">
        <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest select-none" style={{ color: '#3d5070' }}>
          Workspace
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className="mx-2 group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={active
                ? { background: 'rgba(13,148,136,0.18)', color: '#4fd1c5', fontWeight: 600 }
                : { color: '#6b7fa3', fontWeight: 500 }
              }
            >
              <Icon
                className="w-4 h-4 shrink-0 transition-colors"
                style={{ color: active ? '#4fd1c5' : '#3d5070' }}
              />
              {label}
            </Link>
          ))}
        </div>

        {/* Admin */}
        <p className="px-3 mt-6 mb-2 text-[9px] font-bold uppercase tracking-widest select-none" style={{ color: '#3d5070' }}>
          Admin
        </p>
        <div className="space-y-0.5">
          {ADMIN_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="mx-2 group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={{ color: '#6b7fa3', fontWeight: 500 }}
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: '#3d5070' }} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Clinic card */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid #1e2d4a', paddingTop: '1rem' }}>
        <div className="rounded-xl p-3" style={{ background: '#1a2844' }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            {/* Dog avatar */}
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg" style={{ background: '#0f3460' }}>
              🐕
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">Happy Paws Vet</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5" style={{ color: '#6b7fa3' }} />
                <span className="text-[10px]" style={{ color: '#6b7fa3' }}>Brisbane, QLD</span>
              </div>
            </div>
          </div>
          <button
            className="w-full text-[11px] font-semibold py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'rgba(13,148,136,0.2)', color: '#4fd1c5', border: '1px solid rgba(13,148,136,0.3)' }}
          >
            Change clinic
          </button>
        </div>
      </div>

    </aside>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, iconBg, iconColor, trend, trendLabel,
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; iconBg: string; iconColor: string
  trend: 'up' | 'down' | 'neutral'; trendLabel: string
}) {
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8'
  const TrendArrow = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <div className="flex items-center gap-1" style={{ color: trendColor }}>
          {TrendArrow && <TrendArrow className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-semibold">{trendLabel}</span>
        </div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>{label}</p>
      <p className="text-3xl font-bold tracking-tight text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg text-[12px]">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Heatmap cell intensity ────────────────────────────────────────────────────

function heatColor(val: number, max: number): string {
  const t = val / max
  if (t === 0) return '#f1f5f9'
  if (t < 0.2) return '#ccfbf1'
  if (t < 0.4) return '#5eead4'
  if (t < 0.6) return '#14b8a6'
  if (t < 0.8) return '#0d9488'
  return '#0f766e'
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState('Last 7 Days')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <InsightsSidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* ── Header ───────────────────────────────────────────── */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Left: title */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Insights</h1>
              <p className="text-[12px] text-slate-400 mt-0.5">AI performance analytics and clinic call intelligence</p>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  className="text-[12px] bg-transparent outline-none text-slate-600 w-28 placeholder-slate-400"
                />
              </div>

              {/* Bell */}
              <div className="relative">
                <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Bell className="w-4 h-4 text-slate-500" />
                </button>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
              </div>

              {/* User */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: '#0d9488' }}>
                  SJ
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 leading-tight">Sarah Johnson</p>
                  <p className="text-[10px] text-slate-400">Practice Manager</p>
                </div>
              </div>

              {/* Date range */}
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setDateRange(r => r === 'Last 7 Days' ? 'Last 30 Days' : 'Last 7 Days')}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {dateRange}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Export */}
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white transition-opacity hover:opacity-90" style={{ background: '#0d9488' }}>
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </header>

        {/* ── Scrollable body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── 6 KPI cards ────────────────────────────────────── */}
          <div className="grid grid-cols-6 gap-3">
            <KpiCard label="Total Calls"       value="647"   sub="this period"    icon={Phone}         iconBg="#f0fdf4" iconColor="#16a34a" trend="up"      trendLabel="+12%" />
            <KpiCard label="Appointments"      value="89"    sub="booked via AI"  icon={Calendar}      iconBg="#eff6ff" iconColor="#3b82f6" trend="up"      trendLabel="+8%"  />
            <KpiCard label="Urgent Cases"      value="32"    sub="flagged today"  icon={AlertTriangle} iconBg="#fef2f2" iconColor="#ef4444" trend="down"    trendLabel="-3%"  />
            <KpiCard label="Avg Handle Time"   value="4.6m"  sub="per call"       icon={Clock}         iconBg="#faf5ff" iconColor="#9333ea" trend="neutral" trendLabel="—"    />
            <KpiCard label="AI Containment"    value="96%"   sub="fully resolved" icon={Zap}           iconBg="#f0fdf4" iconColor="#0d9488" trend="up"      trendLabel="+2%"  />
            <KpiCard label="Booking Conv."     value="71%"   sub="call to booking"icon={Target}        iconBg="#fff7ed" iconColor="#ea580c" trend="up"      trendLabel="+5%"  />
          </div>

          {/* ── 3-column middle row ─────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Area chart — span 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-800">Call Volume Trend</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">AI handled vs transferred</p>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#0d9488' }} />AI Handled</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-slate-300" />Transferred</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={AREA_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradHandled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradTransfer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.2}  />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="handled"    name="AI Handled"  stroke="#0d9488" strokeWidth={2} fill="url(#gradHandled)"  dot={false} />
                  <Area type="monotone" dataKey="transferred" name="Transferred" stroke="#94a3b8" strokeWidth={1.5} fill="url(#gradTransfer)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top call reasons — span 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
              <div className="mb-4">
                <h3 className="text-[13px] font-semibold text-slate-800">Top Call Reasons</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Volume by intent category</p>
              </div>
              <div className="space-y-3">
                {CALL_REASONS.map(({ label, count, max }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-slate-600 truncate pr-2">{label}</span>
                      <span className="text-[11px] font-bold text-slate-800 tabular-nums flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((count / max) * 100)}%`, background: '#0d9488' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — 3 stacked cards */}
            <div className="space-y-3">

              {/* Missed Opportunity Monitor */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-semibold text-slate-800">Missed Opportunities</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                    {MISSED_OPPORTUNITIES.length} today
                  </span>
                </div>
                <div className="space-y-2.5">
                  {MISSED_OPPORTUNITIES.map(({ caller, reason, time, value }) => (
                    <div key={caller} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Phone className="w-3 h-3 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-800 truncate">{caller}</p>
                        <p className="text-[10px] text-slate-400">{reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-semibold text-slate-700">{value}</p>
                        <p className="text-[10px] text-slate-400">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage Performance */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
                <h3 className="text-[12px] font-semibold text-slate-800 mb-3">Coverage Performance</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl py-2.5">
                    <p className="text-lg font-bold text-slate-900">98%</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Uptime</p>
                  </div>
                  <div className="rounded-xl py-2.5" style={{ background: 'rgba(13,148,136,0.08)' }}>
                    <p className="text-lg font-bold" style={{ color: '#0d9488' }}>6.2h</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Active</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl py-2.5">
                    <p className="text-lg font-bold text-slate-900">14s</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Avg wait</p>
                  </div>
                </div>
              </div>

              {/* Weekly summary */}
              <div className="rounded-2xl p-4 shadow-[0_1px_4px_rgba(15,39,68,0.06)]" style={{ background: '#0f1729', border: '1px solid #1e2d4a' }}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: '#4fd1c5' }} />
                  <h3 className="text-[12px] font-semibold text-white">Weekly Summary</h3>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#6b7fa3' }}>
                  AI handled <span className="text-white font-semibold">547</span> of <span className="text-white font-semibold">647</span> calls this week.
                  Booking conversion improved by <span style={{ color: '#4fd1c5' }} className="font-semibold">+5%</span>.
                  Urgent triage response time averaged <span className="text-white font-semibold">22 seconds</span>.
                </p>
              </div>

            </div>
          </div>

          {/* ── 2-column lower row ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 pb-2">

            {/* AI Performance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-800">AI Performance Metrics</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Model accuracy across key dimensions</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600">All systems nominal</span>
                </div>
              </div>
              <div className="space-y-4">
                {AI_PERFORMANCE.map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-slate-700">{label}</span>
                      <span className="text-[12px] font-bold tabular-nums" style={{ color: pct >= 90 ? '#0d9488' : pct >= 75 ? '#d97706' : '#ef4444' }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 90 ? '#0d9488' : pct >= 75 ? '#d97706' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Heatmap */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
              <div className="mb-4">
                <h3 className="text-[13px] font-semibold text-slate-800">Hourly Call Heatmap</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Call volume by day and hour — darker = busier</p>
              </div>

              {/* Hour labels */}
              <div className="flex mb-1.5 ml-10">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center text-[9px] text-slate-400 font-medium">{h}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="space-y-1">
                {DAYS.map((day, di) => (
                  <div key={day} className="flex items-center gap-0">
                    <div className="w-10 text-[10px] text-slate-500 font-medium text-right pr-2 flex-shrink-0">{day}</div>
                    {HOURS.map((_, hi) => {
                      const val = HEATMAP[di][hi]
                      return (
                        <div
                          key={hi}
                          className="flex-1 h-6 rounded-[3px] mx-px transition-all"
                          style={{ background: heatColor(val, MAX_HEAT) }}
                          title={`${day} ${HOURS[hi]}: ${val} calls`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[9px] text-slate-400">Quiet</span>
                {['#f1f5f9', '#ccfbf1', '#5eead4', '#14b8a6', '#0d9488', '#0f766e'].map(c => (
                  <div key={c} className="w-4 h-4 rounded-sm" style={{ background: c }} />
                ))}
                <span className="text-[9px] text-slate-400">Busy</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
