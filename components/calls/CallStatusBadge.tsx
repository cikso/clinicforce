import { cn } from '@/lib/utils'
import type { CallStatus } from '@/lib/types'

const config: Record<CallStatus, { label: string; className: string }> = {
  UNREVIEWED: {
    label: 'Unreviewed',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  REVIEWED: {
    label: 'Reviewed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ESCALATED: {
    label: 'Escalated',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
}

interface CallStatusBadgeProps {
  status: CallStatus
  className?: string
}

export default function CallStatusBadge({ status, className }: CallStatusBadgeProps) {
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
