import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?:        ReactNode
  title:        string
  description?: string
  action?:      ReactNode
  className?:   string
  /**
   * Visual size of the empty state.
   * - `default` — for main card/page-level empties (py-12, 24px icon wrapper)
   * - `sm`      — compact variant for chart containers or tight cards where
   *               the standard size would overflow (py-4, 16px icon wrapper,
   *               tighter type scale)
   */
  size?:        'default' | 'sm'
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'default',
}: EmptyStateProps) {
  const isSm = size === 'sm'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isSm ? 'py-4 px-3' : 'py-12 px-4',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center text-[var(--text-tertiary)]',
            isSm ? 'w-8 h-8 mb-2' : 'w-12 h-12 mb-4',
          )}
        >
          {icon}
        </div>
      )}

      <h3
        className={cn(
          'font-semibold text-[var(--text-primary)] font-heading',
          isSm ? 'text-[13px]' : 'text-[16px]',
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            'text-[var(--text-secondary)] leading-relaxed',
            isSm ? 'text-[12px] mt-1 max-w-[240px]' : 'text-[14px] mt-1.5 max-w-[320px]',
          )}
        >
          {description}
        </p>
      )}

      {action && <div className={cn(isSm ? 'mt-2' : 'mt-4')}>{action}</div>}
    </div>
  )
}
