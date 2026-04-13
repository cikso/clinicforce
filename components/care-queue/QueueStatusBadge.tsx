import { cn } from '@/lib/utils'
import type { QueueStatus } from '@/lib/types'

const config: Record<QueueStatus, { label: string; className: string }> = {
  WAITING: {
    label: 'Waiting',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  WITH_VET: {
    label: 'With vet',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  PENDING_DISCHARGE: {
    label: 'Pending discharge',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
}

interface QueueStatusBadgeProps {
  status: QueueStatus
  className?: string
}

export default function QueueStatusBadge({ status, className }: QueueStatusBadgeProps) {
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
