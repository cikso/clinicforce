import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  highlight?: boolean
  className?: string
}

export default function StatCard({ label, value, unit, delta, highlight = false, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        'shadow-[var(--shadow-card)]',
        highlight
          ? 'bg-[var(--error-light)] border-[var(--error)]'
          : 'bg-[var(--bg-primary)] border-[var(--border)]',
        className,
      )}
    >
      <p className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--text-secondary)] mb-2">
        {label}
      </p>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[30px] font-bold text-[var(--text-primary)] font-heading leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[13px] text-[var(--text-tertiary)]">{unit}</span>
        )}
      </div>

      {delta && (
        <div className="flex items-center gap-1 mt-2">
          {delta.direction === 'up' && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--success)]">
              <path d="M6 2.5L9.5 6.5H2.5L6 2.5Z" fill="currentColor" />
            </svg>
          )}
          {delta.direction === 'down' && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--error)]">
              <path d="M6 9.5L2.5 5.5H9.5L6 9.5Z" fill="currentColor" />
            </svg>
          )}
          <span
            className={cn(
              'text-[12px] font-medium',
              delta.direction === 'up' && 'text-[var(--success)]',
              delta.direction === 'down' && 'text-[var(--error)]',
              delta.direction === 'neutral' && 'text-[var(--text-tertiary)]',
            )}
          >
            {delta.value}
          </span>
        </div>
      )}
    </div>
  )
}
