'use client'

import { useMemo, useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * DataTable — generic, Salesforce-tier table primitive.
 *
 * Design goals:
 *   • One source of truth for column ordering, header rendering, sortability.
 *   • Sticky header.
 *   • Click-to-sort on columns that opt in via `sortValue`.
 *   • Optional row actions column (rendered sticky on the right).
 *   • Empty / loading states passed in, not baked.
 *   • Keyboard navigation: ↑/↓ moves focus between rows, Enter fires onRowClick.
 *
 * What it deliberately does NOT do (yet):
 *   • Virtualisation — defer until a surface has >500 rows.
 *   • Pagination — deferred; datasets are bounded.
 *   • Column resizing / reordering — low ROI, high complexity.
 *   • Built-in filter UI — surfaces still own their filter bar (more flexible).
 */

export interface DataTableColumn<T> {
  /** Stable column id, used for sort state + React keys. */
  id: string
  /** Human-readable header. */
  header: string
  /** Cell renderer for a given row. */
  cell: (row: T) => React.ReactNode
  /**
   * Return a comparable value for sorting this row by this column. When
   * present, the column header becomes clickable. Numbers sort numerically;
   * strings sort case-insensitively; null/undefined sort last.
   */
  sortValue?: (row: T) => string | number | null | undefined
  /** CSS grid track size for this column (e.g. `'2fr'`, `'160px'`). */
  width?: string
  /** Horizontal alignment of the cell content. */
  align?: 'left' | 'right' | 'center'
  /** Optional tighter header classes — e.g. narrow icon-only columns. */
  headerClassName?: string
  /** Optional cell classes applied in addition to the base. */
  cellClassName?: string
}

type SortDirection = 'asc' | 'desc'

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  /** Stable id extractor — used for keys + keyboard focus tracking. */
  getRowId: (row: T) => string
  /** Fires when a row is clicked or Enter-pressed. */
  onRowClick?: (row: T) => void
  /**
   * Optional trailing-column renderer for per-row actions (e.g. kebab menu,
   * chevron). Rendered inside a 44px fixed-width cell on the right.
   */
  rowActions?: (row: T) => React.ReactNode
  /** Rendered in place of rows when data is empty. */
  emptyState?: React.ReactNode
  /** Skeleton shimmer when true. */
  loading?: boolean
  /** Initial sort state. Ignored if the column has no sortValue. */
  defaultSort?: { columnId: string; direction: SortDirection }
  /** Accessible label for the table region. */
  ariaLabel?: string
  /** Override the card container class if surface wants a flat look. */
  className?: string
}

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  rowActions,
  emptyState,
  loading = false,
  defaultSort,
  ariaLabel,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ columnId: string; direction: SortDirection } | null>(
    defaultSort ?? null,
  )
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Sorted data ──────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sort) return data
    const column = columns.find((c) => c.id === sort.columnId)
    if (!column || !column.sortValue) return data

    const factor = sort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const va = column.sortValue!(a)
      const vb = column.sortValue!(b)
      // null / undefined sort last regardless of direction
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor
      return String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' }) * factor
    })
  }, [data, columns, sort])

  // ── Grid template (shared by header + rows) ───────────────────────────
  const gridTemplate = useMemo(() => {
    const parts = columns.map((c) => c.width ?? '1fr')
    if (rowActions) parts.push('44px')
    return parts.join(' ')
  }, [columns, rowActions])

  // ── Sort toggle ──────────────────────────────────────────────────────
  const toggleSort = useCallback((columnId: string) => {
    const col = columns.find((c) => c.id === columnId)
    if (!col?.sortValue) return
    setSort((prev) => {
      if (!prev || prev.columnId !== columnId) {
        return { columnId, direction: 'asc' }
      }
      if (prev.direction === 'asc') return { columnId, direction: 'desc' }
      return null // third click clears sort
    })
  }, [columns])

  // ── Keyboard navigation ──────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onRowClick && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    const rows = containerRef.current?.querySelectorAll<HTMLElement>('[data-dt-row]')
    if (!rows || rows.length === 0) return
    const active = document.activeElement as HTMLElement | null
    const idx = Array.from(rows).findIndex((r) => r === active)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = idx < 0 ? 0 : Math.min(idx + 1, rows.length - 1)
      rows[next].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = idx < 0 ? 0 : Math.max(idx - 1, 0)
      rows[next].focus()
    } else if (e.key === 'Enter' && idx >= 0 && onRowClick) {
      e.preventDefault()
      const row = sortedData[idx]
      if (row) onRowClick(row)
    }
  }, [sortedData, onRowClick])

  // ── Render ───────────────────────────────────────────────────────────
  const isEmpty = !loading && sortedData.length === 0

  return (
    <div
      ref={containerRef}
      role="table"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Header — sticky within an overflow-y:auto parent */}
      <div
        role="row"
        className="sticky top-0 z-10 grid gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((col) => {
          const sortable = !!col.sortValue
          const active = sort?.columnId === col.id
          const direction = active ? sort.direction : null
          return (
            <button
              key={col.id}
              type="button"
              role="columnheader"
              aria-sort={
                active
                  ? (direction === 'asc' ? 'ascending' : 'descending')
                  : sortable ? 'none' : undefined
              }
              onClick={sortable ? () => toggleSort(col.id) : undefined}
              disabled={!sortable}
              className={cn(
                'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.5px]',
                col.align === 'right'  && 'justify-end text-right',
                col.align === 'center' && 'justify-center text-center',
                active
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)]',
                sortable
                  ? 'cursor-pointer hover:text-[var(--text-primary)] transition-colors'
                  : 'cursor-default',
                col.headerClassName,
              )}
            >
              <span>{col.header}</span>
              {sortable && (
                <span
                  aria-hidden
                  className={cn(
                    'inline-flex flex-col items-center justify-center transition-opacity leading-none',
                    active ? 'opacity-100' : 'opacity-40',
                  )}
                >
                  <svg
                    width="8" height="4" viewBox="0 0 8 4" fill="none"
                    className={cn(
                      direction === 'asc' ? 'text-[var(--brand)]' : 'text-current',
                    )}
                  >
                    <path d="M4 0L8 4H0z" fill="currentColor" />
                  </svg>
                  <svg
                    width="8" height="4" viewBox="0 0 8 4" fill="none"
                    className={cn(
                      'mt-px',
                      direction === 'desc' ? 'text-[var(--brand)]' : 'text-current',
                    )}
                  >
                    <path d="M0 0h8L4 4z" fill="currentColor" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
        {rowActions && <span aria-hidden />}
      </div>

      {/* Body */}
      {loading ? (
        <div role="rowgroup" className="divide-y divide-[var(--border)]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="grid gap-3 px-5 py-4"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {columns.map((col) => (
                <div
                  key={col.id}
                  className="h-4 rounded bg-[var(--bg-hover)] animate-pulse"
                />
              ))}
              {rowActions && <div className="h-4 rounded bg-[var(--bg-hover)] animate-pulse" />}
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="py-10">
          {emptyState ?? (
            <p className="text-center text-small text-[var(--text-tertiary)]">
              Nothing to show.
            </p>
          )}
        </div>
      ) : (
        <div role="rowgroup">
          {sortedData.map((row) => {
            const id = getRowId(row)
            return (
              <div
                key={id}
                role="row"
                data-dt-row
                tabIndex={onRowClick ? 0 : -1}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'grid gap-3 px-5 py-3.5 items-center border-b border-[var(--border)] last:border-b-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--bg-secondary)] focus:bg-[var(--bg-secondary)] focus:outline-none',
                )}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {columns.map((col) => (
                  <div
                    key={col.id}
                    role="cell"
                    className={cn(
                      'min-w-0 text-[13px] text-[var(--text-secondary)]',
                      col.align === 'right'  && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.cellClassName,
                    )}
                  >
                    {col.cell(row)}
                  </div>
                ))}
                {rowActions && (
                  <div
                    role="cell"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center"
                  >
                    {rowActions(row)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
