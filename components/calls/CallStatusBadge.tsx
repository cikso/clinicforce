import { cn } from '@/lib/utils'
import type { CallStatus } from '@/lib/types'

const config: Record<CallStatus, { label: string; className: string }> = {
  UNREAD: {
    label: 'Unread',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  READ: {
    label: 'Reviewed',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  ACTIONED: {
    label: 'Actioned',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
}

interface CallStatusBadgeProps {
  status: CallStatus
  className?: string
}

export default function CallStatusBadge({ status, className }: CallStatusBadgeProps) {
  const { label, className: base } = config[status] ?? config['UNREAD']
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
