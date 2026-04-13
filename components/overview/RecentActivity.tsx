import { Activity } from 'lucide-react'
import { mockActivity } from '@/data/mock-activity'
import { formatRelative } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const tagStyles = {
  urgent: 'bg-red-500',
  info: 'bg-teal-400',
  resolved: 'bg-green-500',
}

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        </div>
      </div>

      <div className="px-4 py-2 divide-y divide-border/60">
        {mockActivity.map((event) => (
          <div key={event.id} className="flex items-start gap-3 py-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-0.5 shrink-0">
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  event.tag ? tagStyles[event.tag] : 'bg-muted-foreground/30'
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">
                {event.patientName && (
                  <span className="font-semibold">{event.patientName} — </span>
                )}
                {event.action}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{event.actor}</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelative(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
