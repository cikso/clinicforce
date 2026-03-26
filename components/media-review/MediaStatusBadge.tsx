import { cn } from '@/lib/utils'
import type { MediaStatus } from '@/lib/types'

const config: Record<MediaStatus, { label: string; className: string }> = {
  PENDING_REVIEW: {
    label: 'Pending review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  REVIEWED: {
    label: 'Reviewed',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  FLAGGED: {
    label: 'Flagged',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
}

interface MediaStatusBadgeProps {
  status: MediaStatus
  className?: string
}

export default function MediaStatusBadge({ status, className }: MediaStatusBadgeProps) {
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
