'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface StaffMember {
  id: string
  name: string
}

interface TaskActionMenuProps {
  taskId: string
  caseId: string | null
  currentStatus: string
  staff: StaffMember[]
  onAssign: (taskId: string, staffId: string) => void
  onChangePriority: (taskId: string, priority: string) => void
  onChangeStatus: (taskId: string, status: string) => void
}

export default function TaskActionMenu({
  taskId,
  caseId,
  currentStatus,
  staff,
  onAssign,
  onChangePriority,
  onChangeStatus,
}: TaskActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [submenu, setSubmenu] = useState<'assign' | 'priority' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSubmenu(null)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const menuItems = [
    ...(submenu === null ? [
      { label: 'Assign to...', action: () => setSubmenu('assign') },
      { label: 'Change priority', action: () => setSubmenu('priority') },
      ...(currentStatus === 'PENDING' ? [{ label: 'Start', action: () => { onChangeStatus(taskId, 'IN_PROGRESS'); setOpen(false) } }] : []),
      ...(currentStatus !== 'CANCELLED' && currentStatus !== 'DONE' ? [{ label: 'Cancel', action: () => { onChangeStatus(taskId, 'CANCELLED'); setOpen(false) }, danger: true }] : []),
      ...(caseId ? [{ label: 'View call', action: () => { router.push(`/conversations?id=${caseId}`); setOpen(false) } }] : []),
    ] : []),
  ]

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); setSubmenu(null) }}
        className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        aria-label="Task actions"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-40 w-48 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-[var(--shadow-md)] py-1">
          {submenu === 'assign' && (
            <>
              <button
                onClick={() => setSubmenu(null)}
                className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2L4 6l4 4" /></svg>
                Back
              </button>
              <div className="border-t border-[var(--border-subtle)] my-1" />
              <button
                onClick={() => { onAssign(taskId, ''); setOpen(false); setSubmenu(null) }}
                className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                Unassigned
              </button>
              {staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onAssign(taskId, s.id); setOpen(false); setSubmenu(null) }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  {s.name}
                </button>
              ))}
            </>
          )}

          {submenu === 'priority' && (
            <>
              <button
                onClick={() => setSubmenu(null)}
                className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2L4 6l4 4" /></svg>
                Back
              </button>
              <div className="border-t border-[var(--border-subtle)] my-1" />
              {['URGENT', 'HIGH', 'NORMAL', 'LOW'].map((p) => (
                <button
                  key={p}
                  onClick={() => { onChangePriority(taskId, p); setOpen(false); setSubmenu(null) }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </>
          )}

          {submenu === null && menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={cn(
                'w-full text-left px-3 py-1.5 text-[13px] hover:bg-[var(--bg-hover)] transition-colors',
                (item as { danger?: boolean }).danger ? 'text-[var(--error)]' : 'text-[var(--text-primary)]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
