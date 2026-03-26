'use client'

import { Clock, User, MapPin, ChevronRight } from 'lucide-react'
import type { QueueEntry } from '@/lib/types'
import TriageBadge from '@/components/shared/TriageBadge'
import QueueStatusBadge from './QueueStatusBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatWait, formatTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface QueueRowProps {
  entry: QueueEntry
  onClick: (entry: QueueEntry) => void
}

const urgentRowBorder: Record<string, string> = {
  URGENT: 'border-l-2 border-l-red-500',
  HIGH: 'border-l-2 border-l-orange-400',
  ROUTINE: 'border-l-2 border-l-transparent',
  FOLLOW_UP: 'border-l-2 border-l-transparent',
}

export default function QueueRow({ entry, onClick }: QueueRowProps) {
  return (
    <tr
      className={cn(
        'group hover:bg-muted/40 cursor-pointer transition-colors',
        urgentRowBorder[entry.triageLevel]
      )}
      onClick={() => onClick(entry)}
    >
      {/* Patient */}
      <td className="px-4 py-3.5 w-56">
        <div className="flex items-center gap-2.5">
          <PatientAvatar name={entry.patient.name} species={entry.patient.species} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{entry.patient.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {entry.patient.breed} · {entry.patient.age}
            </p>
          </div>
        </div>
      </td>

      {/* Chief concern */}
      <td className="px-4 py-3.5">
        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
          {entry.chiefConcern}
        </p>
        {entry.notes && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{entry.notes}</p>
        )}
      </td>

      {/* Triage */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <TriageBadge level={entry.triageLevel} />
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <QueueStatusBadge status={entry.queueStatus} />
      </td>

      {/* Wait / arrival */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="font-medium text-foreground">{formatWait(entry.waitMinutes)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Arrived {formatTime(entry.arrivalTime)}
        </p>
      </td>

      {/* Assigned / room */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {entry.assignedTo ? (
          <div>
            <div className="flex items-center gap-1 text-xs text-foreground">
              <User className="w-3 h-3 text-muted-foreground shrink-0" />
              {entry.assignedTo}
            </div>
            {entry.room && (
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                {entry.room}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs font-medium text-orange-600">Unassigned</span>
        )}
      </td>

      {/* Chevron */}
      <td className="px-3 py-3.5 w-8">
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </td>
    </tr>
  )
}
