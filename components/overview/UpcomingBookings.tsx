import { CalendarDays } from 'lucide-react'
import { mockBookings } from '@/data/mock-bookings'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

const statusStyles: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-blue-50 text-blue-700',
  CHECKED_IN: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-50 text-red-600',
  NO_SHOW: 'bg-orange-50 text-orange-600',
}

const statusLabel: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
}

// Show upcoming/active bookings, sorted by time
const upcoming = [...mockBookings]
  .filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
  .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  .slice(0, 5)

export default function UpcomingBookings() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-foreground">Upcoming Bookings</h2>
          <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
            {mockBookings.length} today
          </span>
        </div>
        <button className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {upcoming.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            {/* Time column */}
            <div className="w-14 shrink-0 text-right">
              <p className="text-xs font-semibold text-foreground">
                {formatTime(booking.scheduledAt)}
              </p>
            </div>

            <div className="w-px h-8 bg-border shrink-0" />

            <PatientAvatar
              name={booking.patient.name}
              species={booking.patient.species}
              size="sm"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{booking.patient.name}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded',
                    statusStyles[booking.status]
                  )}
                >
                  {statusLabel[booking.status]}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {booking.appointmentType} · {booking.assignedVet}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
