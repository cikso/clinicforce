import { cn } from '@/lib/utils'
import type { TriageLevel } from '@/lib/types'

const config: Record<TriageLevel, { label: string; className: string }> = {
  URGENT: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  ROUTINE: {
    label: 'Routine',
    className: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  FOLLOW_UP: {
    label: 'Follow-up',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

interface TriageBadgeProps {
  level: TriageLevel
  className?: string
}

export default function TriageBadge({ level, className }: TriageBadgeProps) {
  const { label, className: base } = config[level]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border tracking-wide',
        base,
        className
      )}
    >
      {label}
    </span>
  )
}
