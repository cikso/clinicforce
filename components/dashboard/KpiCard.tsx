import type { StatTrend } from '@/app/api/stats/route'

interface KpiCardProps {
  title:        string
  value:        string | number
  context:      string
  icon?:        React.ReactNode
  accentColor?: 'teal' | 'amber' | 'red' | 'green' | 'slate' | 'blue'
  pulse?:       boolean
  trend?:       StatTrend | null
}

const accentBarMap: Record<NonNullable<KpiCardProps['accentColor']>, string> = {
  teal:  'bg-[var(--brand)]',
  amber: 'bg-amber-500',
  red:   'bg-[var(--error)]',
  green: 'bg-emerald-500',
  slate: 'bg-slate-400',
  blue:  'bg-[var(--brand)]',
}

const trendPillMap: Record<NonNullable<StatTrend['direction']>, string> = {
  up:   'bg-emerald-50 text-emerald-700',
  down: 'bg-red-50 text-[var(--error)]',
  same: 'bg-slate-100 text-slate-500',
  new:  'bg-[var(--brand-light)] text-[var(--brand)]',
}

export default function KpiCard({
  title, value, context,
  accentColor = 'blue',
  pulse = false, trend,
}: KpiCardProps) {
  const bar = accentBarMap[accentColor]

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden shadow-sm hover:shadow transition-shadow">

      {/* Colored accent bar */}
      <div className={`h-[3px] w-full ${bar}`} />

      <div className="px-5 py-4">
        {/* Title row */}
        <div className="flex items-center gap-1.5 mb-3">
          {pulse && <span className="w-1.5 h-1.5 bg-[var(--error)] rounded-full animate-pulse shrink-0" />}
          <p className="text-[11px] font-semibold text-[var(--text-body)] uppercase tracking-[0.08em] whitespace-nowrap leading-none">
            {title}
          </p>
        </div>

        {/* Number + context */}
        <div className="flex items-baseline gap-2 mb-2">
          <p className="kpi-stat-value text-[2.75rem] font-bold leading-none tracking-tight tabular-nums">{value}</p>
          <p className="text-sm text-[var(--text-tertiary)]">{context}</p>
        </div>

        {/* Trend pill */}
        {trend?.direction != null && trend.label && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trendPillMap[trend.direction]}`}>
            {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}
