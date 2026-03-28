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
  blue:  { icon: 'text-[#0f5b8a]', iconBg: 'bg-[#e8f4fd]', border: 'border-l-[#0f5b8a]', value: 'text-[#0f2744]' },
  amber: { icon: 'text-amber-600',  iconBg: 'bg-amber-50',   border: 'border-l-amber-400',  value: 'text-amber-900' },
  red:   { icon: 'text-rose-600',   iconBg: 'bg-rose-50',    border: 'border-l-rose-500',   value: 'text-rose-900' },
  teal:  { icon: 'text-teal-600',   iconBg: 'bg-teal-50',    border: 'border-l-teal-500',   value: 'text-teal-900' },
  slate: { icon: 'text-slate-500',  iconBg: 'bg-slate-100',  border: 'border-l-slate-400',  value: 'text-slate-800' },
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
    <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${accent.border} p-5 shadow-sm flex flex-col justify-between min-h-[148px] transition-shadow hover:shadow-md`}>

      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${accent.iconBg} flex items-center justify-center relative shrink-0`}>
          <span className={accent.icon}>{icon}</span>
          {pulse && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
            trendNeutral
              ? 'bg-slate-100 text-slate-500'
              : trendUp
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-600'
          }`}>
            {!trendNeutral && (trendUp
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Bottom: number + label */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <p className={`text-[2rem] font-extrabold leading-none tracking-tight ${accent.value}`}>{value}</p>
          <p className="text-xs font-medium text-slate-400 mb-0.5">{context}</p>
        </div>
      </div>
    </div>
  )
}
