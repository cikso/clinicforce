'use client'

import Link from 'next/link'
import { Check, User, Flag, ExternalLink, Clock, FileText, CornerDownRight, X as XIcon } from 'lucide-react'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import { cn } from '@/lib/utils'
import type { TaskRow } from './ActionQueueList'

/**
 * Right-pane detail view that mirrors the focused task in the queue. Renders
 * full description, full assignee picker, full priority + status controls —
 * everything that is truncated in the list row.
 *
 * Pure presentational: all mutations flow through callbacks so the parent
 * list remains the single source of truth.
 */

interface StaffMember {
  id: string
  name: string
}

export interface ActionDetailPaneProps {
  task: TaskRow | null
  staff: StaffMember[]
  staffMap: Record<string, string>
  onMarkDone: (id: string) => void
  onAssign: (id: string, staffId: string) => void
  onChangePriority: (id: string, priority: string) => void
  onChangeStatus: (id: string, status: string) => void
  onClose?: () => void
}

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  URGENT: { label: 'Urgent', color: '#DC2626', bg: '#FEF2F2' },
  HIGH:   { label: 'High',   color: '#D97706', bg: '#FFFBEB' },
  NORMAL: { label: 'Normal', color: '#0D0E12', bg: '#F3F4F6' },
  LOW:    { label: 'Low',    color: '#6B7280', bg: '#F3F4F6' },
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    CALLBACK: 'Callback',
    FOLLOW_UP: 'Follow-up',
    REVIEW: 'Review',
    TRIAGE_REVIEW: 'Triage Review',
    OWNER_CHECK_IN: 'Check-in',
  }
  return map[t] ?? t
}

function fullDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '—'
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ActionDetailPane({
  task,
  staff,
  staffMap,
  onMarkDone,
  onAssign,
  onChangePriority,
  onChangeStatus,
  onClose,
}: ActionDetailPaneProps) {
  if (!task) {
    return (
      <aside className="h-full flex flex-col items-center justify-center text-center px-8 text-[var(--text-tertiary)]">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
          <FileText className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">
          Nothing selected
        </p>
        <p className="text-[12.5px] mt-1 max-w-[260px]">
          Click a task or use the arrow keys to preview details here.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[11px]">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span>to move</span>
          <span className="mx-1 text-[var(--border)]">·</span>
          <Kbd>x</Kbd>
          <span>to mark done</span>
        </div>
      </aside>
    )
  }

  const assigneeName = task.assigned_to ? (staffMap[task.assigned_to] ?? 'Unknown') : 'Unassigned'
  const prio = PRIORITY_META[task.priority] ?? PRIORITY_META.NORMAL

  return (
    <aside className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="px-5 py-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral">{typeLabel(task.type)}</Badge>
              <span
                className="inline-flex items-center gap-1.5 px-2 h-[20px] rounded-full text-[11px] font-bold uppercase tracking-[0.05em]"
                style={{ backgroundColor: prio.bg, color: prio.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: prio.color }} />
                {prio.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] font-mono-data">
                <Clock className="w-3 h-3" strokeWidth={1.75} /> {relativeTime(task.created_at)}
              </span>
            </div>
            <h3 className="mt-2 text-[18px] font-bold text-[var(--text-primary)] font-heading leading-tight">
              {task.title}
            </h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail"
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
            >
              <XIcon className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </header>

      {/* Body — scrollable */}
      <div className="px-5 py-4 flex-1 overflow-y-auto space-y-5">
        {task.description && (
          <section>
            <p className="eyebrow text-[var(--text-tertiary)] mb-1.5">Description</p>
            <p className="text-[13.5px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3">
          <MetaCell label="Due" value={task.due_at ? fullDate(task.due_at) : 'No due date'} />
          <MetaCell label="Created" value={fullDate(task.created_at)} />
          <MetaCell label="Status" value={task.status} />
          <MetaCell label="Assigned to" value={assigneeName} />
        </section>

        {task.case_id && (
          <section>
            <Link
              href={`/conversations?case=${task.case_id}`}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-dark)] hover:underline"
            >
              <CornerDownRight className="w-4 h-4" strokeWidth={1.75} />
              Open linked conversation
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
            </Link>
          </section>
        )}

        {/* Assignee picker */}
        <section>
          <p className="eyebrow text-[var(--text-tertiary)] mb-1.5">Reassign</p>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" strokeWidth={1.5} />
            <select
              value={task.assigned_to ?? ''}
              onChange={(e) => onAssign(task.id, e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--border)] bg-white text-[13.5px] text-[var(--text-primary)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Priority picker */}
        <section>
          <p className="eyebrow text-[var(--text-tertiary)] mb-1.5">Priority</p>
          <div className="grid grid-cols-4 gap-1.5">
            {(['URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).map((p) => {
              const meta = PRIORITY_META[p]
              const active = task.priority === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePriority(task.id, p)}
                  className={cn(
                    'h-9 rounded-lg text-[12px] font-semibold uppercase tracking-[0.04em] border transition-colors',
                    active
                      ? 'border-[var(--brand)] text-white bg-[var(--brand)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] bg-white hover:bg-[var(--bg-hover)]',
                  )}
                  style={
                    active
                      ? undefined
                      : { /* use meta accent on hover only to keep list calm */ }
                  }
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Flag className="w-3 h-3" strokeWidth={2} style={{ color: active ? '#ffffff' : meta.color }} />
                    {meta.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* Sticky action bar */}
      <footer className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
          <Kbd>x</Kbd>
          <span>mark done</span>
          <span className="mx-0.5 text-[var(--border)]">·</span>
          <Kbd>Esc</Kbd>
          <span>clear</span>
        </div>
        <div className="flex items-center gap-2">
          {task.status !== 'DONE' && (
            <>
              {task.status === 'PENDING' && (
                <Button variant="ghost" size="sm" onClick={() => onChangeStatus(task.id, 'IN_PROGRESS')}>
                  Start
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={() => onMarkDone(task.id)}>
                <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.25} />
                Mark done
              </Button>
            </>
          )}
        </div>
      </footer>
    </aside>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2">
      <p className="eyebrow text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[var(--text-primary)] truncate">
        {value}
      </p>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-[var(--text-secondary)] bg-white border border-[var(--border)] rounded">
      {children}
    </kbd>
  )
}
