import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="w-12 h-12 flex items-center justify-center text-[var(--text-tertiary)] mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-[16px] font-semibold text-[var(--text-primary)] font-heading">
        {title}
      </h3>

      {description && (
        <p className="text-[14px] text-[var(--text-secondary)] mt-1.5 max-w-[320px] leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
