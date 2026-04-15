'use client'

import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { Call } from '@/lib/types'
import CallStatusBadge from './CallStatusBadge'
import { formatRelative, formatDuration } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface CallRowProps {
  call: Call
  onClick: (call: Call) => void
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function CallRow({ call, onClick }: CallRowProps) {
  const isUrgent = call.urgency === 'CRITICAL' || call.urgency === 'URGENT'

  return (
    <tr
      className={cn(
        'group hover:bg-muted/40 cursor-pointer transition-colors',
        isUrgent && 'border-l-2 border-l-red-500'
      )}
      onClick={() => onClick(call)}
    >
      {/* Caller */}
      <td className="px-4 py-3.5 w-52">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
            style={{ background: isUrgent ? '#DC2626' : '#17C4BE' }}
          >
            {initials(call.callerName)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{call.callerName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{call.callerPhone}</p>
          </div>
        </div>
      </td>

      {/* Pet */}
      <td className="px-4 py-3.5 w-36">
        {call.petName && call.petName !== '—' ? (
          <div>
            <p className="text-xs font-medium text-foreground">{call.petName}</p>
            <p className="text-[11px] text-muted-foreground">{call.petSpecies}</p>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">No pet linked</span>
        )}
      </td>

      {/* AI summary */}
      <td className="px-4 py-3.5">
        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{call.summary}</p>
      </td>

      {/* Status + urgency flag */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <CallStatusBadge status={call.status} />
          {isUrgent && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" strokeWidth={2.5} />
          )}
        </div>
      </td>

      {/* Time + duration */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="text-xs font-medium text-foreground">{formatRelative(call.createdAt)}</p>
        <p className="text-[11px] text-muted-foreground">
          {call.callDurationSeconds != null ? formatDuration(call.callDurationSeconds) : '—'}
        </p>
      </td>

      {/* Chevron */}
      <td className="px-3 py-3.5 w-8">
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </td>
    </tr>
  )
}
