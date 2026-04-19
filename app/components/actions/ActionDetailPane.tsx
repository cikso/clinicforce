'use client'

import Link from 'next/link'
import {
  Check, Phone, Calendar, MessageSquare, Clock, Sparkles, FileText, X as XIcon,
  ExternalLink, AlertTriangle, Flag, Zap,
} from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { cn } from '@/lib/utils'
import type { TaskRow, EmbeddedCall } from './ActionQueueList'

/**
 * Right-pane detail view. Mirrors the CallsPage detail layout so moving
 * between /calls and /actions feels like one surface. All mutations flow
 * through callbacks — the list remains the single source of truth.
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

const CATEGORY_LABEL: Record<string, string> = {
  EMERGENCY: 'Emergency',
  BOOKING:   'Booking',
  CALLBACK:  'Callback',
  RX:        'Rx refill',
  TRIAGE:    'Triage',
  BILLING:   'Billing',
  RECORDS:   'Records',
}

function normaliseCall(call: TaskRow['call']): EmbeddedCall | null {
  if (!call) return null
  if (Array.isArray(call)) return call[0] ?? null
  return call
}

function fullDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return '—' }
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
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">Nothing selected</p>
        <p className="text-[12.5px] mt-1 max-w-[280px]">
          Click a task on the left to see caller context, the AI-suggested next step, and all controls.
        </p>
      </aside>
    )
  }

  const call         = normaliseCall(task.call)
  const assigneeName = task.assigned_to ? staffMap[task.assigned_to] ?? 'Unknown' : 'Unassigned'
  const prio         = PRIORITY_META[task.priority] ?? PRIORITY_META.NORMAL
  const categoryLbl  = task.category ? (CATEGORY_LABEL[task.category] ?? task.category) : 'Callback'
  const isEmergency  = task.category === 'EMERGENCY' || task.priority === 'URGENT'
  const phoneHref    = call?.caller_phone && call.caller_phone !== '—'
    ? `tel:${call.caller_phone.replace(/\s/g, '')}`
    : null

  return (
    <aside className="h-full flex flex-col bg-white">
      {/* Header — caller-first, matches CallsPage */}
      <header className="px-5 py-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryPill category={task.category} />
              <span
                className="inline-flex items-center gap-1.5 px-2 h-[20px] rounded-full text-[10.5px] font-bold uppercase tracking-[0.05em]"
                style={{ backgroundColor: prio.bg, color: prio.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: prio.color }} />
                {prio.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] font-mono-data">
                <Clock className="w-3 h-3" strokeWidth={1.75} /> {relativeTime(task.created_at)}
              </span>
            </div>
            <h3 className="mt-2 text-[20px] font-bold text-[var(--text-primary)] font-heading leading-tight">
              {call?.caller_name ?? task.title}
            </h3>
            {call && (
              <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--text-secondary)] flex-wrap">
                {call.caller_phone && call.caller_phone !== '—' && (
                  <span className="inline-flex items-center gap-1.5 font-mono-data">
                    <Phone className="w-3 h-3" strokeWidth={1.75} />
                    {call.caller_phone}
                  </span>
                )}
                {call.pet_name && call.pet_name !== '—' && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                    <span>{call.pet_name}{call.pet_species && call.pet_species !== '—' ? ` · ${call.pet_species}` : ''}</span>
                  </>
                )}
              </div>
            )}
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

      {/* Emergency banner */}
      {isEmergency && (
        <div className="px-5 py-2.5 bg-[#FEF2F2] border-b border-[#FECACA] flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-[var(--error)] shrink-0" strokeWidth={2} />
          <span className="text-[12.5px] font-semibold text-[#991B1B]">
            Emergency follow-up — action this case now
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Task title block (if caller is set, title becomes the subtitle) */}
        {call && task.title !== call.caller_name && (
          <section>
            <p className="eyebrow text-[var(--text-tertiary)] mb-1">Task</p>
            <p className="text-[15px] font-semibold text-[var(--text-primary)] leading-snug">{task.title}</p>
            {task.description && task.description !== task.title && (
              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            )}
          </section>
        )}

        {/* Next-best-action chip — the Salesforce Einstein-style suggestion */}
        {task.next_best_action && (
          <section className="rounded-xl border border-[var(--brand)]/30 bg-[var(--brand-light)]/40 overflow-hidden">
            <div className="px-4 py-2 bg-[var(--brand-light)] border-b border-[var(--brand)]/20 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[var(--brand-dark)]" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--brand-dark)]">
                Suggested next step
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">
                {task.next_best_action}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {phoneHref && task.category !== 'RECORDS' && task.category !== 'BILLING' && (
                  <a
                    href={phoneHref}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[var(--brand)] text-white text-[12px] font-semibold hover:bg-[var(--brand-hover)] transition-colors"
                  >
                    <Phone className="w-3 h-3" strokeWidth={2} /> Accept & call
                  </a>
                )}
                <button className="h-7 px-2.5 rounded-md border border-[var(--border)] text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                  Modify
                </button>
                <button className="h-7 px-2.5 rounded-md text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </section>
        )}

        {/* AI summary from the originating call */}
        {call?.summary && (
          <section className="border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                Call summary — from Stella
              </p>
            </div>
            <div className="px-4 py-3 border-l-[3px] border-l-[var(--brand)]">
              <p className="text-[13px] text-[var(--text-primary)] leading-relaxed italic">
                {call.ai_detail || call.summary}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                Auto-generated transcript digest. Verify before acting on clinical details.
              </p>
            </div>
          </section>
        )}

        {/* Meta grid */}
        <section>
          <p className="eyebrow text-[var(--text-tertiary)] mb-2">Details</p>
          <div className="grid grid-cols-2 gap-2">
            <MetaCell label="SLA due"   value={fullDate(task.sla_due_at)} />
            <MetaCell label="Created"   value={fullDate(task.created_at)} />
            <MetaCell label="Status"    value={task.status} />
            <MetaCell label="Assignee"  value={assigneeName} />
            <MetaCell label="Category"  value={categoryLbl} />
            <MetaCell label="Source"    value={task.source === 'CALL' ? 'AI call' : (task.source ?? 'Manual')} />
          </div>
        </section>

        {/* Linked call deep-link */}
        {task.call_inbox_id && (
          <section>
            <Link
              href={`/conversations?call=${task.call_inbox_id}`}
              className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--brand-dark)] hover:underline"
            >
              <PhoneAnchorIcon />
              Open originating call
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
            </Link>
          </section>
        )}

        {/* Assignee picker */}
        <section>
          <p className="eyebrow text-[var(--text-tertiary)] mb-1.5">Reassign</p>
          <select
            value={task.assigned_to ?? ''}
            onChange={(e) => onAssign(task.id, e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Unassigned</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </section>

        {/* Priority */}
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
                    'h-8 rounded-lg text-[11.5px] font-semibold uppercase tracking-[0.04em] border transition-colors inline-flex items-center justify-center gap-1.5',
                    active
                      ? 'border-[var(--brand)] text-white bg-[var(--brand)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] bg-white hover:bg-[var(--bg-hover)]',
                  )}
                >
                  <Flag className="w-3 h-3" strokeWidth={2} style={{ color: active ? '#ffffff' : meta.color }} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* Footer — action bar (Book / SMS / Call / Done) */}
      <footer className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2 shrink-0 flex-wrap">
        <Link
          href="/sms"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--border)] bg-white text-[12.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
          SMS
        </Link>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--border)] bg-white text-[12.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
          Book
        </Link>
        <div className="flex-1" />
        {task.status === 'PENDING' && (
          <Button variant="ghost" size="sm" onClick={() => onChangeStatus(task.id, 'IN_PROGRESS')}>
            Start
          </Button>
        )}
        {phoneHref && (
          <a
            href={phoneHref}
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12.5px] font-semibold text-white transition-colors',
              isEmergency
                ? 'bg-[var(--error)] hover:bg-[#A61F1F]'
                : 'bg-[var(--brand)] hover:bg-[var(--brand-hover)]',
            )}
          >
            <Phone className="w-3.5 h-3.5" strokeWidth={2} />
            Call back
          </a>
        )}
        {task.status !== 'DONE' && (
          <Button variant="primary" size="sm" onClick={() => onMarkDone(task.id)}>
            <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.25} />
            Mark done
          </Button>
        )}
      </footer>
    </aside>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2">
      <p className="eyebrow text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold text-[var(--text-primary)] truncate">{value}</p>
    </div>
  )
}

function CategoryPill({ category }: { category: string | null }) {
  if (!category) category = 'CALLBACK'
  const palette: Record<string, { bg: string; color: string }> = {
    EMERGENCY: { bg: '#FEF2F2', color: '#DC2626' },
    BOOKING:   { bg: '#E6F8F0', color: '#00B578' },
    CALLBACK:  { bg: '#EFF4FF', color: '#2563EB' },
    RX:        { bg: '#F2EEFB', color: '#6B3FA0' },
    TRIAGE:    { bg: '#FFFBEB', color: '#D97706' },
    BILLING:   { bg: '#F1F5F9', color: '#475569' },
    RECORDS:   { bg: '#F1F5F9', color: '#475569' },
  }
  const p = palette[category] ?? palette.CALLBACK
  return (
    <span
      className="inline-flex items-center text-[10.5px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded"
      style={{ background: p.bg, color: p.color }}
    >
      {CATEGORY_LABEL[category] ?? category}
    </span>
  )
}

function PhoneAnchorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 3.5A3 3 0 0 1 14 6.5" />
      <path d="M13.5 7.5a6 6 0 0 0-5-5" />
      <path d="M14 11v2a1 1 0 0 1-1.1 1A12 12 0 0 1 2 3.1 1 1 0 0 1 3 2h2a1 1 0 0 1 1 .8c.1.7.3 1.3.5 1.9a1 1 0 0 1-.2 1L5.5 6.5a10 10 0 0 0 4 4l.8-.8a1 1 0 0 1 1-.2c.6.2 1.2.4 1.9.5.4 0 .8.4.8 1z" />
    </svg>
  )
}
