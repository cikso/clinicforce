import { Activity, AlertTriangle, Calendar, Clock } from 'lucide-react'
import { mockStats } from '@/data/mock-stats'

const stats = [
  {
    title: 'Active Cases',
    value: String(mockStats.totalQueueVolume),
    trend: '+12% from yesterday',
    trendType: 'positive',
    icon: Activity,
    color: 'blue',
  },
  {
    title: 'Pending Triage',
    value: String(mockStats.patientsInQueue),
    subtitle: 'Cases waiting',
    icon: AlertTriangle,
    color: 'orange',
    urgencyBar: true,
  },
  {
    title: 'Upcoming Appts',
    value: String(mockStats.bookingsToday),
    subtitle: "Today's schedule",
    icon: Calendar,
    color: 'slate',
  },
  {
    title: 'Emergency Level',
    value: String(mockStats.emergencyLevel).padStart(2, '0'),
    subtitle: 'Immediate attention required',
    icon: Clock,
    color: 'red',
    alert: true,
  },
]

export default function OverviewStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

function StatCard({ title, value, trend, subtitle, icon: Icon, color, urgencyBar, alert }: {
  title: string
  value: string
  trend?: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  urgencyBar?: boolean
  alert?: boolean
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-teal-600 bg-teal-50',
    orange: 'text-orange-600 bg-orange-50',
    slate: 'text-slate-600 bg-slate-50',
    red: 'text-red-600 bg-red-50',
  }

  return (
    <div className={`bg-white p-5 rounded-xl border ${alert ? 'border-red-200 shadow-sm shadow-red-100' : 'border-slate-200 shadow-sm'} flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && (
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className="mt-4 flex-1 flex items-end flex-col gap-1">
        {trend && <p className="text-sm font-medium text-emerald-600 self-start">{trend}</p>}
        {subtitle && <p className="text-sm text-slate-500 self-start">{subtitle}</p>}
        {urgencyBar && (
          <div className="w-full flex h-1.5 rounded-full overflow-hidden gap-0.5 mt-1">
            <div className="bg-red-500 w-1/2 rounded-full"></div>
            <div className="bg-orange-400 w-1/4 rounded-full"></div>
            <div className="bg-slate-200 w-1/4 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
}
