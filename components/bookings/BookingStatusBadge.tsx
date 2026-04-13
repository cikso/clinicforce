import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

const config: Record<BookingStatus, { label: string; className: string }> = {
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  CHECKED_IN: {
    label: 'Checked in',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-600 border-red-200',
  },
  NO_SHOW: {
    label: 'No show',
    className: 'bg-orange-50 text-orange-600 border-orange-200',
  },
}

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

export default function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const { label, className: base } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border',
        base,
        className
      )}
    >
      {label}
    </span>
  )
}
