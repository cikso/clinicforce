'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3, Phone, Calendar, Bell, Search, Download,
  ChevronDown, Activity, Clock, Zap, Target, BookOpen,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  Loader2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import PageShell from '@/components/layout/PageShell'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrendMeta { label: string; direction: 'up' | 'down' | 'neutral' }

interface InsightsData {
  kpis: {
    totalCalls:    number
    appointments:  number
    urgentCases:   number
    avgHandleTime: number
    aiContainment: number
    bookingConv:   number
  }
  trends: {
    totalCalls:    TrendMeta
    appointments:  TrendMeta
    urgentCases:   TrendMeta
    aiContainment: TrendMeta
    bookingConv:   TrendMeta
  }
  areaData:            { day: string; handled: number; transferred: number }[]
  callReasons:         { label: string; count: number }[]
  missedOpportunities: { caller: string; phone: string; reason: string; time: string; value: string }[]
  heatmap:             number[][]
  aiPerformance:       { label: string; pct: number }[]
}

// ── Static fallback ────────────────────────────────────────────────────────────

const FALLBACK: InsightsData = {
  kpis: { totalCalls: 0, appointments: 0, urgentCases: 0, avgHandleTime: 0, aiContainment: 0, bookingConv: 0 },
  trends: {
    totalCalls:    { label: '—', direction: 'neutral' },
    appointments:  { label: '—', direction: 'neutral' },
    urgentCases:   { label: '—', direction: 'neutral' },
    aiContainment: { label: '—', direction: 'neutral' },
    bookingConv:   { label: '—', direction: 'neutral' },
  },
  areaData:            [{ day: 'Mon', handled: 0, transferred: 0 }],
  callReasons:         [],
  missedOpportunities: [],
  heatmap:             Array.from({ length: 7 }, () => Array(11).fill(0)),
  aiPerformance:       [
    { label: 'Intent recognition',    pct: 0 },
    { label: 'Triage accuracy',       pct: 0 },
    { label: 'Booking conversion',    pct: 0 },
    { label: 'Caller satisfaction',   pct: 0 },
    { label: 'First call resolution', pct: 0 },
  ],
}

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm']

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, iconBg, iconColor, trendMeta, loading,
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; iconBg: string; iconColor: string
  trendMeta?: TrendMeta; loading?: boolean
}) {
  const trendColor = trendMeta?.direction === 'up' ? '#10b981'
    : trendMeta?.direction === 'down' ? '#ef4444' : '#94a3b8'
  const TrendArrow = trendMeta?.direction === 'up' ? ArrowUpRight
    : trendMeta?.direction === 'down' ? ArrowDownRight : null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {trendMeta && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            {TrendArrow && <TrendArrow className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-semibold">{trendMeta.label}</span>
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-slate-900 leading-none">{value}</p>
      )}
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

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

function heatColor(val: number, max: number): string {
  if (max === 0 || val === 0) return '#f1f5f9'
  const t = val / max
  if (t < 0.15) return '#ccfbf1'
  if (t < 0.35) return '#5eead4'
  if (t < 0.55) return '#14b8a6'
  if (t < 0.75) return '#0d9488'
  return '#0f766e'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState('Last 7 Days')
  const [data,      setData]      = useState<InsightsData>(FALLBACK)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/insights')
      .then(r => r.json())
      .then((live: InsightsData) => { if (live?.kpis) setData(live) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { kpis, trends, areaData, callReasons, missedOpportunities, heatmap, aiPerformance } = data
  const maxReason = callReasons.length > 0 ? callReasons[0].count : 1
  const maxHeat   = Math.max(...heatmap.flat(), 1)

  return (
    <PageShell
      title="Insights"
      subtitle="AI performance analytics and clinic call intelligence"
      searchPlaceholder="Search insights..."
    >
      <div className="space-y-5">

        {/* ── 6 KPI cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-3">
          <KpiCard label="Total Calls"     value={String(kpis.totalCalls)}    sub="last 7 days"    icon={Phone}         iconBg="#f0fdf4" iconColor="#16a34a" trendMeta={trends.totalCalls}    loading={loading} />
          <KpiCard label="Appointments"    value={String(kpis.appointments)}   sub="booking intent" icon={Calendar}      iconBg="#eff6ff" iconColor="#3b82f6" trendMeta={trends.appointments}  loading={loading} />
          <KpiCard label="Urgent Cases"    value={String(kpis.urgentCases)}    sub="flagged"        icon={AlertTriangle} iconBg="#fef2f2" iconColor="#ef4444" trendMeta={trends.urgentCases}   loading={loading} />
          <KpiCard label="Avg Handle Time" value={kpis.avgHandleTime > 0 ? `${kpis.avgHandleTime}m` : '—'} sub="per call" icon={Clock} iconBg="#faf5ff" iconColor="#9333ea" loading={loading} />
          <KpiCard label="AI Containment"  value={kpis.aiContainment > 0 ? `${kpis.aiContainment}%` : '—'} sub="fully resolved" icon={Zap} iconBg="#f0fdf4" iconColor="#0d9488" trendMeta={trends.aiContainment} loading={loading} />
          <KpiCard label="Booking Conv."   value={kpis.bookingConv > 0 ? `${kpis.bookingConv}%` : '—'}     sub="call to booking" icon={Target} iconBg="#fff7ed" iconColor="#ea580c" trendMeta={trends.bookingConv} loading={loading} />
        </div>

        {/* ── Middle row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Area chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-800">Call Volume Trend</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">AI handled vs escalated</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#0d9488' }} />Routine</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-slate-300" />Escalated</div>
              </div>
            </div>
            {loading ? <div className="h-44 bg-slate-50 animate-pulse rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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
                  <Area type="monotone" dataKey="handled"     name="Routine"   stroke="#0d9488" strokeWidth={2}   fill="url(#gradHandled)"  dot={false} />
                  <Area type="monotone" dataKey="transferred" name="Escalated" stroke="#94a3b8" strokeWidth={1.5} fill="url(#gradTransfer)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Call reasons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold text-slate-800">Top Call Reasons</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Volume by intent category</p>
            </div>
            {loading ? (
              <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-6 bg-slate-100 animate-pulse rounded" />)}</div>
            ) : callReasons.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic mt-6 text-center">No calls recorded yet</p>
            ) : (
              <div className="space-y-3">
                {callReasons.map(({ label, count }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-slate-600 truncate pr-2">{label}</span>
                      <span className="text-[11px] font-bold text-slate-800 tabular-nums flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round((count / maxReason) * 100)}%`, background: '#0d9488' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {/* Missed opportunities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-semibold text-slate-800">Missed Opportunities</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                  {loading ? '…' : `${missedOpportunities.length} today`}
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">{Array(2).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg" />)}</div>
              ) : missedOpportunities.length === 0 ? (
                <div className="flex items-center gap-2 py-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-[11px] text-emerald-600 font-medium">No missed calls — great work</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {missedOpportunities.map(({ caller, reason, time, value }) => (
                    <div key={caller + time} className="flex items-start gap-2.5">
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
              )}
            </div>

            {/* Coverage performance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
              <h3 className="text-[12px] font-semibold text-slate-800 mb-3">Coverage Performance</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl py-2.5">
                  <p className="text-lg font-bold text-slate-900">{loading ? '…' : kpis.aiContainment > 0 ? `${kpis.aiContainment}%` : '—'}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">AI Rate</p>
                </div>
                <div className="rounded-xl py-2.5" style={{ background: 'rgba(13,148,136,0.08)' }}>
                  <p className="text-lg font-bold" style={{ color: '#0d9488' }}>{loading ? '…' : kpis.urgentCases}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Urgent</p>
                </div>
                <div className="bg-slate-50 rounded-xl py-2.5">
                  <p className="text-lg font-bold text-slate-900">{loading ? '…' : kpis.avgHandleTime > 0 ? `${kpis.avgHandleTime}m` : '—'}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Avg time</p>
                </div>
              </div>
            </div>

            {/* Weekly summary */}
            <div className="rounded-2xl p-4 shadow-[0_1px_4px_rgba(15,39,68,0.06)]" style={{ background: '#0f1729', border: '1px solid #1e2d4a' }}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5" style={{ color: '#4fd1c5' }} />
                <h3 className="text-[12px] font-semibold text-white">Weekly Summary</h3>
              </div>
              {loading ? (
                <div className="space-y-1.5">
                  <div className="h-3 bg-white/10 animate-pulse rounded" />
                  <div className="h-3 bg-white/10 animate-pulse rounded w-4/5" />
                </div>
              ) : kpis.totalCalls === 0 ? (
                <p className="text-[11px]" style={{ color: '#6b7fa3' }}>No calls recorded in the last 7 days.</p>
              ) : (
                <p className="text-[11px] leading-relaxed" style={{ color: '#6b7fa3' }}>
                  AI handled{' '}
                  <span className="text-white font-semibold">{kpis.totalCalls - kpis.urgentCases}</span> of{' '}
                  <span className="text-white font-semibold">{kpis.totalCalls}</span> calls this week.
                  {kpis.appointments > 0 && (
                    <> Booking intent detected in{' '}
                      <span style={{ color: '#4fd1c5' }} className="font-semibold">{kpis.appointments}</span> calls.
                    </>
                  )}
                  {kpis.avgHandleTime > 0 && (
                    <> Average handle time was{' '}
                      <span className="text-white font-semibold">{kpis.avgHandleTime} minutes</span>.
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Lower row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 pb-2">

          {/* AI Performance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[13px] font-semibold text-slate-800">AI Performance Metrics</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Model accuracy across key dimensions</p>
              </div>
              {!loading && kpis.totalCalls > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600">Live data</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="h-6 bg-slate-100 animate-pulse rounded" />)}</div>
            ) : kpis.totalCalls === 0 ? (
              <p className="text-[12px] text-slate-400 italic text-center py-8">No data yet — metrics will appear once calls are recorded</p>
            ) : (
              <div className="space-y-4">
                {aiPerformance.map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-slate-700">{label}</span>
                      <span className="text-[12px] font-bold tabular-nums" style={{ color: pct >= 80 ? '#0d9488' : pct >= 60 ? '#d97706' : '#ef4444' }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 80 ? '#0d9488' : pct >= 60 ? '#d97706' : '#ef4444' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hourly Heatmap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_4px_rgba(15,39,68,0.06)]">
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold text-slate-800">Hourly Call Heatmap</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {loading ? 'Loading…' : kpis.totalCalls > 0 ? 'Call volume by day and hour — darker = busier' : 'No calls recorded yet — heatmap will populate automatically'}
              </p>
            </div>
            <div className="flex mb-1.5 ml-10">
              {HOURS.map(h => <div key={h} className="flex-1 text-center text-[9px] text-slate-400 font-medium">{h}</div>)}
            </div>
            <div className="space-y-1">
              {DAYS.map((day, di) => (
                <div key={day} className="flex items-center gap-0">
                  <div className="w-10 text-[10px] text-slate-500 font-medium text-right pr-2 flex-shrink-0">{day}</div>
                  {HOURS.map((_, hi) => {
                    const val = heatmap[di]?.[hi] ?? 0
                    return (
                      <div key={hi} className="flex-1 h-6 rounded-[3px] mx-px transition-all"
                        style={{ background: loading ? '#f1f5f9' : heatColor(val, maxHeat) }}
                        title={`${day} ${HOURS[hi]}: ${val} call${val !== 1 ? 's' : ''}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
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
    </PageShell>
  )
}
