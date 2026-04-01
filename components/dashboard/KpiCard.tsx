import type { StatTrend } from '@/app/api/stats/route'

interface KpiCardProps {
  title:        string
  value:        string | number
  context:      string
  icon?:        React.ReactNode   // retained for call-site compat but not rendered
  accentColor?: 'teal' | 'amber' | 'red' | 'green' | 'slate'
  pulse?:       boolean
  trend?:       StatTrend | null
}

const trendStyle: Record<NonNullable<StatTrend['direction']>, string> = {
  up:   'text-emerald-600',
  down: 'text-rose-500',
  same: 'text-slate-400',
  new:  'text-[#0891b2]',
}

export default function KpiCard({
  title, value, context,
  pulse = false, trend,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-[0_1px_3px_rgba(15,39,68,0.04)] hover:shadow-[0_3px_8px_rgba(15,39,68,0.08)] transition-shadow">

      {/* Title row */}
      <div className="flex items-center gap-1.5 mb-3">
        {pulse && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />}
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none">{title}</p>
      </div>

      {/* Number + context */}
      <div className="flex items-baseline gap-2">
        <p className="text-5xl font-bold leading-none tracking-tight text-slate-900">{value}</p>
        <p className="text-sm text-slate-400">{context}</p>
      </div>

      {/* Trend */}
      {trend?.direction != null && trend.label && (
        <p className={`mt-2.5 text-sm font-medium leading-none ${trendStyle[trend.direction]}`}>
          {trend.label}
        </p>
      )}
    </div>
  )
}
