'use client'

import { ChevronRight, User } from 'lucide-react'
import type { Booking } from '@/lib/types'
import BookingStatusBadge from './BookingStatusBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const urgentTypes = new Set(['Emergency', 'Urgent Care'])

interface BookingRowProps {
  booking: Booking
  onClick: (booking: Booking) => void
}

export default function BookingRow({ booking, onClick }: BookingRowProps) {
  const isUrgent = urgentTypes.has(booking.appointmentType)

  return (
    <tr
      className={cn(
        'group hover:bg-muted/40 cursor-pointer transition-colors',
        isUrgent && 'border-l-2 border-l-red-500'
      )}
      onClick={() => onClick(booking)}
    >
      {/* Time */}
      <td className="px-4 py-3.5 w-24 whitespace-nowrap">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {formatTime(booking.scheduledAt)}
        </p>
      </td>

      {/* Patient */}
      <td className="px-4 py-3.5 w-48">
        <div className="flex items-center gap-2.5">
          <PatientAvatar name={booking.patient.name} species={booking.patient.species} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{booking.patient.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {booking.patient.breed} · {booking.patient.age}
            </p>
          </div>
        </div>
      </td>

      {/* Appointment type */}
      <td className="px-4 py-3.5">
        <p className={cn('text-xs font-medium', isUrgent ? 'text-red-600' : 'text-foreground')}>
          {booking.appointmentType}
        </p>
        {booking.notes && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{booking.notes}</p>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <BookingStatusBadge status={booking.status} />
      </td>

      {/* Assigned vet */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="w-3 h-3 shrink-0" />
          {booking.assignedVet}
        </div>
      </td>

      {/* Chevron */}
      <td className="px-3 py-3.5 w-8">
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </td>
    </tr>
  )
}
