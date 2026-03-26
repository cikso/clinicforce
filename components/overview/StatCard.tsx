import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  variant?: 'default' | 'urgent' | 'warning' | 'info'
  suffix?: string
  description?: string
}

const variantStyles = {
  default: {
    card: 'bg-white border border-border',
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  urgent: {
    card: 'bg-white border border-red-200',
    icon: 'bg-red-50 text-red-600',
    value: 'text-red-600',
  },
  warning: {
    card: 'bg-white border border-orange-200',
    icon: 'bg-orange-50 text-orange-600',
    value: 'text-orange-600',
  },
  info: {
    card: 'bg-white border border-blue-100',
    icon: 'bg-blue-50 text-blue-600',
    value: 'text-blue-600',
  },
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  suffix,
  description,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className={cn('rounded-xl p-4 shadow-sm flex flex-col gap-3', styles.card)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', styles.icon)}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-2xl font-bold tracking-tight', styles.value)}>
            {value}
          </span>
          {suffix && (
            <span className="text-xs text-muted-foreground font-medium">{suffix}</span>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground/70 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
