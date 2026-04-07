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

const TREND_CONFIG: Record<NonNullable<StatTrend['direction']>, { color: string; arrow: string }> = {
  up:   { color: 'text-[#28a745]', arrow: '↑' },
  down: { color: 'text-[#dc3545]', arrow: '↓' },
  same: { color: 'text-[#888]',    arrow: '→' },
  new:  { color: 'text-[#007bff]', arrow: '↗' },
}

export default function KpiCard({
  title, value, context, pulse = false, trend,
}: KpiCardProps) {
  const trendCfg = trend?.direction != null ? TREND_CONFIG[trend.direction] : null

  return (
    <div className="bg-white rounded-lg border border-[#e9ecef] px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.07)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.11)] transition-shadow">

      {/* Title */}
      <div className="flex items-center gap-1.5 mb-3">
        {pulse && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />}
        <p className="text-[0.75rem] font-semibold text-[#555] uppercase tracking-widest leading-none">
          {title}
        </p>
      </div>

      {/* Number + context */}
      <div className="flex items-baseline gap-2 mb-2.5">
        <p className="text-[2.4rem] font-bold leading-none text-[#1a1a1a] tracking-tight">
          {value}
        </p>
        <p className="text-[0.95rem] text-[#555]">{context}</p>
      </div>

      {/* Trend */}
      {trendCfg && trend?.label && (
        <div className={`flex items-center gap-1 text-[0.82rem] font-semibold ${trendCfg.color}`}>
          <span className="text-[1rem] leading-none">{trendCfg.arrow}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
