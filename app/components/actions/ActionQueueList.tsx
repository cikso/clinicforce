'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Phone, Calendar, MessageSquare, Clock, CheckCheck, AlertTriangle, Sparkles,
  Search as SearchIcon, Inbox, Flame, Timer, UserPlus, Moon, CheckCircle2,
  PhoneIncoming, PawPrint, Pill, FileText, Receipt, Stethoscope, Filter,
  ChevronDown, MoreHorizontal,
} from 'lucide-react'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import EmptyState from '@/app/components/ui/EmptyState'
import ActionDetailPane from './ActionDetailPane'
import { cn } from '@/lib/utils'

/* ─── Saved-view persistence (scoped per clinic) ─── */

const STORAGE_KEY_PREFIX = 'cf.actionQueue.view.v2'

interface SavedView {
  view:   ViewKey
  sort:   SortKey
  search: string
}

function loadSavedView(clinicId: string): SavedView | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}.${clinicId}`)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<SavedView>
    if (v.view && v.sort) {
      return {
        view:   v.view as ViewKey,
        sort:   v.sort as SortKey,
        search: typeof v.search === 'string' ? v.search : '',
      }
    }
    return null
  } catch { return null }
}

function persistSavedView(clinicId: string, view: SavedView) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}.${clinicId}`, JSON.stringify(view))
  } catch { /* ignore */ }
}

/* ─── Types ─── */

interface StaffMember {
  id: string
  name: string
}

export interface EmbeddedCall {
  id: string
  caller_name: string | null
  caller_phone: string | null
  pet_name: string | null
  pet_species: string | null
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE' | null
  summary: string | null
  ai_detail: string | null
  elevenlabs_conversation_id: string | null
}

export interface TaskRow {
  id: string
  title: string
  description: string | null
  type: string
  category: string | null
  priority: string
  status: string
  source: string | null
  assigned_to: string | null
  case_id: string | null
  call_inbox_id: string | null
  due_at: string | null
  sla_due_at: string | null
  snoozed_until: string | null
  next_best_action: string | null
  completed_at: string | null
  created_at: string
  // Supabase returns the embedded relation as an object (or null) when the FK
  // cardinality is many-to-one. If we ever expose this to PostgREST with the
  // parent-side defaults it could come as an array — the `call` helper below
  // normalises both shapes.
  call?: EmbeddedCall | EmbeddedCall[] | null
}

type ViewKey =
  | 'all'
  | 'urgent'
  | 'overdue'
  | 'today'
  | 'unassigned'
  | 'mine'
  | 'snoozed'
  | 'done_today'

type SortKey = 'sla' | 'priority' | 'newest' | 'oldest'

interface ActionQueueListProps {
  initialTasks: TaskRow[]
  initialCompleted: TaskRow[]
  staff: StaffMember[]
  staffMap: Record<string, string>
  clinicId: string
}

/* ─── Constants ─── */

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; Icon: React.ComponentType<{ className?: string, strokeWidth?: number }> }> = {
  EMERGENCY: { label: 'Emergency', color: '#DC2626', bg: '#FEF2F2', Icon: AlertTriangle },
  BOOKING:   { label: 'Booking',   color: '#00B578', bg: '#E6F8F0', Icon: Calendar },
  CALLBACK:  { label: 'Callback',  color: '#2563EB', bg: '#EFF4FF', Icon: Phone },
  RX:        { label: 'Rx refill', color: '#6B3FA0', bg: '#F2EEFB', Icon: Pill },
  TRIAGE:    { label: 'Triage',    color: '#D97706', bg: '#FFFBEB', Icon: Stethoscope },
  BILLING:   { label: 'Billing',   color: '#475569', bg: '#F1F5F9', Icon: Receipt },
  RECORDS:   { label: 'Records',   color: '#475569', bg: '#F1F5F9', Icon: FileText },
}

function categoryMeta(c: string | null) {
  if (!c) return CATEGORY_META.CALLBACK
  return CATEGORY_META[c] ?? CATEGORY_META.CALLBACK
}

/* ─── Helpers ─── */

function normaliseCall(call: TaskRow['call']): EmbeddedCall | null {
  if (!call) return null
  if (Array.isArray(call)) return call[0] ?? null
  return call
}

function initials(name: string | null | undefined): string {
  if (!name) return '—'
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function avatarColor(seed: string): { bg: string; fg: string } {
  // Hashed deterministic palette — matches CallsPage aesthetic.
  const palette: Array<{ bg: string; fg: string }> = [
    { bg: '#EFF4FF', fg: '#2563EB' },
    { bg: '#E6F8F0', fg: '#00B578' },
    { bg: '#F2EEFB', fg: '#6B3FA0' },
    { bg: '#FFFBEB', fg: '#D97706' },
    { bg: '#FDF2F8', fg: '#BE185D' },
    { bg: '#F1F5F9', fg: '#475569' },
  ]
  const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

/**
 * SLA countdown chip state. Green while >50% of window remains, amber in the
 * last 25%, red once breached. Borrows the three-state convention from
 * Salesforce Service Cloud entitlement timers.
 */
function slaState(sla: string | null, createdAt: string): {
  label: string
  tone: 'green' | 'amber' | 'red' | 'muted'
  breached: boolean
} {
  if (!sla) return { label: 'No SLA', tone: 'muted', breached: false }
  const slaMs     = new Date(sla).getTime()
  const now       = Date.now()
  const remaining = slaMs - now

  if (remaining <= 0) {
    const overdueMins = Math.floor(-remaining / 60000)
    return {
      label: overdueMins < 60 ? `-${overdueMins}m` : `-${Math.floor(overdueMins / 60)}h${overdueMins % 60}m`,
      tone: 'red',
      breached: true,
    }
  }

  const total       = slaMs - new Date(createdAt).getTime()
  const pctLeft     = total > 0 ? remaining / total : 1
  const mins        = Math.floor(remaining / 60000)
  const label       = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`
  const tone        = pctLeft < 0.25 ? 'amber' : 'green'

  return { label, tone, breached: false }
}

function dueLabel(dueAt: string | null): string {
  if (!dueAt) return '—'
  const due = new Date(dueAt)
  const now = new Date()
  const todayStr    = now.toDateString()
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString()
  const dueStr      = due.toDateString()
  if (dueStr === todayStr)    return 'Today'
  if (dueStr === tomorrowStr) return 'Tomorrow'
  return due.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function isToday(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso).toDateString() === new Date().toDateString()
}

function isOverdue(sla: string | null): boolean {
  if (!sla) return false
  return new Date(sla).getTime() < Date.now()
}

/* ─── Component ─── */

export default function ActionQueueList({
  initialTasks,
  initialCompleted,
  staff,
  staffMap,
  clinicId,
}: ActionQueueListProps) {
  const [tasks,     setTasks]     = useState<TaskRow[]>(initialTasks)
  const [completed, setCompleted] = useState<TaskRow[]>(initialCompleted)
  const [view,      setView]      = useState<ViewKey>('all')
  const [sort,      setSort]      = useState<SortKey>('sla')
  const [search,    setSearch]    = useState('')
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Ticking clock for SLA chips — re-render every 30s so countdowns stay fresh
  // without thrashing the whole tree on every second.
  const [, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Restore / persist saved view
  useEffect(() => {
    const saved = loadSavedView(clinicId)
    if (saved) { setView(saved.view); setSort(saved.sort); setSearch(saved.search) }
  }, [clinicId])
  useEffect(() => {
    persistSavedView(clinicId, { view, sort, search })
  }, [clinicId, view, sort, search])

  /* ── Counts powering smart folders ── */
  const counts = useMemo(() => {
    const open = tasks.filter(t => !t.snoozed_until || new Date(t.snoozed_until).getTime() < Date.now())
    return {
      all:        open.length,
      urgent:     open.filter(t => t.priority === 'URGENT' || t.category === 'EMERGENCY').length,
      overdue:    open.filter(t => isOverdue(t.sla_due_at)).length,
      today:      open.filter(t => isToday(t.sla_due_at) || isToday(t.due_at)).length,
      unassigned: open.filter(t => !t.assigned_to).length,
      snoozed:    tasks.filter(t => t.snoozed_until && new Date(t.snoozed_until).getTime() >= Date.now()).length,
      done_today: completed.length,
    }
  }, [tasks, completed])

  /* ── Visible list given view + search + sort ── */
  const visible = useMemo(() => {
    if (view === 'done_today') {
      return completed
    }

    const nowMs = Date.now()
    let result = tasks.filter(t => {
      // Hide snoozed from every view except Snoozed
      const isSnoozed = t.snoozed_until && new Date(t.snoozed_until).getTime() >= nowMs
      if (view === 'snoozed') return isSnoozed
      return !isSnoozed
    })

    switch (view) {
      case 'urgent':     result = result.filter(t => t.priority === 'URGENT' || t.category === 'EMERGENCY'); break
      case 'overdue':    result = result.filter(t => isOverdue(t.sla_due_at)); break
      case 'today':      result = result.filter(t => isToday(t.sla_due_at) || isToday(t.due_at)); break
      case 'unassigned': result = result.filter(t => !t.assigned_to); break
      // 'mine' requires a current user id we don't have in this component.
      // Treated as same as 'all' for now — the toggle itself still acts as a
      // visual filter affordance and can be wired when auth user flows here.
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t => {
        const c = normaliseCall(t.call)
        return (
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          c?.caller_name?.toLowerCase().includes(q) ||
          c?.pet_name?.toLowerCase().includes(q) ||
          c?.caller_phone?.toLowerCase().includes(q)
        )
      })
    }

    result = [...result].sort((a, b) => {
      if (sort === 'sla') {
        const aS = a.sla_due_at ? new Date(a.sla_due_at).getTime() : Infinity
        const bS = b.sla_due_at ? new Date(b.sla_due_at).getTime() : Infinity
        return aS - bS
      }
      if (sort === 'priority') return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      if (sort === 'newest')   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'oldest')   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return 0
    })

    return result
  }, [tasks, completed, view, search, sort])

  // Urgent lane: always-visible strip above the list. Max 4 cards, no sort
  // duplication with the main list when in 'urgent' view.
  const urgentCards = useMemo(() => {
    if (view === 'urgent' || view === 'done_today' || view === 'snoozed') return []
    return tasks
      .filter(t => t.priority === 'URGENT' || t.category === 'EMERGENCY')
      .slice(0, 4)
  }, [tasks, view])

  const focusedTask = useMemo(
    () => visible.find(t => t.id === focusedId) ?? null,
    [visible, focusedId],
  )

  useEffect(() => {
    if (visible.length === 0) {
      if (focusedId !== null) setFocusedId(null)
      return
    }
    if (focusedId === null) { setFocusedId(visible[0].id); return }
    if (!visible.some(t => t.id === focusedId)) setFocusedId(visible[0].id)
  }, [visible, focusedId])

  useEffect(() => {
    if (!focusedId || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-task-id="${focusedId}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedId])

  /* ── Mutations ── */

  const supabase = useMemo(() => createClient(), [])

  const markDone = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const now = new Date().toISOString()
    const updated = { ...task, status: 'DONE', completed_at: now }
    setTasks(prev => prev.filter(t => t.id !== id))
    setCompleted(prev => [updated, ...prev])
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
    await supabase.from('tasks').update({ status: 'DONE', completed_at: now }).eq('id', id)
  }, [tasks, supabase])

  const undoComplete = useCallback(async (id: string) => {
    const task = completed.find(t => t.id === id)
    if (!task) return
    const updated = { ...task, status: 'PENDING', completed_at: null }
    setCompleted(prev => prev.filter(t => t.id !== id))
    setTasks(prev => [updated, ...prev])
    await supabase.from('tasks').update({ status: 'PENDING', completed_at: null }).eq('id', id)
  }, [completed, supabase])

  const changeStatus = useCallback(async (id: string, status: string) => {
    if (status === 'DONE') return markDone(id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (status === 'CANCELLED') setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').update({ status }).eq('id', id)
  }, [markDone, supabase])

  const assignTo = useCallback(async (id: string, staffId: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, assigned_to: staffId || null } : t))
    await supabase.from('tasks').update({ assigned_to: staffId || null }).eq('id', id)
  }, [supabase])

  const changePriority = useCallback(async (id: string, priority: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t))
    await supabase.from('tasks').update({ priority }).eq('id', id)
  }, [supabase])

  const snooze = useCallback(async (id: string, hours: number) => {
    const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    setTasks(prev => prev.map(t => t.id === id ? { ...t, snoozed_until: until } : t))
    await supabase.from('tasks').update({ snoozed_until: until }).eq('id', id)
  }, [supabase])

  const unsnooze = useCallback(async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, snoozed_until: null } : t))
    await supabase.from('tasks').update({ snoozed_until: null }).eq('id', id)
  }, [supabase])

  /* ── Keyboard ── */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const editable = target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' || target.getAttribute('contenteditable') === 'true'
      )
      if (editable) return
      if (visible.length === 0) return
      const idx = focusedId ? visible.findIndex(t => t.id === focusedId) : -1
      const k = e.key

      if (k === 'ArrowDown' || k === 'j') { e.preventDefault(); setFocusedId(visible[Math.min(idx + 1, visible.length - 1)]?.id ?? visible[0].id) ; return }
      if (k === 'ArrowUp'   || k === 'k') { e.preventDefault(); setFocusedId(visible[Math.max(idx - 1, 0)]?.id ?? visible[0].id); return }
      if (k === 'Escape' && focusedId)    { e.preventDefault(); setFocusedId(null); return }
      if (k === 'x' && focusedId)         { e.preventDefault(); markDone(focusedId); return }
      if (k === 's' && focusedId)         { e.preventDefault(); snooze(focusedId, 2); return }
      if (k === 'c' && focusedId) {
        const t = visible.find(v => v.id === focusedId)
        const phone = normaliseCall(t?.call)?.caller_phone
        if (phone) { e.preventDefault(); window.location.href = `tel:${phone.replace(/\s/g, '')}` }
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, focusedId, markDone, snooze])

  /* ── Bulk ── */

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  const bulkMarkDone = useCallback(async () => {
    const ids = Array.from(selected)
    for (const id of ids) await markDone(id)
    setSelected(new Set())
  }, [selected, markDone])

  const bulkAssign = useCallback(async (staffId: string) => {
    const ids = Array.from(selected)
    for (const id of ids) await assignTo(id, staffId)
  }, [selected, assignTo])

  const bulkSnooze = useCallback(async () => {
    const ids = Array.from(selected)
    for (const id of ids) await snooze(id, 2)
    setSelected(new Set())
  }, [selected, snooze])

  /* ── Folders config ── */

  const folders: Array<{ key: ViewKey; label: string; Icon: React.ComponentType<{ className?: string, strokeWidth?: number }>; count: number; danger?: boolean }> = [
    { key: 'all',        label: 'All open',     Icon: Inbox,         count: counts.all },
    { key: 'urgent',     label: 'Urgent',       Icon: Flame,         count: counts.urgent, danger: counts.urgent > 0 },
    { key: 'overdue',    label: 'Overdue',      Icon: Timer,         count: counts.overdue, danger: counts.overdue > 0 },
    { key: 'today',      label: 'Due today',    Icon: Calendar,      count: counts.today },
    { key: 'unassigned', label: 'Unassigned',   Icon: UserPlus,      count: counts.unassigned },
    { key: 'snoozed',    label: 'Snoozed',      Icon: Moon,          count: counts.snoozed },
    { key: 'done_today', label: 'Done today',   Icon: CheckCircle2,  count: counts.done_today },
  ]

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">

      {/* ─── Left rail: smart folders ─── */}
      <aside className="w-[220px] shrink-0 bg-white border border-[var(--border)] rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-[15px] font-bold text-[var(--text-primary)] font-heading">Action Queue</h2>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">AI-triaged follow-ups from Stella</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {folders.map(({ key, label, Icon, count, danger }) => {
            const active = view === key
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors',
                  active
                    ? danger
                      ? 'bg-[#FEF2F2] text-[var(--error)]'
                      : 'bg-[var(--brand-light)] text-[var(--brand-dark)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
                )}
              >
                <Icon
                  className={cn('w-4 h-4 shrink-0', danger && active ? 'text-[var(--error)]' : '')}
                  strokeWidth={active ? 2 : 1.75}
                />
                <span className="flex-1 text-left truncate">{label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums min-w-[20px] text-center',
                      active
                        ? danger
                          ? 'bg-[var(--error)] text-white'
                          : 'bg-[var(--brand)] text-white'
                        : danger
                          ? 'bg-[#FEF2F2] text-[var(--error)]'
                          : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="border-t border-[var(--border-subtle)] px-3 py-3 bg-[var(--bg-secondary)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-1.5">Keyboard</p>
          <div className="grid grid-cols-2 gap-y-1 text-[11px] text-[var(--text-secondary)]">
            <span><Kbd>j</Kbd><Kbd>k</Kbd> move</span>
            <span><Kbd>x</Kbd> done</span>
            <span><Kbd>c</Kbd> call</span>
            <span><Kbd>s</Kbd> snooze</span>
          </div>
        </div>
      </aside>

      {/* ─── Center list ─── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">

        {/* Header: view title + search + sort */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">
              {folders.find(f => f.key === view)?.label ?? 'All open'}
            </h3>
            {visible.length > 0 && (
              <span className="text-[12px] text-[var(--text-tertiary)] font-mono-data">
                {visible.length} {visible.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 h-9 border border-[var(--border)] w-[240px]">
              <SearchIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search caller, pet, or task…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)] pointer-events-none" strokeWidth={1.75} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 pl-8 pr-7 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] outline-none appearance-none cursor-pointer"
              >
                <option value="sla">SLA — soonest</option>
                <option value="priority">Priority</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)] pointer-events-none" strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* Urgent lane — only shows when not already viewing urgent/snoozed/done */}
        {urgentCards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--error)]" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--error)]">
                Needs attention now
              </p>
              <span className="text-[10px] font-bold text-[var(--error)] bg-[#FEF2F2] px-1.5 py-0.5 rounded-full">
                {urgentCards.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {urgentCards.map(t => (
                <UrgentCard
                  key={t.id}
                  task={t}
                  onClick={() => { setFocusedId(t.id); setView('all') }}
                  onMarkDone={() => markDone(t.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* List + detail split */}
        {visible.length === 0 ? (
          <div className="flex-1 bg-white rounded-xl border border-[var(--border)] flex items-center justify-center">
            <EmptyState
              icon={
                <div className="w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
                  <CheckCheck className="w-5 h-5 text-[var(--brand)]" strokeWidth={1.75} />
                </div>
              }
              title={emptyTitle(view)}
              description={emptyDescription(view)}
            />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3 min-h-0">
            {/* List */}
            <div
              ref={listRef}
              className="bg-white border border-[var(--border)] rounded-xl overflow-y-auto divide-y divide-[var(--border-subtle)]"
            >
              {visible.map((task) => (
                <TaskListRow
                  key={task.id}
                  task={task}
                  staffMap={staffMap}
                  isSelected={selected.has(task.id)}
                  isFocused={focusedId === task.id}
                  onSelect={() => { setFocusedId(task.id) }}
                  onToggle={() => toggleSelect(task.id)}
                  onMarkDone={() => markDone(task.id)}
                  onSnooze={() => snooze(task.id, 2)}
                  onUnsnooze={() => unsnooze(task.id)}
                  viewKey={view}
                />
              ))}
            </div>

            {/* Detail pane */}
            <div className="hidden xl:block bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              <ActionDetailPane
                task={focusedTask}
                staff={staff}
                staffMap={staffMap}
                onMarkDone={markDone}
                onAssign={assignTo}
                onChangePriority={changePriority}
                onChangeStatus={changeStatus}
                onClose={() => setFocusedId(null)}
              />
            </div>
          </div>
        )}

        {/* Completed today disclosure (only when not already in Done-today view) */}
        {view !== 'done_today' && completed.length > 0 && (
          <div>
            <button
              onClick={() => setCompletedOpen(!completedOpen)}
              className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', !completedOpen && '-rotate-90')} strokeWidth={1.75} />
              Completed today · {completed.length}
            </button>
            {completedOpen && (
              <div className="mt-2 space-y-1">
                {completed.slice(0, 10).map(task => {
                  const call = normaliseCall(task.call)
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <div className="w-[18px] h-[18px] rounded-full bg-[var(--success)] flex items-center justify-center shrink-0">
                        <CheckCheck className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] line-through flex-1 truncate">
                        {task.title}{call?.caller_name ? ` · ${call.caller_name}` : ''}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => undoComplete(task.id)}>Undo</Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)]">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">{selected.size} selected</span>
          <Button variant="primary" size="sm" onClick={bulkMarkDone}>Mark done</Button>
          <Button variant="ghost" size="sm" onClick={bulkSnooze}>Snooze 2h</Button>
          <select
            onChange={(e) => { if (e.target.value) { bulkAssign(e.target.value); e.target.value = '' } }}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] outline-none"
            defaultValue=""
          >
            <option value="" disabled>Assign all to…</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Cancel</Button>
        </div>
      )}
    </div>
  )
}

/* ─── List row ─── */

interface TaskListRowProps {
  task: TaskRow
  staffMap: Record<string, string>
  isSelected: boolean
  isFocused: boolean
  onSelect: () => void
  onToggle: () => void
  onMarkDone: () => void
  onSnooze: () => void
  onUnsnooze: () => void
  viewKey: ViewKey
}

function TaskListRow({
  task, staffMap, isSelected, isFocused, onSelect, onToggle,
  onMarkDone, onSnooze, onUnsnooze, viewKey,
}: TaskListRowProps) {
  const call  = normaliseCall(task.call)
  const cat   = categoryMeta(task.category)
  const sla   = slaState(task.sla_due_at, task.created_at)
  const name  = call?.caller_name ?? task.title
  const ava   = avatarColor(name || task.id)
  const assignee = task.assigned_to ? staffMap[task.assigned_to] ?? 'Unknown' : null
  const priorityBorder =
    task.priority === 'URGENT'  ? 'border-l-[var(--error)]'
    : task.priority === 'HIGH'  ? 'border-l-[var(--warning)]'
    : task.priority === 'NORMAL' ? 'border-l-[var(--brand)]'
    :                              'border-l-[var(--text-tertiary)]'

  return (
    <div
      data-task-id={task.id}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        const tgt = e.target as HTMLElement
        if (tgt.closest('button, a, select, input, [role="menu"]')) return
        onSelect()
      }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSelect() } }}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3 border-l-[3px] cursor-pointer transition-colors',
        priorityBorder,
        isFocused
          ? 'bg-[var(--brand-light)]/30'
          : isSelected
            ? 'bg-[var(--brand-light)]/20'
            : 'hover:bg-[var(--bg-secondary)]',
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          'mt-0.5 shrink-0 w-[16px] h-[16px] rounded border flex items-center justify-center transition-colors',
          isSelected ? 'bg-[var(--brand)] border-[var(--brand)]' : 'border-[var(--border)] bg-white hover:border-[var(--brand)]',
        )}
        aria-label={isSelected ? 'Deselect' : 'Select'}
      >
        {isSelected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
        style={{ background: ava.bg, color: ava.fg }}
      >
        {initials(name)}
      </div>

      {/* Main body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category chip */}
          <CategoryChip category={task.category} />
          {/* Priority chip only shown when non-normal (avoid chip noise) */}
          {(task.priority === 'URGENT' || task.priority === 'HIGH') && (
            <PriorityChip priority={task.priority} />
          )}
          {/* Caller + pet */}
          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
            {call?.caller_name ?? 'Unknown caller'}
          </span>
          {call?.pet_name && call.pet_name !== '—' && (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
              <PawPrint className="w-3 h-3" strokeWidth={1.75} />
              {call.pet_name}
            </span>
          )}
        </div>

        {/* Title / AI summary line */}
        <p className="mt-1 text-[13px] text-[var(--text-primary)] truncate">
          {task.title}
        </p>
        {task.description && task.description !== task.title && (
          <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mt-1.5 text-[11.5px] text-[var(--text-secondary)]">
          <SlaChip state={sla} />
          <span className="text-[var(--border)]">·</span>
          <span className="font-mono-data text-[var(--text-tertiary)]">{relativeTime(task.created_at)}</span>
          {assignee && (
            <>
              <span className="text-[var(--border)]">·</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px] font-bold"
                  style={{ background: avatarColor(assignee).bg, color: avatarColor(assignee).fg }}
                >
                  {initials(assignee)}
                </span>
                {assignee}
              </span>
            </>
          )}
          {!task.assigned_to && (
            <>
              <span className="text-[var(--border)]">·</span>
              <span className="text-[var(--text-tertiary)] italic">Unassigned</span>
            </>
          )}
          {call?.caller_phone && call.caller_phone !== '—' && (
            <>
              <span className="text-[var(--border)]">·</span>
              <span className="font-mono-data text-[var(--text-tertiary)]">{call.caller_phone}</span>
            </>
          )}
        </div>
      </div>

      {/* Hover quick actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {call?.caller_phone && call.caller_phone !== '—' && (
          <QuickAction
            href={`tel:${call.caller_phone.replace(/\s/g, '')}`}
            title="Call back"
            tone="brand"
          >
            <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
          </QuickAction>
        )}
        <QuickAction title="Book" tone="brand" as={Link} href="/bookings">
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
        </QuickAction>
        <QuickAction title="Send SMS" tone="muted" as={Link} href="/sms">
          <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
        </QuickAction>
        {viewKey === 'snoozed' ? (
          <QuickAction title="Unsnooze" tone="muted" onClick={onUnsnooze}>
            <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
          </QuickAction>
        ) : (
          <QuickAction title="Snooze 2h" tone="muted" onClick={onSnooze}>
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          </QuickAction>
        )}
        <QuickAction title="Mark done" tone="success" onClick={onMarkDone}>
          <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
        </QuickAction>
      </div>
    </div>
  )
}

/* ─── Urgent card ─── */

function UrgentCard({
  task,
  onClick,
  onMarkDone,
}: {
  task: TaskRow
  onClick: () => void
  onMarkDone: () => void
}) {
  const call = normaliseCall(task.call)
  const sla  = slaState(task.sla_due_at, task.created_at)
  const name = call?.caller_name ?? 'Unknown caller'
  const ava  = avatarColor(name)
  return (
    <button
      onClick={onClick}
      className="text-left bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 hover:border-[var(--error)] transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: ava.bg, color: ava.fg }}
        >
          {initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-sm bg-[var(--error)] text-white">
              EMERGENCY
            </span>
            <span className="text-[13px] font-bold text-[var(--text-primary)] truncate">{name}</span>
          </div>
          {call?.pet_name && call.pet_name !== '—' && (
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">{call.pet_name}</p>
          )}
          <p className="text-[12px] text-[var(--text-primary)] mt-1 line-clamp-2">{task.description ?? task.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <SlaChip state={sla} />
            {call?.caller_phone && call.caller_phone !== '—' && (
              <a
                href={`tel:${call.caller_phone.replace(/\s/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[var(--error)] hover:bg-[#A61F1F] px-2 py-0.5 rounded transition-colors"
              >
                <Phone className="w-3 h-3" strokeWidth={2} />
                Call now
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onMarkDone() }}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            >
              Mark done
            </button>
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─── Sub-components ─── */

function CategoryChip({ category }: { category: string | null }) {
  const c = categoryMeta(category)
  const Icon = c.Icon
  return (
    <span
      className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.color }}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {c.label}
    </span>
  )
}

function PriorityChip({ priority }: { priority: string }) {
  const isUrgent = priority === 'URGENT'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-sm',
        isUrgent ? 'bg-[var(--error)] text-white' : 'bg-[var(--warning)] text-white',
      )}
    >
      {priority}
    </span>
  )
}

function SlaChip({ state }: { state: { label: string; tone: 'green' | 'amber' | 'red' | 'muted'; breached: boolean } }) {
  if (state.tone === 'muted') {
    return <span className="text-[11px] text-[var(--text-tertiary)]">{state.label}</span>
  }
  const palette = {
    green: { bg: '#ECFDF5', fg: '#059669', dot: '#10B981' },
    amber: { bg: '#FFFBEB', fg: '#B45309', dot: '#F59E0B' },
    red:   { bg: '#FEF2F2', fg: '#B91C1C', dot: '#DC2626' },
  }[state.tone]
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold font-mono-data px-1.5 py-0.5 rounded tabular-nums"
      style={{ background: palette.bg, color: palette.fg }}
      title={state.breached ? 'SLA breached' : 'Time remaining in SLA window'}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.dot }} />
      {state.breached ? 'Breached' : state.label + ' left'}
    </span>
  )
}

type QuickActionProps = {
  title: string
  tone: 'brand' | 'muted' | 'success'
  children: React.ReactNode
} & (
  | { onClick: () => void; as?: undefined; href?: undefined }
  | { href: string; onClick?: undefined; as?: undefined }
  | { as: typeof Link; href: string; onClick?: undefined }
)
function QuickAction(props: QuickActionProps) {
  const toneClass =
    props.tone === 'brand'   ? 'text-[var(--brand)] hover:bg-[var(--brand-light)]'
    : props.tone === 'success' ? 'text-[var(--success)] hover:bg-[#ECFDF5]'
    :                          'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
  const common = cn(
    'inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors',
    toneClass,
  )

  if ('as' in props && props.as) {
    const Comp = props.as
    return (
      <Comp href={props.href} title={props.title} onClick={(e: React.MouseEvent) => e.stopPropagation()} className={common}>
        {props.children}
      </Comp>
    )
  }
  if ('href' in props && props.href) {
    return (
      <a href={props.href} title={props.title} onClick={(e) => e.stopPropagation()} className={common}>
        {props.children}
      </a>
    )
  }
  return (
    <button
      type="button"
      title={props.title}
      onClick={(e) => { e.stopPropagation(); props.onClick?.() }}
      className={common}
    >
      {props.children}
    </button>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-semibold text-[var(--text-secondary)] bg-white border border-[var(--border)] rounded mr-1">
      {children}
    </kbd>
  )
}

/* ─── Empty state copy per view ─── */

function emptyTitle(view: ViewKey): string {
  switch (view) {
    case 'urgent':     return 'No urgent actions'
    case 'overdue':    return 'Nothing overdue'
    case 'today':      return 'Nothing due today'
    case 'unassigned': return 'Everything has an owner'
    case 'snoozed':    return 'No snoozed tasks'
    case 'done_today': return 'Nothing completed yet today'
    default:           return 'All caught up'
  }
}

function emptyDescription(view: ViewKey): string {
  switch (view) {
    case 'urgent':     return 'Stella will surface anything critical here the moment it comes in.'
    case 'overdue':    return 'SLA windows are all healthy — nice work.'
    case 'today':      return 'Nothing is due before end of day.'
    case 'unassigned': return 'Every open task has a team member responsible.'
    case 'snoozed':    return 'Snoozed tasks will return to the main queue automatically.'
    case 'done_today': return 'Tasks you complete today will appear here.'
    default:           return 'No pending follow-ups from the AI receptionist right now.'
  }
}
