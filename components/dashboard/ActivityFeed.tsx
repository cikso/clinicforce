import { ActivityItem } from '@/data/mock-dashboard'
import { AlertTriangle, Phone, Calendar, CheckCircle, Radio, Zap } from 'lucide-react'

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  escalation: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-[#b91c1c] bg-rose-50' },
  callback:   { icon: <Phone className="w-3.5 h-3.5" />, color: 'text-[#00D68F] bg-teal-50' },
  booking:    { icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-sky-600 bg-sky-50' },
  coverage:   { icon: <Radio className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50' },
  handled:    { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-slate-500 bg-slate-100' },
  // Legacy keys kept for backward compat
  call:       { icon: <Phone className="w-3.5 h-3.5" />, color: 'text-[#00D68F] bg-teal-50' },
  case:       { icon: <Zap className="w-3.5 h-3.5" />, color: 'text-amber-600 bg-amber-50' },
  assignment: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-teal-600 bg-teal-50' },
  system:     { icon: <Radio className="w-3.5 h-3.5" />, color: 'text-slate-500 bg-slate-100' },
}

function relativeTime(ts: Date): string {
  const diff = Math.floor((Date.now() - ts.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">System Activity</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</span>
      </div>

      <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
        {activities.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">No recent activity.</p>
        )}
        {activities.map((item) => {
          const cfg = typeConfig[item.type]
          return (
            <div key={item.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{item.message}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{relativeTime(item.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
