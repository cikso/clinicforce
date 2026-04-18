'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts'
import './command-centre-v2.css'

/* ─── Types (match what the server page passes in) ─── */

export interface KpiInput {
  callsToday: number
  callsDelta: { text: string; type: 'up' | 'down' | 'neutral' }
  missedToday: number
  bookingsToday: number
  bookingsDelta: { text: string; type: 'up' | 'down' | 'neutral' }
  avgAnswerSeconds: number // Stella's "answer time" proxy — for now 0
  avgAnswerDelta: { text: string; type: 'up' | 'down' | 'neutral' }
  revenueRecovered: number // AUD — rough estimate from bookings
  revenueDelta: { text: string; type: 'up' | 'down' | 'neutral' }
  npsScore: number | null
  npsDelta: { text: string; type: 'up' | 'down' | 'neutral' }
  callsSparkline: number[] // last 14 days, length up to 14
  bookingsSparkline: number[]
  answerSparkline: number[]
  revenueSparkline: number[]
  npsSparkline: number[]
}

export interface UrgentCase {
  id: string
  name: string
  phone: string
  summary: string
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'
  createdAt: string
}

export interface PendingAction {
  id: string
  title: string
  description: string | null
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  dueAt: string | null
  createdAt: string
  assigneeName: string | null
  assigneeInitials: string | null
}

export interface RecentCall {
  id: string
  name: string
  summary: string
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'
  createdAt: string
  booked: boolean // true if summary implies a booking — informs dot color
}

export interface ActivityRow {
  id: string
  kind: 'CALL' | 'TASK' | 'NOTE' | 'STATUS'
  message: string
  at: string
}

export interface VetCapacity {
  id: string
  name: string
  role: string
  used: number
  capacity: number
}

export interface LiveCall {
  active: boolean
  caller_name: string | null
  patient: string | null          // e.g. "Bella · Labrador 7y"
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'
  transcriptQuote: string | null
  trailSummary: string | null     // e.g. "Caller reported collapse · Stella escalated to emergency"
  startedAt: string               // ISO
}

export interface CoverageState {
  mode: string                    // 'off' | 'after_hours' | 'all_calls'
  windowStart: string             // e.g. "08:00"
  windowEnd: string               // e.g. "17:00"
  nextBusinessDayStart: string    // e.g. "Tue 08:00"
}

export interface CommandCentreProps {
  firstName: string
  greeting: string                // "Good morning" | "Good afternoon" | "Good evening"
  todayLabel: string              // "Monday, 14 April"
  clinicName: string
  clinicSuburb: string | null
  kpi: KpiInput
  liveCall: LiveCall | null
  coverage: CoverageState
  urgentCases: UrgentCase[]
  pendingActions: PendingAction[]
  recentCalls: RecentCall[]
  activity: ActivityRow[]
  vetCapacity: VetCapacity[]
  chartHourly:  Array<{ label: string; answered: number; forwarded: number; missed: number }>
  chartWeekly:  Array<{ label: string; answered: number; forwarded: number; missed: number }>
  chartMonthly: Array<{ label: string; answered: number; forwarded: number; missed: number }>
}

/* ─── Helpers ─── */

function formatShortAUD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `$${n}`
}

function formatDuration(secs: number): string {
  if (secs <= 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch { return '' }
}

function hhmm(iso: string): string {
  try {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch { return '—' }
}

function deterministicColor(seed: string): string {
  const palette = ['#A5B4FC', '#FCA5A5', '#FCD34D', '#6EE7B7', '#F9A8D4', '#7DD3FC', '#FDBA74']
  const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

/* ─── Inline SVG sparkline (Recharts is heavy for 72x24 px) ─── */

function Sparkline({
  data,
  color = '#00B578',
  ariaLabel,
  formatValue,
}: {
  data: number[]
  color?: string
  ariaLabel?: string
  /** Formats the hover tooltip value. Defaults to Intl.NumberFormat. */
  formatValue?: (value: number) => string
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (data.length < 2) return <svg className="cc-spark" viewBox="0 0 72 24" />

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = 72 / (data.length - 1)
  const coords = data.map((v, i) => ({
    x: i * step,
    y: 24 - ((v - min) / range) * 20 - 2,
    v,
  }))
  const points = coords.map((c) => `${c.x},${c.y}`).join(' ')

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 72
    // Snap to nearest data point
    const idx = Math.round(x / step)
    const clamped = Math.max(0, Math.min(idx, data.length - 1))
    setHoverIdx(clamped)
  }

  const active = hoverIdx !== null ? coords[hoverIdx] : null
  const fmt = formatValue ?? ((n: number) => new Intl.NumberFormat('en-AU').format(Math.round(n)))

  return (
    <div className="cc-spark-wrap" role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
      <svg
        className="cc-spark"
        viewBox="0 0 72 24"
        preserveAspectRatio="none"
        onPointerMove={onMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <polyline
          className="cc-spark-line"
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {active && (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={0}
              y2={24}
              stroke={color}
              strokeOpacity={0.25}
              strokeWidth={0.75}
            />
            <circle cx={active.x} cy={active.y} r={2.25} fill="white" stroke={color} strokeWidth={1.25} />
          </>
        )}
      </svg>
      {active && (
        <span
          className="cc-spark-tip"
          style={{ left: `${(active.x / 72) * 100}%` }}
        >
          {fmt(active.v)}
        </span>
      )}
    </div>
  )
}

/* ─── Chart tooltip ─── */

interface TooltipPayloadItem {
  dataKey: string
  value: number
  color: string
  name: string
}
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #E5EAF0', borderRadius: 10, padding: '10px 12px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontFamily: 'var(--font-geist-sans), sans-serif' }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace', color: '#8A96A3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#566275' }}>{p.name}</span>
          <b style={{ marginLeft: 'auto', color: '#0D0E12', fontVariantNumeric: 'tabular-nums' }}>{p.value}</b>
        </div>
      ))}
    </div>
  )
}

/* ─── Icons ─── */

const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
  </svg>
)
const IconCheck = ({ size = 12, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8.5L6.5 12L13 4" />
  </svg>
)
const IconMissed = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3.5 3.5L14.5 14.5M14.5 3.5L3.5 14.5" strokeOpacity="0.2" />
    <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="3" width="14" height="13" rx="1.5" />
    <path d="M2 7h14M6 1.5v3M12 1.5v3" />
  </svg>
)
const IconBolt = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 2L3 10h5l-1 6 7-8h-5l1-6z" />
  </svg>
)
const IconDollar = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 2v14M13 4.5c-.8-1-2.2-1.5-4-1.5-2.5 0-4 1.1-4 2.8 0 1.5 1.3 2.3 4 2.8 2.7.5 4 1.3 4 2.8 0 1.7-1.5 2.8-4 2.8-1.8 0-3.2-.5-4-1.5" />
  </svg>
)
const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 15.5C5 13 2 10 2 6.5 2 4.5 3.5 3 5.5 3c1.5 0 2.5 1 3.5 2 1-1 2-2 3.5-2C14.5 3 16 4.5 16 6.5c0 3.5-3 6.5-7 9z" />
  </svg>
)
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
    <path d="M8 12l3 3 6-6" />
  </svg>
)
const IconArrow = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 4l4 4-4 4" />
  </svg>
)

/* ─── Component ─── */

export default function CommandCentreV2(props: CommandCentreProps) {
  const {
    firstName, greeting, todayLabel, clinicName, clinicSuburb,
    kpi, liveCall, coverage,
    urgentCases, pendingActions, recentCalls, activity, vetCapacity,
    chartHourly, chartWeekly, chartMonthly,
  } = props

  const [range, setRange] = useState<'today' | 'week' | 'month'>('today')
  const chartData = range === 'today' ? chartHourly : range === 'week' ? chartWeekly : chartMonthly

  const totalPending = pendingActions.filter((t) => t.status !== 'DONE').length

  const coverageTitle = coverage.mode === 'off'
    ? 'Coverage is OFF'
    : coverage.mode === 'all_calls'
      ? 'Coverage is ACTIVE'
      : 'Coverage is ACTIVE'
  const coverageDetail = coverage.mode === 'off'
    ? 'Stella is paused · All calls will ring your reception directly'
    : coverage.mode === 'all_calls'
      ? `All-calls mode · Stella is answering every inbound call · Next business-day coverage starts ${coverage.nextBusinessDayStart}`
      : `After-hours mode · Stella is answering calls outside ${coverage.windowStart} - ${coverage.windowEnd} · Next business-day coverage starts ${coverage.nextBusinessDayStart}`

  const shortQuote = useMemo(() => {
    const q = liveCall?.transcriptQuote ?? ''
    return q.length > 140 ? q.slice(0, 140) + '…' : q
  }, [liveCall?.transcriptQuote])

  return (
    <div className="cf-cc-v2">
      <div className="cc-max">

        {/* ─── Greeting ─── */}
        <div className="cc-greet">
          <div>
            <h1 className="cc-greet-title">{greeting}, {firstName}</h1>
            <p className="cc-greet-meta">
              {todayLabel} · {clinicName}{clinicSuburb ? ` · ${clinicSuburb}` : ''}
            </p>
          </div>
          <div className="cc-greet-actions">
            <div className="cc-seg" role="tablist" aria-label="Time range">
              <button type="button" className={range === 'today' ? 'active' : ''} onClick={() => setRange('today')}>Today</button>
              <button type="button" className={range === 'week' ? 'active' : ''} onClick={() => setRange('week')}>Week</button>
              <button type="button" className={range === 'month' ? 'active' : ''} onClick={() => setRange('month')}>Month</button>
            </div>
            <Link href="/bookings" className="cc-btn cc-btn-primary">
              + New booking
            </Link>
          </div>
        </div>

        {/* ─── Live call hero ─── */}
        <LiveCallHero live={liveCall} shortQuote={shortQuote} />

        {/* ─── KPI band ─── */}
        <div className="cc-kpi-band">
          <KpiCard
            icon={<IconPhone />}
            iconBg="var(--brand-light)"
            iconColor="var(--brand-dark)"
            label="Calls answered"
            value={kpi.callsToday.toLocaleString()}
            delta={kpi.callsDelta}
            spark={kpi.callsSparkline}
            sparkColor="var(--brand)"
          />
          <KpiCard
            icon={<IconMissed />}
            iconBg="var(--bg-secondary)"
            iconColor="var(--text-tertiary)"
            label="Missed calls"
            value={String(kpi.missedToday)}
            delta={{ text: '0%', type: 'neutral' }}
            spark={new Array(14).fill(0)}
            sparkColor="var(--text-tertiary)"
          />
          <KpiCard
            icon={<IconCalendar />}
            iconBg="#F2EEFB"
            iconColor="#6B3FA0"
            label="Bookings made"
            value={kpi.bookingsToday.toLocaleString()}
            delta={kpi.bookingsDelta}
            spark={kpi.bookingsSparkline}
            sparkColor="#8B5CF6"
          />
          <KpiCard
            icon={<IconBolt />}
            iconBg="var(--brand-light)"
            iconColor="var(--brand-dark)"
            label="Avg answer time"
            value={formatDuration(kpi.avgAnswerSeconds)}
            delta={kpi.avgAnswerDelta}
            spark={kpi.answerSparkline}
            sparkColor="var(--brand)"
          />
          <KpiCard
            icon={<IconDollar />}
            iconBg="#ECFDF5"
            iconColor="var(--success)"
            label="Revenue recovered"
            value={formatShortAUD(kpi.revenueRecovered)}
            delta={kpi.revenueDelta}
            spark={kpi.revenueSparkline}
            sparkColor="var(--success)"
          />
          <KpiCard
            icon={<IconHeart />}
            iconBg="var(--brand-light)"
            iconColor="var(--brand-dark)"
            label="NPS score"
            value={kpi.npsScore == null ? '—' : String(kpi.npsScore)}
            delta={kpi.npsDelta}
            spark={kpi.npsSparkline}
            sparkColor="var(--brand)"
          />
        </div>

        {/* ─── Call volume chart ─── */}
        <div className="cc-card">
          <div className="cc-card-head">
            <div>
              <div className="cc-card-title">Call volume</div>
            </div>
            <div className="cc-chart-legend">
              <span className="cc-legend-item"><span className="cc-legend-swatch" style={{ background: 'var(--brand)' }} /> Answered by Stella</span>
              <span className="cc-legend-item"><span className="cc-legend-swatch" style={{ background: 'var(--warning)' }} /> Forwarded to clinic</span>
              <span className="cc-legend-item"><span className="cc-legend-swatch" style={{ background: 'var(--error)', opacity: 0.4 }} /> Missed (industry avg)</span>
            </div>
          </div>
          <div className="cc-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="ccFillAns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D68F" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ccFillFwd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF1F4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false} axisLine={false}
                  tick={{ fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace', fill: '#8A96A3' }}
                />
                <YAxis
                  tickLine={false} axisLine={false} width={28}
                  tick={{ fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace', fill: '#8A96A3' }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E5EAF0' }} />
                <Area type="monotone" dataKey="answered" name="Answered by Stella" stroke="#00B578" strokeWidth={2} fill="url(#ccFillAns)" />
                <Area type="monotone" dataKey="forwarded" name="Forwarded to clinic" stroke="#D97706" strokeWidth={2} fill="url(#ccFillFwd)" />
                <Line type="monotone" dataKey="missed" name="Missed (industry avg)" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── 3-col mid section ─── */}
        <div className="cc-midgrid">
          {/* Urgent cases */}
          <div className="cc-card">
            <div className="cc-sec-head">
              <div className="cc-sec-title">
                Urgent cases
                {urgentCases.length > 0 && <span className="cc-sec-count">{urgentCases.length}</span>}
              </div>
              <Link href="/conversations?filter=urgent" className="cc-sec-link">
                View all <IconArrow />
              </Link>
            </div>
            <div className="cc-list">
              {urgentCases.length === 0 ? (
                <div className="cc-empty">No urgent cases — Stella is handling everything.</div>
              ) : urgentCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/conversations?call=${c.id}`}
                  className={`cc-urgcase${c.urgency === 'CRITICAL' ? ' emergency' : ''}`}
                >
                  <div className="cc-urgcase-head">
                    <span className="cc-urgcase-name">{c.name}</span>
                    <span className={`cc-urgency-pill ${c.urgency === 'CRITICAL' ? 'cc-urgency-emergency' : 'cc-urgency-urgent'}`}>
                      {c.urgency === 'CRITICAL' ? 'EMERGENCY' : 'URGENT'}
                    </span>
                  </div>
                  <div className="cc-urgcase-phone">{c.phone}</div>
                  <div className="cc-urgcase-body">{c.summary}</div>
                  <div className="cc-urgcase-time">{relativeTime(c.createdAt)}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pending actions */}
          <div className="cc-card">
            <div className="cc-sec-head">
              <div className="cc-sec-title">
                Pending actions
                {totalPending > 0 && <span className="cc-sec-count">{totalPending}</span>}
              </div>
              <Link href="/actions" className="cc-sec-link">
                Open queue <IconArrow />
              </Link>
            </div>
            <div className="cc-list">
              {pendingActions.length === 0 ? (
                <div className="cc-empty">Nothing pending — all caught up.</div>
              ) : pendingActions.slice(0, 5).map((t) => (
                <div key={t.id} className={`cc-task${t.status === 'DONE' ? ' done' : ''}`}>
                  <div className="cc-task-check" aria-hidden>
                    {t.status === 'DONE' && <IconCheck size={10} strokeWidth={2.5} />}
                  </div>
                  <div className="cc-task-body">
                    <div className="cc-task-title">{t.title}</div>
                    <div className="cc-task-meta">
                      <span className={`cc-prio-pill cc-prio-${t.priority.toLowerCase()}`}>{t.priority}</span>
                      <span>·</span>
                      <span>{t.dueAt ? formatDueDate(t.dueAt) : 'Today'}</span>
                    </div>
                  </div>
                  {t.assigneeInitials && (
                    <div
                      className="cc-task-avatar"
                      style={{
                        background: deterministicColor(t.assigneeInitials) + '40',
                        color: deterministicColor(t.assigneeInitials),
                      }}
                      title={t.assigneeName ?? undefined}
                    >
                      {t.assigneeInitials}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent calls */}
          <div className="cc-card">
            <div className="cc-sec-head">
              <div className="cc-sec-title">
                Recent calls
                {liveCall?.active && <span className="cc-live-dot" aria-hidden />}
              </div>
              <Link href="/conversations" className="cc-sec-link">
                Open inbox <IconArrow />
              </Link>
            </div>
            <div className="cc-list">
              {recentCalls.length === 0 ? (
                <div className="cc-empty">No calls yet today.</div>
              ) : recentCalls.slice(0, 8).map((c) => {
                const dotColor =
                  c.urgency === 'CRITICAL' ? 'var(--error)' :
                  c.urgency === 'URGENT'   ? 'var(--warning)' :
                  'var(--success)'
                return (
                  <Link key={c.id} href={`/conversations?call=${c.id}`} className="cc-recent">
                    <span className="cc-recent-time">{hhmm(c.createdAt)}</span>
                    <span className="cc-recent-dot" style={{ background: dotColor }} aria-hidden />
                    <div className="cc-recent-body">
                      <div className="cc-recent-name">{c.name}</div>
                      <div className="cc-recent-sub">{c.summary}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── Coverage strip ─── */}
        <div className="cc-coverage">
          <span className="cc-coverage-icon"><IconShield /></span>
          <div className="cc-coverage-body">
            <span className="cc-coverage-title">{coverageTitle}</span>
            <span className="cc-coverage-detail"> · {coverageDetail}</span>
          </div>
          <Link href="/settings/coverage" className="cc-btn cc-btn-primary">Adjust coverage</Link>
        </div>

        {/* ─── Activity feed + Clinic capacity ─── */}
        <div className="cc-midgrid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          <div className="cc-card cc-activity">
            <div className="cc-sec-head">
              <div className="cc-sec-title">
                Activity
                <span className="cc-live-dot" aria-hidden />
              </div>
              <span className="cc-sec-link" style={{ cursor: 'default', color: 'var(--text-tertiary)' }}>Last hour</span>
            </div>
            {activity.length === 0 ? (
              <div className="cc-empty">No activity in the last hour.</div>
            ) : activity.slice(0, 6).map((a) => (
              <div key={a.id} className="cc-act-row">
                <span className={`cc-act-icon ${a.kind.toLowerCase()}`} aria-hidden>
                  {a.kind === 'CALL' ? <IconPhone /> : a.kind === 'TASK' ? <IconCheck size={14} /> : <IconBolt />}
                </span>
                <span className="cc-act-time">{hhmm(a.at)}</span>
                <span className={`cc-act-tag ${a.kind.toLowerCase()}`}>{a.kind}</span>
                <span className="cc-act-msg">{a.message}</span>
              </div>
            ))}
          </div>

          <div className="cc-card cc-capacity">
            <div className="cc-sec-head">
              <div className="cc-sec-title">Clinic capacity today</div>
              <Link href="/bookings" className="cc-sec-link">View schedule <IconArrow /></Link>
            </div>
            {vetCapacity.length === 0 ? (
              <div className="cc-empty">No clinicians configured yet. Add your team in Settings.</div>
            ) : vetCapacity.map((v) => {
              const pct = v.capacity > 0 ? Math.min(100, Math.round((v.used / v.capacity) * 100)) : 0
              const fillClass = pct >= 95 ? 'full' : pct >= 85 ? 'near' : ''
              return (
                <div key={v.id} className="cc-cap-row">
                  <div>
                    <div className="cc-cap-name">{v.name}</div>
                    <div className="cc-cap-role">{v.role}</div>
                  </div>
                  <div className="cc-cap-bar">
                    <div className={`cc-cap-fill ${fillClass}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="cc-cap-ratio">{v.used}/{v.capacity}</div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function LiveCallHero({ live, shortQuote }: { live: LiveCall | null; shortQuote: string }) {
  if (!live?.active) {
    // Empty / caught-up state — calmer treatment. Orb still breathes slowly so
    // the surface feels alive, but no pulse rings or waveform.
    return (
      <div className="cc-livecall cc-livecall-caught" data-urgency="IDLE">
        <div className="cc-stella-orb-wrap">
          <div className="cc-stella-orb">STELLA</div>
        </div>
        <div className="cc-livecall-body">
          <div className="cc-livecall-head">
            <span className="cc-livecall-caller">Stella is standing by</span>
            <span className="cc-urgency-pill cc-urgency-routine">READY</span>
          </div>
          <p className="cc-livecall-quote" style={{ fontStyle: 'normal', color: 'var(--text-secondary)' }}>
            Answering calls as they come in — your clinic is fully covered right now.
          </p>
        </div>
      </div>
    )
  }

  const urgencyClass =
    live.urgency === 'CRITICAL' ? 'cc-urgency-emergency' :
    live.urgency === 'URGENT'   ? 'cc-urgency-urgent'    :
                                  'cc-urgency-routine'
  const urgencyLabel = live.urgency === 'CRITICAL' ? 'EMERGENCY' : live.urgency

  // 14 bars with pseudo-random height seeds + delay offsets. Bars animate
  // independently so the waveform feels organic rather than 5 identical bouncy
  // sticks. The seeds are stable across renders — no `Math.random` — so React
  // doesn't re-key on every paint.
  const waveformBars = [
    { seed: 0.45, delay: 0    }, { seed: 0.72, delay: 0.08 },
    { seed: 0.58, delay: 0.16 }, { seed: 0.91, delay: 0.04 },
    { seed: 0.35, delay: 0.20 }, { seed: 0.80, delay: 0.12 },
    { seed: 0.55, delay: 0.02 }, { seed: 0.70, delay: 0.18 },
    { seed: 0.42, delay: 0.10 }, { seed: 0.88, delay: 0.06 },
    { seed: 0.50, delay: 0.14 }, { seed: 0.65, delay: 0.22 },
    { seed: 0.38, delay: 0.09 }, { seed: 0.78, delay: 0.17 },
  ]

  return (
    <div className="cc-livecall cc-livecall-active" data-urgency={live.urgency}>
      <div className="cc-stella-orb-wrap">
        {/* Two concentric rings expanding outward — the "incoming signal" cue. */}
        <span className="cc-orb-ring cc-orb-ring-1" aria-hidden />
        <span className="cc-orb-ring cc-orb-ring-2" aria-hidden />
        <div className="cc-stella-orb cc-stella-orb-active">STELLA</div>
      </div>

      <div className="cc-livecall-body">
        <div className="cc-livecall-head">
          <span className="cc-live-badge" aria-label="Call in progress">
            <span className="cc-live-badge-dot" aria-hidden />
            LIVE
          </span>
          <span className="cc-livecall-caller">{live.caller_name ?? 'Unknown caller'}</span>
          {live.patient && <span className="cc-livecall-meta">· {live.patient}</span>}
          <span className={`cc-urgency-pill ${urgencyClass}`}>
            {live.urgency !== 'ROUTINE' && <span className="dot" />}
            {urgencyLabel}
          </span>
          <LiveTimer startedAt={live.startedAt} />
        </div>

        {/* Always-present waveform — the visceral "conversation breath" signal.
            Unlike the old 5-bar wave which only showed with a trail summary. */}
        <div className="cc-waveform" aria-hidden>
          {waveformBars.map((b, i) => (
            <span
              key={i}
              style={{
                // Scale amplitude from the pseudo-random seed so bars don't
                // all hit 100% at once. 0.35 floor keeps the quietest bar
                // visible.
                ['--cc-bar-h' as string]: `${35 + b.seed * 65}%`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        {shortQuote && (
          <p className="cc-livecall-quote">&ldquo;{shortQuote}&rdquo;</p>
        )}
        {live.trailSummary && (
          <div className="cc-livecall-trail">
            <span>{live.trailSummary}</span>
          </div>
        )}
      </div>

      <div className="cc-livecall-actions">
        <button type="button" className="cc-btn cc-btn-secondary">Listen in</button>
        <button type="button" className="cc-btn cc-btn-primary cc-btn-takeover">
          Take over
        </button>
      </div>
    </div>
  )
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const elapsed = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000))
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return <span className="cc-livecall-timer">{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
}

function formatDueDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const todayStr = now.toDateString()
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()
    const dStr = d.toDateString()
    if (dStr === todayStr) return 'Today'
    if (dStr === tomorrowStr) return 'Tomorrow'
    if (d < now) return 'Overdue'
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  } catch { return 'Today' }
}

interface KpiCardProps {
  icon: ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string
  delta: { text: string; type: 'up' | 'down' | 'neutral' }
  spark: number[]
  sparkColor: string
}
function KpiCard({ icon, iconBg, iconColor, label, value, delta, spark, sparkColor }: KpiCardProps) {
  return (
    <div className="cc-kpi">
      <div className="cc-kpi-head">
        <div className="cc-kpi-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <div className="cc-kpi-label">{label}</div>
      </div>
      <div className="cc-kpi-value">{value}</div>
      <div className="cc-kpi-foot">
        <span className={`cc-delta cc-delta-${delta.type}`}>
          {delta.type === 'up' ? '▲' : delta.type === 'down' ? '▼' : '—'} {delta.text}
        </span>
        <Sparkline data={spark} color={sparkColor} ariaLabel={`${label} — last 14 days`} />
      </div>
    </div>
  )
}
