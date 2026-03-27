import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  context: string
  trend?: string
  trendUp?: boolean
  trendNeutral?: boolean
  icon: React.ReactNode
  accentColor?: 'blue' | 'amber' | 'red' | 'teal' | 'slate'
  pulse?: boolean
}

const accentMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-[#0f5b8a]', bar: 'bg-[#0f5b8a]' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', bar: 'bg-amber-500' },
  red: { bg: 'bg-rose-50', icon: 'text-rose-600', bar: 'bg-[#b91c1c]' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', bar: 'bg-teal-500' },
  slate: { bg: 'bg-slate-100', icon: 'text-slate-600', bar: 'bg-slate-400' },
}

export default function KpiCard({
  title,
  value,
  context,
  trend,
  trendUp,
  trendNeutral,
  icon,
  accentColor = 'blue',
  pulse = false,
}: KpiCardProps) {
  const accent = accentMap[accentColor]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-full ${accent.bg} flex items-center justify-center relative`}>
          <span className={accent.icon}>{icon}</span>
          {pulse && (
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-[#b91c1c] rounded-full border-2 border-white" />
          )}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              trendNeutral
                ? 'bg-slate-100 text-slate-600'
                : trendUp
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {!trendNeutral &&
              (trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          <p className="text-xs font-medium text-slate-500">{context}</p>
        </div>
      </div>
    </div>
  )
}
