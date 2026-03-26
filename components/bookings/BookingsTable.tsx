'use client'

import type { Booking } from '@/lib/types'
import BookingRow from './BookingRow'
import { CalendarX } from 'lucide-react'

interface BookingsTableProps {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
}

export default function BookingsTable({ bookings, onSelect }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <CalendarX className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium">No bookings match these filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Patient
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Appointment
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Vet
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <BookingRow key={b.id} booking={b} onClick={onSelect} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
