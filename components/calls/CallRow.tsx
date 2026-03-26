'use client'

import { AlertTriangle, ChevronRight, Phone } from 'lucide-react'
import type { Call } from '@/lib/types'
import CallStatusBadge from './CallStatusBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatRelative, formatDuration } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface CallRowProps {
  call: Call
  onClick: (call: Call) => void
}

export default function CallRow({ call, onClick }: CallRowProps) {
  return (
    <tr
      className={cn(
        'group hover:bg-muted/40 cursor-pointer transition-colors',
        call.urgencyFlag && 'border-l-2 border-l-red-500'
      )}
      onClick={() => onClick(call)}
    >
      {/* Caller / patient */}
      <td className="px-4 py-3.5 w-52">
        <div className="flex items-center gap-2.5">
          {call.patient ? (
            <PatientAvatar name={call.patient.name} species={call.patient.species} size="sm" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{call.callerName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{call.callerPhone}</p>
          </div>
        </div>
      </td>

      {/* Patient link */}
      <td className="px-4 py-3.5 w-36">
        {call.patient ? (
          <div>
            <p className="text-xs font-medium text-foreground">{call.patient.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {call.patient.species} · {call.patient.breed}
            </p>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">No patient linked</span>
        )}
      </td>

      {/* AI summary */}
      <td className="px-4 py-3.5">
        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{call.aiSummary}</p>
      </td>

      {/* Status + flag */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <CallStatusBadge status={call.status} />
          {call.urgencyFlag && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" strokeWidth={2.5} />
          )}
        </div>
      </td>

      {/* Time + duration */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="text-xs font-medium text-foreground">{formatRelative(call.timestamp)}</p>
        <p className="text-[11px] text-muted-foreground">{formatDuration(call.durationSeconds)}</p>
      </td>

      {/* Chevron */}
      <td className="px-3 py-3.5 w-8">
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </td>
    </tr>
  )
}
