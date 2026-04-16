import { AlertTriangle } from 'lucide-react'
import { mockAlerts } from '@/data/mock-alerts'
import Link from 'next/link'

export default function AlertsPanel() {
  const active = mockAlerts.filter((a) => !a.acknowledged).slice(0, 3)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Urgent Alerts
        </h2>
        <Link href="/care-queue" className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {active.map((alert) => {
          const isUrgent = alert.triageLevel === 'URGENT'
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                isUrgent ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
              }`}
            >
              <div>
                <h4 className={`font-bold ${isUrgent ? 'text-red-900' : 'text-orange-900'}`}>
                  {alert.patient.name} ({alert.patient.breed})
                </h4>
                <p className={`text-sm mt-1 ${isUrgent ? 'text-red-700' : 'text-orange-800'}`}>
                  {alert.message}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isUrgent ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {alert.triageLevel}
                </span>
              </div>
            </div>
          )
        })}
        {active.length === 0 && (
          <p className="text-sm text-slate-500 py-4 text-center">No active alerts</p>
        )}
      </div>
    </section>
  )
}
