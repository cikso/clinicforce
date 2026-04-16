import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableEmptyRowProps {
  /** Required — must match the number of visible columns in the table. */
  colSpan:     number
  icon?:       ReactNode
  title:       string
  description?: string
  className?:  string
}

/**
 * Empty-state row for use inside a `<tbody>`. Renders an icon + title +
 * description inline-ish within a single `<td colSpan>`. Use this instead of
 * the block `EmptyState` when the empty state needs to live in a table cell —
 * nesting a block element inside `<td>` is valid but the vertical padding of
 * the default `EmptyState` looks wrong inside a table row.
 */
export default function TableEmptyRow({
  colSpan,
  icon,
  title,
  description,
  className,
}: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-4 py-10 text-center', className)}>
        <div className="flex flex-col items-center gap-2">
          {icon && (
            <div className="w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)]">
              {icon}
            </div>
          )}
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)] font-heading">
              {title}
            </p>
            {description && (
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 max-w-[320px] mx-auto">
                {description}
              </p>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}
