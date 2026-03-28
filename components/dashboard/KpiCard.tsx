interface KpiCardProps {
  title: string
  value: string | number
  context: string
  icon: React.ReactNode
  accentColor?: 'teal' | 'amber' | 'red' | 'green' | 'slate'
  pulse?: boolean
}

const accentMap = {
  teal:  { icon: 'text-[#0891b2]', border: 'border-l-[#0891b2]', value: 'text-[#0f2744]' },
  amber: { icon: 'text-amber-500',  border: 'border-l-amber-400',  value: 'text-slate-800' },
  red:   { icon: 'text-rose-500',   border: 'border-l-rose-400',   value: 'text-slate-800' },
  green: { icon: 'text-emerald-500',border: 'border-l-emerald-400',value: 'text-slate-800' },
  slate: { icon: 'text-slate-400',  border: 'border-l-slate-300',  value: 'text-slate-700' },
}

export default function KpiCard({
  title, value, context, icon,
  accentColor = 'teal', pulse = false,
}: KpiCardProps) {
  const a = accentMap[accentColor]

  return (
    <div className={`bg-white rounded-xl border border-slate-200/70 border-l-[3px] ${a.border} px-4 py-4 shadow-[0_1px_3px_rgba(15,39,68,0.06)] hover:shadow-[0_3px_8px_rgba(15,39,68,0.09)] transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
        <div className="flex items-center gap-1.5">
          {pulse && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />}
          <span className={`${a.icon} opacity-50`}>{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className={`text-[28px] font-bold leading-none tracking-tight ${a.value}`}>{value}</p>
        <p className="text-[11px] text-slate-400">{context}</p>
      </div>
    </div>
  )
}
