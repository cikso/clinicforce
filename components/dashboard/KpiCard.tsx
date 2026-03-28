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
  blue:  { icon: 'text-[#0f5b8a]', iconBg: 'bg-[#eaf3fb]', border: 'border-l-[#0f5b8a]', value: 'text-[#0f2744]' },
  amber: { icon: 'text-amber-600',  iconBg: 'bg-amber-50',  border: 'border-l-amber-400',  value: 'text-slate-900' },
  red:   { icon: 'text-rose-600',   iconBg: 'bg-rose-50',   border: 'border-l-rose-400',   value: 'text-slate-900' },
  teal:  { icon: 'text-teal-600',   iconBg: 'bg-teal-50',   border: 'border-l-teal-400',   value: 'text-slate-900' },
  slate: { icon: 'text-slate-500',  iconBg: 'bg-slate-100', border: 'border-l-slate-300',  value: 'text-slate-800' },
}

export default function KpiCard({
  title, value, context, icon,
  accentColor = 'blue', pulse = false,
}: KpiCardProps) {
  const a = accentMap[accentColor]

  return (
    <div className={`bg-white rounded-xl border border-slate-100 border-l-4 ${a.border} px-5 py-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center relative`}>
          <span className={a.icon}>{icon}</span>
          {pulse && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-1.5">
        <p className={`text-3xl font-extrabold leading-none tracking-tight ${a.value}`}>{value}</p>
        <p className="text-xs text-slate-400 font-medium">{context}</p>
      </div>
    </div>
  )
}
