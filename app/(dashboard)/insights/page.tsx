import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getServiceSupabase } from '@/lib/voice/shared'
import Card from '@/app/components/ui/Card'
import StatCard from '@/app/components/ui/StatCard'
import EmptyState from '@/app/components/ui/EmptyState'
import { BarChart3, PieChart, MessageSquareQuote } from 'lucide-react'

export const metadata: Metadata = { title: 'Insights — ClinicForce' }
export const dynamic = 'force-dynamic'

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const PERIOD_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
] as const

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS_LABELS = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p']

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

function buildPolyline(
  data: { total: number; ai: number }[],
  maxY: number,
  w: number,
  h: number,
  key: 'total' | 'ai',
): string {
  if (data.length === 0) return ''
  const stepX = data.length > 1 ? w / (data.length - 1) : w / 2
  return data
    .map((d, i) => {
      const x = data.length > 1 ? i * stepX : w / 2
      const y = maxY > 0 ? h - (d[key] / maxY) * h : h
      return `${x},${y}`
    })
    .join(' ')
}

function heatColor(val: number, max: number): string {
  if (val === 0) return 'var(--bg-secondary)'
  const t = val / max
  if (t < 0.2) return 'rgba(var(--brand-rgb, 37,99,235), 0.1)'
  if (t < 0.4) return 'rgba(var(--brand-rgb, 37,99,235), 0.25)'
  if (t < 0.6) return 'rgba(var(--brand-rgb, 37,99,235), 0.4)'
  if (t < 0.8) return 'rgba(var(--brand-rgb, 37,99,235), 0.6)'
  return 'var(--brand)'
}

/* ── Call reason classification ─────────────────────────────────────────────── */

const REASON_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'Appointment / booking', pattern: /\b(book|appoint|schedul|reserv|visit)\b/i },
  { label: 'Emergency / urgent', pattern: /\b(emerg|urgent|critical|poison|bleed|hit by|collaps|seizure)\b/i },
  { label: 'Medication / prescription', pattern: /\b(medic|prescri|refill|tablet|dose|flea|worm|heart\s?worm)\b/i },
  { label: 'Follow-up / results', pattern: /\b(follow.?up|result|check.?up|post.?op|recheck|suture)\b/i },
  { label: 'General enquiry', pattern: /.*/ }, // catch-all
]

function classifyReason(summary: string): string {
  for (const r of REASON_PATTERNS) {
    if (r.pattern.test(summary)) return r.label
  }
  return 'General enquiry'
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

interface Props {
  searchParams: Promise<{ period?: string }>
}

export default async function InsightsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getClinicProfile()
  if (!profile?.clinicId) redirect('/login')

  const params = await searchParams
  const periodDays = [7, 30, 90].includes(Number(params.period)) ? Number(params.period) : 7
  const clinicId = profile.clinicId
  const service = getServiceSupabase()

  const now = new Date()
  const periodStart = new Date(now.getTime() - periodDays * 86_400_000).toISOString()
  const prevPeriodStart = new Date(now.getTime() - periodDays * 2 * 86_400_000).toISOString()

  // ── Fetch data ────────────────────────────────────────────────────────────
  const [currentResult, prevResult, surveyResult] = await Promise.all([
    service
      .from('call_inbox')
      .select('id, summary, urgency, status, action_required, call_duration_seconds, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', periodStart)
      .order('created_at', { ascending: true }),
    service
      .from('call_inbox')
      .select('id, summary, urgency, status, action_required, call_duration_seconds')
      .eq('clinic_id', clinicId)
      .gte('created_at', prevPeriodStart)
      .lt('created_at', periodStart),
    service
      .from('survey_responses')
      .select('patient_name, nps_score, follow_up_text, responded_at')
      .eq('clinic_id', clinicId)
      .not('nps_score', 'is', null)
      .order('responded_at', { ascending: false })
      .limit(5),
  ])

  const calls = currentResult.data ?? []
  const prevCalls = prevResult.data ?? []
  const reviews = surveyResult.data ?? []

  // ── KPI calculations ──────────────────────────────────────────────────────
  const totalCalls = calls.length
  const prevTotalCalls = prevCalls.length

  // "AI resolved" = calls that didn't need a callback (action_required is null or status is ACTIONED/ARCHIVED)
  const aiResolved = calls.filter(
    c => !c.action_required || c.status === 'ACTIONED' || c.status === 'ARCHIVED',
  ).length
  const aiResolutionRate = totalCalls > 0 ? Math.round((aiResolved / totalCalls) * 100) : 0
  const prevAiResolved = prevCalls.filter(
    c => !c.action_required || c.status === 'ACTIONED' || c.status === 'ARCHIVED',
  ).length
  const prevAiRate = prevTotalCalls > 0 ? Math.round((prevAiResolved / prevTotalCalls) * 100) : 0

  const durations = calls.map(c => c.call_duration_seconds ?? 0).filter(d => d > 0)
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
  const prevDurations = prevCalls.map(c => c.call_duration_seconds ?? 0).filter(d => d > 0)
  const prevAvgDuration = prevDurations.length > 0 ? prevDurations.reduce((a, b) => a + b, 0) / prevDurations.length : 0

  const callbacksRequested = calls.filter(c => c.action_required).length
  const prevCallbacks = prevCalls.filter(c => c.action_required).length

  const urgentCalls = calls.filter(c => c.urgency === 'URGENT' || c.urgency === 'CRITICAL').length

  // Delta helpers
  function pctDelta(current: number, prev: number): { value: string; direction: 'up' | 'down' | 'neutral' } {
    if (prev === 0 && current === 0) return { value: 'No change', direction: 'neutral' }
    if (prev === 0) return { value: `+${current}`, direction: 'up' }
    const pct = Math.round(((current - prev) / prev) * 100)
    if (pct === 0) return { value: 'No change', direction: 'neutral' }
    return {
      value: `${Math.abs(pct)}% from prev period`,
      direction: pct > 0 ? 'up' : 'down',
    }
  }

  const durationDelta = (() => {
    const diff = Math.round(avgDuration - prevAvgDuration)
    if (diff === 0) return { value: 'No change', direction: 'neutral' as const }
    return {
      value: `${formatDuration(Math.abs(diff))} from prev period`,
      direction: diff > 0 ? ('up' as const) : ('down' as const),
    }
  })()

  // ── Resolution breakdown ──────────────────────────────────────────────────
  const escalated = calls.filter(c => c.action_required && c.status !== 'ACTIONED' && c.status !== 'ARCHIVED').length
  const resolvedPct = totalCalls > 0 ? Math.round((aiResolved / totalCalls) * 100) : 0
  const escalatedPct = totalCalls > 0 ? Math.round((escalated / totalCalls) * 100) : 0
  const urgentPct = totalCalls > 0 ? Math.round((urgentCalls / totalCalls) * 100) : 0

  // ── Call volume by day ────────────────────────────────────────────────────
  const volumeByDay: Record<string, { total: number; ai: number }> = {}

  if (periodDays <= 7) {
    // Daily view: Mon-Sun
    for (const d of DAY_NAMES) volumeByDay[d] = { total: 0, ai: 0 }
    for (const c of calls) {
      const day = DAY_NAMES[new Date(c.created_at).getDay()]
      volumeByDay[day].total++
      if (!c.action_required) volumeByDay[day].ai++
    }
  } else {
    // Group by date for longer periods
    for (const c of calls) {
      const dateKey = new Date(c.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
      if (!volumeByDay[dateKey]) volumeByDay[dateKey] = { total: 0, ai: 0 }
      volumeByDay[dateKey].total++
      if (!c.action_required) volumeByDay[dateKey].ai++
    }
  }

  const volumeData = Object.entries(volumeByDay).map(([label, v]) => ({ label, ...v }))
  const maxCalls = Math.max(...volumeData.map(d => d.total), 1)
  const chartW = 400
  const chartH = 140

  // ── Call reasons ──────────────────────────────────────────────────────────
  const reasonCounts: Record<string, number> = {}
  for (const c of calls) {
    const reason = classifyReason(c.summary ?? '')
    reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1
  }
  const callReasons = Object.entries(reasonCounts)
    .map(([label, count]) => ({ label, count, pct: totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // ── Heatmap (day × hour) ──────────────────────────────────────────────────
  // 7 rows (Mon-Sun) × 11 cols (8am-6pm)
  const heatmapOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const heatmap: number[][] = heatmapOrder.map(() => new Array(11).fill(0))
  for (const c of calls) {
    const d = new Date(c.created_at)
    const dayIdx = heatmapOrder.indexOf(DAY_NAMES[d.getDay()])
    const hour = d.getHours()
    const hourIdx = hour - 8
    if (dayIdx >= 0 && hourIdx >= 0 && hourIdx < 11) {
      heatmap[dayIdx][hourIdx]++
    }
  }
  const maxHeat = Math.max(...heatmap.flat(), 1)

  // ── NPS reviews for satisfaction panel ────────────────────────────────────
  const npsReviews = reviews.map(r => ({
    name: r.patient_name ?? 'Patient',
    score: r.nps_score as number,
    text: r.follow_up_text ?? '',
    time: r.responded_at
      ? new Date(r.responded_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
      : '',
  }))

  // ── Render ────────────────────────────────────────────────────────────────
  const periodLabel = periodDays === 7 ? 'Last 7 days' : periodDays === 30 ? 'Last 30 days' : 'Last 90 days'

  return (
    <div className="space-y-5">
      {/* Page Header + period switcher */}
      <header className="flex items-start justify-between flex-wrap gap-3 cf-enter">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] mb-1.5">
            <Link href="/overview" className="hover:text-[var(--text-primary)] transition-colors">
              Dashboard
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[var(--text-primary)] font-medium">Insights</span>
          </nav>
          <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)] tracking-[-0.01em]">
            Insights
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Call patterns, resolution rates, and patient feedback — {periodLabel.toLowerCase()}.
          </p>
        </div>
        <div
          className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border-subtle)] shrink-0"
          role="tablist"
          aria-label="Time range"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/insights?period=${opt.value}`}
              role="tab"
              aria-selected={periodDays === opt.value}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                periodDays === opt.value
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 cf-enter cf-enter-delay-1">
        <StatCard label="Total Calls" value={totalCalls} delta={pctDelta(totalCalls, prevTotalCalls)} />
        <StatCard label="AI Resolution Rate" value={`${aiResolutionRate}%`} delta={pctDelta(aiResolutionRate, prevAiRate)} />
        <StatCard label="Avg Call Duration" value={formatDuration(avgDuration)} delta={durationDelta} />
        <StatCard
          label="Callbacks Requested"
          value={callbacksRequested}
          delta={pctDelta(callbacksRequested, prevCallbacks)}
          highlight={callbacksRequested > 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 cf-enter cf-enter-delay-2">
        {/* Call Volume Chart */}
        <Card header={{ title: 'Call Volume Trend', subtitle: 'AI-resolved vs total calls' }} className="lg:col-span-2">
          {totalCalls === 0 ? (
            <div className="h-[180px] flex items-center justify-center">
              <EmptyState
                size="sm"
                icon={<BarChart3 className="w-5 h-5" strokeWidth={1.5} />}
                title="No calls in this period"
                description="Once Stella starts fielding calls, volume trends will appear here."
              />
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-[var(--brand)] rounded" />
                  <span className="text-[11px] text-[var(--text-tertiary)]">Total calls</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-[var(--success)] rounded" />
                  <span className="text-[11px] text-[var(--text-tertiary)]">AI resolved</span>
                </div>
              </div>

              <div className="flex">
                <div className="flex flex-col justify-between text-[10px] text-[var(--text-tertiary)] font-mono-data pr-2 h-[140px]">
                  <span>{maxCalls}</span>
                  <span>{Math.round(maxCalls / 2)}</span>
                  <span>0</span>
                </div>
                <div className="flex-1">
                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[140px]" preserveAspectRatio="none">
                    <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="0" x2={chartW} y2="0" stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <polygon
                      points={`0,${chartH} ${buildPolyline(volumeData, maxCalls, chartW, chartH, 'ai')} ${chartW},${chartH}`}
                      fill="var(--success)"
                      opacity="0.08"
                    />
                    <polyline
                      points={buildPolyline(volumeData, maxCalls, chartW, chartH, 'total')}
                      fill="none"
                      stroke="var(--brand)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points={buildPolyline(volumeData, maxCalls, chartW, chartH, 'ai')}
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {volumeData.map((d, i) => {
                      const x = volumeData.length > 1 ? (i / (volumeData.length - 1)) * chartW : chartW / 2
                      const y = maxCalls > 0 ? chartH - (d.total / maxCalls) * chartH : chartH
                      return <circle key={`t-${i}`} cx={x} cy={y} r="3" fill="var(--brand)" />
                    })}
                    {volumeData.map((d, i) => {
                      const x = volumeData.length > 1 ? (i / (volumeData.length - 1)) * chartW : chartW / 2
                      const y = maxCalls > 0 ? chartH - (d.ai / maxCalls) * chartH : chartH
                      return <circle key={`a-${i}`} cx={x} cy={y} r="3" fill="var(--success)" />
                    })}
                  </svg>
                  <div className="flex justify-between mt-1.5">
                    {volumeData.map((d) => (
                      <span key={d.label} className="text-[10px] text-[var(--text-tertiary)] font-mono-data">{d.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Resolution Donut */}
        <Card header={{ title: 'Resolution Breakdown', subtitle: 'How calls are resolved' }}>
          {totalCalls === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <EmptyState
                size="sm"
                icon={<PieChart className="w-5 h-5" strokeWidth={1.5} />}
                title="No calls in this period"
                description="Resolution breakdown needs a few completed calls to chart."
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 120 120" className="w-[160px] h-[160px]">
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border-subtle)" strokeWidth="14" />
                <circle
                  cx="60" cy="60" r="48"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="14"
                  strokeDasharray={`${resolvedPct * 3.015} ${301.5 - resolvedPct * 3.015}`}
                  strokeDashoffset="75.4"
                  strokeLinecap="round"
                />
                <circle
                  cx="60" cy="60" r="48"
                  fill="none"
                  stroke="var(--warning)"
                  strokeWidth="14"
                  strokeDasharray={`${escalatedPct * 3.015} ${301.5 - escalatedPct * 3.015}`}
                  strokeDashoffset={`${75.4 - resolvedPct * 3.015}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="60" cy="60" r="48"
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth="14"
                  strokeDasharray={`${urgentPct * 3.015} ${301.5 - urgentPct * 3.015}`}
                  strokeDashoffset={`${75.4 - (resolvedPct + escalatedPct) * 3.015}`}
                  strokeLinecap="round"
                />
                <text x="60" y="56" textAnchor="middle" className="text-[22px] font-bold fill-[var(--text-primary)]">{resolvedPct}%</text>
                <text x="60" y="72" textAnchor="middle" className="text-[10px] fill-[var(--text-tertiary)]">AI resolved</text>
              </svg>

              <div className="flex items-center gap-4 mt-4 flex-wrap justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]" />
                  <span className="text-[11px] text-[var(--text-secondary)]">AI resolved ({resolvedPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]" />
                  <span className="text-[11px] text-[var(--text-secondary)]">Callback ({escalatedPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--error)]" />
                  <span className="text-[11px] text-[var(--text-secondary)]">Urgent ({urgentPct}%)</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Second Row: Call Reasons + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 cf-enter cf-enter-delay-3">
        {/* Call Reasons */}
        <Card header={{ title: 'Top Call Reasons', subtitle: 'Volume by intent category' }}>
          {callReasons.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center">
              <EmptyState
                size="sm"
                icon={<BarChart3 className="w-5 h-5" strokeWidth={1.5} />}
                title="No call data yet"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {callReasons.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-tertiary)] font-mono-data">{r.count}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">({r.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--brand)] transition-all"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Hourly Heatmap */}
        <Card header={{ title: 'Busiest Hours', subtitle: 'Call volume by day and time' }}>
          <div className="overflow-x-auto -mx-1">
            <div className="flex items-center mb-1.5 pl-10">
              {HOURS_LABELS.map((h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-[var(--text-tertiary)] font-mono-data">{h}</div>
              ))}
            </div>
            <div className="space-y-1">
              {heatmapOrder.map((day, di) => (
                <div key={day} className="flex items-center">
                  <div className="w-10 text-[10px] text-[var(--text-tertiary)] font-medium text-right pr-2 shrink-0">{day}</div>
                  <div className="flex flex-1 gap-0.5">
                    {HOURS_LABELS.map((_, hi) => {
                      const val = heatmap[di][hi]
                      return (
                        <div
                          key={hi}
                          className="flex-1 h-6 rounded-sm"
                          style={{ backgroundColor: heatColor(val, maxHeat) }}
                          title={`${day} ${HOURS_LABELS[hi]}: ${val} calls`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[9px] text-[var(--text-tertiary)]">Quiet</span>
              <div className="w-3 h-3 rounded-sm bg-[var(--bg-secondary)]" />
              <div className="w-3 h-3 rounded-sm bg-[var(--brand)] opacity-20" />
              <div className="w-3 h-3 rounded-sm bg-[var(--brand)] opacity-40" />
              <div className="w-3 h-3 rounded-sm bg-[var(--brand)] opacity-70" />
              <div className="w-3 h-3 rounded-sm bg-[var(--brand)]" />
              <span className="text-[9px] text-[var(--text-tertiary)]">Busy</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Third Row: Call Urgency + Patient Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 cf-enter cf-enter-delay-4">
        {/* Call Urgency Breakdown */}
        <Card header={{ title: 'Call Urgency Breakdown', subtitle: 'Distribution by urgency level' }}>
          {totalCalls === 0 ? (
            <div className="h-[120px] flex items-center justify-center">
              <EmptyState
                size="sm"
                icon={<PieChart className="w-5 h-5" strokeWidth={1.5} />}
                title="No call data yet"
              />
            </div>
          ) : (() => {
            const routine = calls.filter(c => c.urgency === 'ROUTINE').length
            const urgent = calls.filter(c => c.urgency === 'URGENT').length
            const critical = calls.filter(c => c.urgency === 'CRITICAL').length
            const urgencyData = [
              { label: 'Routine', count: routine, pct: Math.round((routine / totalCalls) * 100), color: 'var(--success)' },
              { label: 'Urgent', count: urgent, pct: Math.round((urgent / totalCalls) * 100), color: 'var(--warning)' },
              { label: 'Critical', count: critical, pct: Math.round((critical / totalCalls) * 100), color: 'var(--error)' },
            ]
            return (
              <div className="space-y-4">
                {urgencyData.map((u) => (
                  <div key={u.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-[var(--text-primary)]">{u.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[var(--text-tertiary)] font-mono-data">{u.count}</span>
                        <span
                          className="text-[12px] font-bold font-mono-data"
                          style={{ color: u.color }}
                        >
                          {u.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${u.pct}%`, backgroundColor: u.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </Card>

        {/* Patient Satisfaction (from NPS surveys) */}
        <Card header={{ title: 'Patient Feedback', subtitle: 'Recent NPS survey responses' }}>
          {npsReviews.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center">
              <EmptyState
                size="sm"
                icon={<MessageSquareQuote className="w-5 h-5" strokeWidth={1.5} />}
                title="No survey responses yet"
                description="Send your first post-visit survey to start collecting feedback."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {npsReviews.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[var(--brand)]">{r.name.charAt(0)}</span>
                      </div>
                      <span className="text-[12px] font-medium text-[var(--text-primary)]">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            r.score >= 9 ? 'var(--success-light)'
                            : r.score >= 7 ? 'var(--warning-light)'
                            : 'var(--error-light)',
                          color:
                            r.score >= 9 ? 'var(--success)'
                            : r.score >= 7 ? 'var(--warning)'
                            : 'var(--error)',
                        }}
                      >
                        {r.score}/10
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">{r.time}</span>
                    </div>
                  </div>
                  {r.text && (
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{r.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
