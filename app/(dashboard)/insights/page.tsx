import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import StatCard from '@/app/components/ui/StatCard'
import Badge from '@/app/components/ui/Badge'

/* ── Sample Data ────────────────────────────────────────────────────────────── */

const CALL_VOLUME = [
  { day: 'Mon', calls: 42, ai: 36 },
  { day: 'Tue', calls: 55, ai: 48 },
  { day: 'Wed', calls: 38, ai: 33 },
  { day: 'Thu', calls: 61, ai: 52 },
  { day: 'Fri', calls: 73, ai: 62 },
  { day: 'Sat', calls: 45, ai: 40 },
  { day: 'Sun', calls: 28, ai: 25 },
]

const CALL_REASONS = [
  { label: 'Appointment booking', count: 124, pct: 36 },
  { label: 'Prescription refill', count: 72, pct: 21 },
  { label: 'General enquiry', count: 55, pct: 16 },
  { label: 'Follow-up / results', count: 52, pct: 15 },
  { label: 'Emergency triage', count: 39, pct: 12 },
]

const RESOLUTION = { aiResolved: 72, escalated: 18, transferred: 10 }

const HEATMAP_DATA = [
  [0, 2, 5, 8, 6, 4, 3, 7, 9, 5, 2],
  [1, 3, 6, 9, 7, 5, 4, 6, 8, 4, 1],
  [0, 1, 4, 7, 5, 3, 2, 5, 6, 3, 1],
  [2, 4, 7,10, 8, 6, 5, 8,10, 6, 3],
  [3, 5, 9,12,10, 7, 6, 9,11, 7, 4],
  [1, 3, 5, 7, 4, 2, 1, 3, 4, 2, 0],
  [0, 1, 2, 3, 2, 1, 0, 1, 2, 1, 0],
]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p']

const REVIEWS = [
  { name: 'Margaret T.', stars: 5, text: 'Sarah answered all my questions about my dog\'s medication. Very impressed with the AI!', time: '2 days ago' },
  { name: 'David K.', stars: 4, text: 'Quick and easy to book an appointment. Wish I could also reschedule by phone.', time: '3 days ago' },
  { name: 'Jenny L.', stars: 5, text: 'Called at 10pm about an emergency — was triaged immediately and directed to after-hours vet.', time: '4 days ago' },
  { name: 'Robert P.', stars: 3, text: 'The AI had trouble understanding my accent but eventually got there. Decent experience.', time: '5 days ago' },
  { name: 'Susan M.', stars: 5, text: 'So much better than waiting on hold. Booked a vaccination appointment in under a minute.', time: '1 week ago' },
]

const AI_METRICS = [
  { label: 'Intent recognition', pct: 94 },
  { label: 'Triage accuracy', pct: 89 },
  { label: 'Booking conversion', pct: 76 },
  { label: 'Caller satisfaction', pct: 91 },
  { label: 'First-call resolution', pct: 82 },
]

/* ── SVG Helpers ─────────────────────────────────────────────────────────────── */

function buildPolyline(data: { calls: number }[], maxY: number, w: number, h: number, key: 'calls' | 'ai'): string {
  const padX = 0
  const stepX = (w - padX * 2) / (data.length - 1)
  return data.map((d, i) => {
    const x = padX + i * stepX
    const y = h - ((d as Record<string, number>)[key] / maxY) * h
    return `${x},${y}`
  }).join(' ')
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

/* ── Page ────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = { title: 'Insights — ClinicForce' }

export default function InsightsPage() {
  const maxCalls = Math.max(...CALL_VOLUME.map((d) => d.calls))
  const chartW = 400
  const chartH = 140
  const maxHeat = Math.max(...HEATMAP_DATA.flat())

  return (
    <div className="space-y-5">
      {/* Coming Soon Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--brand-light)] border border-[var(--brand)]/20">
        <p className="text-[13px] text-[var(--brand-dark)]">
          Live analytics are coming soon. Currently showing sample data as a preview.
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Insights</h2>
          <span className="text-[13px] text-[var(--text-secondary)]">Last 7 days</span>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
          {['7 Days', '30 Days', '90 Days'].map((v) => (
            <button
              key={v}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                v === '7 Days'
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={342} unit="" delta={{ value: '12% from last week', direction: 'up' }} />
        <StatCard label="AI Resolution Rate" value="87%" unit="" delta={{ value: '3% from last week', direction: 'up' }} />
        <StatCard label="Avg Call Duration" value="2m 14s" unit="" delta={{ value: '8s from last week', direction: 'down' }} />
        <StatCard label="Revenue Saved" value="$4,760" unit="" delta={{ value: '$620 from last week', direction: 'up' }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Call Volume Chart */}
        <Card header={{ title: 'Call Volume Trend', subtitle: 'AI-handled vs total calls' }} className="lg:col-span-2">
          <div className="relative">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-[var(--brand)] rounded" />
                <span className="text-[11px] text-[var(--text-tertiary)]">Total calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-[var(--success)] rounded" />
                <span className="text-[11px] text-[var(--text-tertiary)]">AI handled</span>
              </div>
            </div>

            {/* Y-axis labels */}
            <div className="flex">
              <div className="flex flex-col justify-between text-[10px] text-[var(--text-tertiary)] font-mono-data pr-2 h-[140px]">
                <span>{maxCalls}</span>
                <span>{Math.round(maxCalls / 2)}</span>
                <span>0</span>
              </div>
              <div className="flex-1">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[140px]" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="0" x2={chartW} y2="0" stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="4 4" />
                  {/* Area fill for AI */}
                  <polygon
                    points={`0,${chartH} ${buildPolyline(CALL_VOLUME, maxCalls, chartW, chartH, 'ai')} ${chartW},${chartH}`}
                    fill="var(--success)"
                    opacity="0.08"
                  />
                  {/* Total calls line */}
                  <polyline
                    points={buildPolyline(CALL_VOLUME, maxCalls, chartW, chartH, 'calls')}
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* AI handled line */}
                  <polyline
                    points={buildPolyline(CALL_VOLUME, maxCalls, chartW, chartH, 'ai')}
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points - total */}
                  {CALL_VOLUME.map((d, i) => {
                    const x = (i / (CALL_VOLUME.length - 1)) * chartW
                    const y = chartH - (d.calls / maxCalls) * chartH
                    return <circle key={`t-${i}`} cx={x} cy={y} r="3" fill="var(--brand)" />
                  })}
                  {/* Data points - AI */}
                  {CALL_VOLUME.map((d, i) => {
                    const x = (i / (CALL_VOLUME.length - 1)) * chartW
                    const y = chartH - (d.ai / maxCalls) * chartH
                    return <circle key={`a-${i}`} cx={x} cy={y} r="3" fill="var(--success)" />
                  })}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between mt-1.5">
                  {CALL_VOLUME.map((d) => (
                    <span key={d.day} className="text-[10px] text-[var(--text-tertiary)] font-mono-data">{d.day}</span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[var(--text-tertiary)] mt-3 text-center">Sample data — live analytics coming soon</p>
          </div>
        </Card>

        {/* Resolution Donut */}
        <Card header={{ title: 'Resolution Breakdown', subtitle: 'How calls are resolved' }}>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 120 120" className="w-[160px] h-[160px]">
              {/* Background circle */}
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border-subtle)" strokeWidth="14" />
              {/* AI Resolved - green */}
              <circle
                cx="60" cy="60" r="48"
                fill="none"
                stroke="var(--success)"
                strokeWidth="14"
                strokeDasharray={`${RESOLUTION.aiResolved * 3.015} ${301.5 - RESOLUTION.aiResolved * 3.015}`}
                strokeDashoffset="75.4"
                strokeLinecap="round"
              />
              {/* Escalated - warning */}
              <circle
                cx="60" cy="60" r="48"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="14"
                strokeDasharray={`${RESOLUTION.escalated * 3.015} ${301.5 - RESOLUTION.escalated * 3.015}`}
                strokeDashoffset={`${75.4 - RESOLUTION.aiResolved * 3.015}`}
                strokeLinecap="round"
              />
              {/* Transferred - brand */}
              <circle
                cx="60" cy="60" r="48"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="14"
                strokeDasharray={`${RESOLUTION.transferred * 3.015} ${301.5 - RESOLUTION.transferred * 3.015}`}
                strokeDashoffset={`${75.4 - (RESOLUTION.aiResolved + RESOLUTION.escalated) * 3.015}`}
                strokeLinecap="round"
              />
              {/* Center text */}
              <text x="60" y="56" textAnchor="middle" className="text-[22px] font-bold fill-[var(--text-primary)]">{RESOLUTION.aiResolved}%</text>
              <text x="60" y="72" textAnchor="middle" className="text-[10px] fill-[var(--text-tertiary)]">AI resolved</text>
            </svg>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">AI resolved ({RESOLUTION.aiResolved}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">Escalated ({RESOLUTION.escalated}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">Transferred ({RESOLUTION.transferred}%)</span>
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-3">Sample data — live analytics coming soon</p>
          </div>
        </Card>
      </div>

      {/* Second Row: Call Reasons + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Call Reasons Bar Chart */}
        <Card header={{ title: 'Top Call Reasons', subtitle: 'Volume by intent category' }}>
          <div className="space-y-3">
            {CALL_REASONS.map((r) => (
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
          <p className="text-[10px] text-[var(--text-tertiary)] mt-4 text-center">Sample data — live analytics coming soon</p>
        </Card>

        {/* Hourly Heatmap */}
        <Card header={{ title: 'Busiest Hours', subtitle: 'Call volume by day and time' }}>
          <div className="overflow-x-auto -mx-1">
            {/* Hour headers */}
            <div className="flex items-center mb-1.5 pl-10">
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-[var(--text-tertiary)] font-mono-data">{h}</div>
              ))}
            </div>
            {/* Grid rows */}
            <div className="space-y-1">
              {DAYS.map((day, di) => (
                <div key={day} className="flex items-center">
                  <div className="w-10 text-[10px] text-[var(--text-tertiary)] font-medium text-right pr-2 shrink-0">{day}</div>
                  <div className="flex flex-1 gap-0.5">
                    {HOURS.map((_, hi) => {
                      const val = HEATMAP_DATA[di][hi]
                      return (
                        <div
                          key={hi}
                          className="flex-1 h-6 rounded-sm"
                          style={{ backgroundColor: heatColor(val, maxHeat) }}
                          title={`${day} ${HOURS[hi]}: ${val} calls`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
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
          <p className="text-[10px] text-[var(--text-tertiary)] mt-3 text-center">Sample data — live analytics coming soon</p>
        </Card>
      </div>

      {/* Third Row: AI Performance + Patient Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Performance Metrics */}
        <Card header={{ title: 'AI Performance Metrics', subtitle: 'Model accuracy across key dimensions' }}>
          <div className="space-y-4">
            {AI_METRICS.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-[var(--text-primary)]">{m.label}</span>
                  <span
                    className="text-[12px] font-bold font-mono-data"
                    style={{ color: m.pct >= 85 ? 'var(--success)' : m.pct >= 70 ? 'var(--warning)' : 'var(--error)' }}
                  >
                    {m.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${m.pct}%`,
                      backgroundColor: m.pct >= 85 ? 'var(--success)' : m.pct >= 70 ? 'var(--warning)' : 'var(--error)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-4 text-center">Sample data — live analytics coming soon</p>
        </Card>

        {/* Patient Satisfaction */}
        <Card header={{ title: 'Patient Satisfaction', subtitle: 'Recent caller feedback' }}>
          <div className="space-y-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[var(--brand)]">{r.name.charAt(0)}</span>
                    </div>
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">{r.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{r.time}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }, (_, s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 12 12">
                      <path
                        d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8.5 3 10l.6-3.2L1.2 4.5 4.5 4z"
                        fill={s < r.stars ? 'var(--warning)' : 'var(--border-subtle)'}
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-3 text-center">Sample data — live analytics coming soon</p>
        </Card>
      </div>
    </div>
  )
}
