import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  header?: {
    title: string
    subtitle?: string
    action?: ReactNode
  }
  footer?: ReactNode
}

export default function Card({ children, className, header, footer }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl',
        'shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {header && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] font-heading">
              {header.title}
            </h3>
            {header.subtitle && (
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{header.subtitle}</p>
            )}
          </div>
          {header.action && <div>{header.action}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-[var(--border-subtle)]">{footer}</div>
      )}
    </div>
  )
}
