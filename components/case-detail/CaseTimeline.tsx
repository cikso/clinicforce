import { cn } from '@/lib/utils'
import type { CaseEvent, CaseEventType } from '@/lib/types'
import { formatTime } from '@/lib/formatters'
import {
  LogIn,
  Stethoscope,
  UserCheck,
  PhoneCall,
  Send,
  CalendarPlus,
  StickyNote,
  LogOut,
} from 'lucide-react'

const eventConfig: Record<
  CaseEventType,
  { label: string; icon: React.ElementType; iconClass: string; dotClass: string }
> = {
  CHECKED_IN: {
    label: 'Checked in',
    icon: LogIn,
    iconClass: 'text-teal-500',
    dotClass: 'bg-teal-500',
  },
  TRIAGE_ASSESSED: {
    label: 'Triage assessed',
    icon: Stethoscope,
    iconClass: 'text-orange-500',
    dotClass: 'bg-orange-500',
  },
  VET_ASSIGNED: {
    label: 'Vet assigned',
    icon: UserCheck,
    iconClass: 'text-primary',
    dotClass: 'bg-primary',
  },
  CALL_LOGGED: {
    label: 'Call logged',
    icon: PhoneCall,
    iconClass: 'text-purple-500',
    dotClass: 'bg-purple-500',
  },
  REFERRAL_SENT: {
    label: 'Referral sent',
    icon: Send,
    iconClass: 'text-teal-500',
    dotClass: 'bg-teal-500',
  },
  FOLLOW_UP_SCHEDULED: {
    label: 'Follow-up scheduled',
    icon: CalendarPlus,
    iconClass: 'text-green-500',
    dotClass: 'bg-green-500',
  },
  NOTE_ADDED: {
    label: 'Note added',
    icon: StickyNote,
    iconClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
  DISCHARGED: {
    label: 'Discharged',
    icon: LogOut,
    iconClass: 'text-gray-400',
    dotClass: 'bg-gray-400',
  },
}

interface CaseTimelineProps {
  events: CaseEvent[]
}

export default function CaseTimeline({ events }: CaseTimelineProps) {
  return (
    <div className="px-5 py-4">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Case timeline
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-1 bottom-1 w-px bg-border" />

        <div className="space-y-4">
          {events.map((event, i) => {
            const cfg = eventConfig[event.type]
            const Icon = cfg.icon
            const isLast = i === events.length - 1

            return (
              <div key={event.id} className="flex gap-3 relative">
                {/* Icon dot */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white border border-border z-10',
                    isLast && 'ring-2 ring-offset-1 ring-border'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', cfg.iconClass)} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{event.note}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{event.actor}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
