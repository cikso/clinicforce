'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import EmptyState from '@/app/components/ui/EmptyState'
import TaskActionMenu from './TaskActionMenu'
import ActionDetailPane from './ActionDetailPane'
import { cn } from '@/lib/utils'

// ─── Saved-view persistence ───────────────────────────────────────────────
// Scoped by clinicId so switching clinics starts fresh.
const STORAGE_KEY_PREFIX = 'cf.actionQueue.view'

interface SavedView {
  filter: 'all' | 'callback' | 'followup' | 'review' | 'urgent'
  sort:   'newest' | 'oldest' | 'priority' | 'due'
  search: string
}

function loadSavedView(clinicId: string): SavedView | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}.${clinicId}`)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<SavedView>
    const okFilter = v.filter && ['all', 'callback', 'followup', 'review', 'urgent'].includes(v.filter)
    const okSort   = v.sort   && ['newest', 'oldest', 'priority', 'due'].includes(v.sort)
    if (okFilter && okSort) {
      return {
        filter: v.filter as SavedView['filter'],
        sort:   v.sort as SavedView['sort'],
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
  } catch { /* ignore quota / disabled storage */ }
}

/* ─── Types ─── */

interface StaffMember {
  id: string
  name: string
}

export interface TaskRow {
  id: string
  title: string
  description: string | null
  type: string
  priority: string
  status: string
  assigned_to: string | null
  case_id: string | null
  due_at: string | null
  completed_at: string | null
  created_at: string
}

type FilterKey = 'all' | 'callback' | 'followup' | 'review' | 'urgent'
type SortKey = 'newest' | 'oldest' | 'priority' | 'due'

interface ActionQueueListProps {
  initialTasks: TaskRow[]
  initialCompleted: TaskRow[]
  staff: StaffMember[]
  staffMap: Record<string, string>
  clinicId: string
}

/* ─── Helpers ─── */

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

function dueLabel(dueAt: string | null): { text: string; overdue: boolean } {
  if (!dueAt) return { text: 'No due date', overdue: false }
  const due = new Date(dueAt)
  const now = new Date()
  const todayStr = now.toDateString()
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString()
  const dueStr = due.toDateString()

  if (dueStr === todayStr) return { text: 'Today', overdue: false }
  if (dueStr === tomorrowStr) return { text: 'Tomorrow', overdue: false }
  if (due < now) return { text: 'Overdue', overdue: true }
  return { text: due.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }), overdue: false }
}

function priorityVariant(p: string): 'urgent' | 'high' | 'routine' | 'neutral' {
  if (p === 'URGENT') return 'urgent'
  if (p === 'HIGH') return 'high'
  if (p === 'NORMAL') return 'routine'
  return 'neutral'
}

function priorityBorder(p: string): string {
  if (p === 'URGENT') return 'border-l-[var(--error)]'
  if (p === 'HIGH') return 'border-l-[var(--warning)]'
  if (p === 'NORMAL') return 'border-l-[var(--brand)]'
  return 'border-l-[var(--text-tertiary)]'
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    CALLBACK: 'Callback', FOLLOW_UP: 'Follow-up', REVIEW: 'Review',
    TRIAGE_REVIEW: 'Triage Review', OWNER_CHECK_IN: 'Check-in',
  }
  return map[t] ?? t
}

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }

/* ─── Component ─── */

export default function ActionQueueList({
  initialTasks,
  initialCompleted,
  staff,
  staffMap,
  clinicId,
}: ActionQueueListProps) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks)
  const [completed, setCompleted] = useState<TaskRow[]>(initialCompleted)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [completedOpen, setCompletedOpen] = useState(false)
  // Split-pane focus state — distinct from `selected` (checkboxes for bulk ops).
  // `focusedId` drives both the detail pane and the j/k keyboard navigation.
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // ── Saved-view: restore on mount / clinic switch ──────────────────────
  useEffect(() => {
    const saved = loadSavedView(clinicId)
    if (saved) {
      setFilter(saved.filter)
      setSort(saved.sort)
      setSearch(saved.search)
    }
  }, [clinicId])

  // ── Saved-view: persist on change ─────────────────────────────────────
  useEffect(() => {
    persistSavedView(clinicId, { filter, sort, search })
  }, [clinicId, filter, sort, search])

  /* ── Counts for filter pills ── */
  const counts = useMemo(() => ({
    all: tasks.length,
    callback: tasks.filter(t => t.type === 'CALLBACK').length,
    followup: tasks.filter(t => t.type === 'FOLLOW_UP').length,
    review: tasks.filter(t => t.type === 'REVIEW' || t.type === 'TRIAGE_REVIEW').length,
    urgent: tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length,
  }), [tasks])

  /* ── Filtered + sorted list ── */
  const visible = useMemo(() => {
    let result = tasks

    // Filter
    if (filter === 'callback') result = result.filter(t => t.type === 'CALLBACK')
    else if (filter === 'followup') result = result.filter(t => t.type === 'FOLLOW_UP')
    else if (filter === 'review') result = result.filter(t => t.type === 'REVIEW' || t.type === 'TRIAGE_REVIEW')
    else if (filter === 'urgent') result = result.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH')

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sort === 'priority') return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      if (sort === 'due') {
        const aD = a.due_at ? new Date(a.due_at).getTime() : Infinity
        const bD = b.due_at ? new Date(b.due_at).getTime() : Infinity
        return aD - bD
      }
      return 0
    })

    return result
  }, [tasks, filter, search, sort])

  const focusedTask = useMemo(
    () => visible.find((t) => t.id === focusedId) ?? null,
    [visible, focusedId],
  )

  // Keep focus valid as the visible list changes (filter/search/done-marking).
  // If the focused task drops out of the list, slide to the nearest neighbour
  // rather than leaving the pane blank — reduces whiplash during bulk work.
  useEffect(() => {
    if (visible.length === 0) {
      if (focusedId !== null) setFocusedId(null)
      return
    }
    if (focusedId === null) {
      setFocusedId(visible[0].id)
      return
    }
    if (!visible.some((t) => t.id === focusedId)) {
      setFocusedId(visible[0].id)
    }
  }, [visible, focusedId])

  // Scroll the focused row into view when the user navigates via keyboard.
  useEffect(() => {
    if (!focusedId || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-task-id="${focusedId}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedId])

  const markDone = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const now = new Date().toISOString()
    const updated = { ...task, status: 'DONE', completed_at: now }

    setTasks(prev => prev.filter(t => t.id !== id))
    setCompleted(prev => [updated, ...prev])
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })

    const supabase = createClient()
    await supabase.from('tasks').update({ status: 'DONE', completed_at: now }).eq('id', id)
  }, [tasks])

  const undoComplete = useCallback(async (id: string) => {
    const task = completed.find(t => t.id === id)
    if (!task) return
    const updated = { ...task, status: 'PENDING', completed_at: null }

    setCompleted(prev => prev.filter(t => t.id !== id))
    setTasks(prev => [updated, ...prev])

    const supabase = createClient()
    await supabase.from('tasks').update({ status: 'PENDING', completed_at: null }).eq('id', id)
  }, [completed])

  const changeStatus = useCallback(async (id: string, status: string) => {
    if (status === 'DONE') return markDone(id)

    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (status === 'CANCELLED') {
      setTasks(prev => prev.filter(t => t.id !== id))
    }

    const supabase = createClient()
    await supabase.from('tasks').update({ status }).eq('id', id)
  }, [markDone])

  const assignTo = useCallback(async (id: string, staffId: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, assigned_to: staffId || null } : t))

    const supabase = createClient()
    await supabase.from('tasks').update({ assigned_to: staffId || null }).eq('id', id)
  }, [])

  const changePriority = useCallback(async (id: string, priority: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t))

    const supabase = createClient()
    await supabase.from('tasks').update({ priority }).eq('id', id)
  }, [])

  /* ── Keyboard navigation ──────────────────────────────────────────────
     j/↓ move down, k/↑ move up, Enter/Space open (redundant since the row
     is already focused for preview), x marks the focused task done, Esc
     clears focus. Skipped when the user is typing in an input/select so
     search + assign selects still work. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // No modifier combos — those belong to the palette/shortcuts panel.
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target as HTMLElement | null
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.getAttribute('contenteditable') === 'true')
      if (isEditable) return

      if (visible.length === 0) return
      const idx = focusedId ? visible.findIndex((t) => t.id === focusedId) : -1

      const key = e.key
      if (key === 'ArrowDown' || key === 'j') {
        e.preventDefault()
        const next = idx < 0 ? 0 : Math.min(idx + 1, visible.length - 1)
        setFocusedId(visible[next].id)
        return
      }
      if (key === 'ArrowUp' || key === 'k') {
        e.preventDefault()
        const prev = idx < 0 ? 0 : Math.max(idx - 1, 0)
        setFocusedId(visible[prev].id)
        return
      }
      if (key === 'Escape') {
        if (focusedId !== null) {
          e.preventDefault()
          setFocusedId(null)
        }
        return
      }
      if (key === 'x' && focusedId) {
        e.preventDefault()
        markDone(focusedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, focusedId, markDone])

  /* ── Bulk actions ── */

  const bulkMarkDone = useCallback(async () => {
    const ids = Array.from(selected)
    for (const id of ids) await markDone(id)
    setSelected(new Set())
  }, [selected, markDone])

  const bulkAssign = useCallback(async (staffId: string) => {
    const ids = Array.from(selected)
    for (const id of ids) await assignTo(id, staffId)
  }, [selected, assignTo])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  /* ── Filter pills ── */
  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'callback', label: 'Callback', count: counts.callback },
    { key: 'followup', label: 'Follow-up', count: counts.followup },
    { key: 'review', label: 'Review', count: counts.review },
    { key: 'urgent', label: 'Urgent', count: counts.urgent },
  ]

  return (
    <div className="space-y-4">
      {/* Header / Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Action Queue</h2>
            {counts.all > 0 && (
              <Badge variant="high">{counts.all} pending</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-1.5 border border-[var(--border-subtle)] w-[200px]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] shrink-0">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full outline-none"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[13px] text-[var(--text-primary)] outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="due">Due Date</option>
            </select>
          </div>
        </div>
        {/* Filter pills */}
        <div className="flex gap-1">
          {filters.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors',
                filter === key
                  ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
              )}
            >
              {label} <span className="opacity-60">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List + Detail Pane (split at lg+) */}
      {visible.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--success)]">
              <circle cx="24" cy="24" r="18" />
              <path d="M16 24l6 6 10-12" />
            </svg>
          }
          title={filter === 'all' ? 'All caught up!' : `No ${filter} tasks found`}
          description={filter === 'all' ? 'No pending actions right now.' : 'Try a different filter.'}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4 items-start">
        <div
          ref={listRef}
          className="space-y-1.5 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1"
        >
          {visible.map((task) => {
            const due = dueLabel(task.due_at)
            const assigneeName = task.assigned_to ? (staffMap[task.assigned_to] ?? 'Unknown') : 'Unassigned'
            const isSelected = selected.has(task.id)
            const isFocused = focusedId === task.id

            return (
              <div
                key={task.id}
                data-task-id={task.id}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  // Let interactive controls inside the row do their own thing.
                  const tgt = e.target as HTMLElement
                  if (tgt.closest('button, a, select, input, [role="menu"]')) return
                  setFocusedId(task.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setFocusedId(task.id)
                  }
                }}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 rounded-xl border bg-[var(--bg-primary)] transition-all cursor-pointer',
                  'border-l-[3px]',
                  priorityBorder(task.priority),
                  isSelected && 'bg-[var(--brand-light)]',
                  isFocused
                    ? 'border-[var(--brand)] ring-1 ring-[var(--brand)]/30 shadow-[var(--shadow-sm)]'
                    : isSelected
                      ? 'border-[var(--brand)]'
                      : 'border-[var(--border)] hover:shadow-[var(--shadow-sm)]',
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(task.id)}
                  className={cn(
                    'mt-0.5 shrink-0 w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-[var(--brand)] border-[var(--brand)]'
                      : 'border-[var(--border)] bg-white hover:border-[var(--brand)]',
                  )}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-[13px] text-[var(--text-secondary)] truncate mt-0.5">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[12px] text-[var(--text-secondary)]">
                    <span>Assigned to: <span className="font-medium">{assigneeName}</span></span>
                    <span>
                      Due: <span className={cn('font-medium', due.overdue && 'text-[var(--error)]')}>{due.text}</span>
                    </span>
                    <span className="font-mono-data text-[var(--text-tertiary)]">{relativeTime(task.created_at)}</span>
                  </div>
                </div>

                {/* Badges + Actions */}
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <Badge variant="neutral">{typeLabel(task.type)}</Badge>
                  <Badge variant={priorityVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => markDone(task.id)}>
                    Mark Done
                  </Button>
                  <TaskActionMenu
                    taskId={task.id}
                    caseId={task.case_id}
                    currentStatus={task.status}
                    staff={staff}
                    onAssign={assignTo}
                    onChangePriority={changePriority}
                    onChangeStatus={changeStatus}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail pane — desktop only. Mobile falls back to row interactions. */}
        <div className="hidden lg:block sticky top-0 self-start">
          <div className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] overflow-hidden h-[calc(100vh-220px)]">
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
      </div>
      )}

      {/* Completed Today */}
      {completed.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              className={cn('transition-transform', completedOpen && 'rotate-90')}
            >
              <path d="M5 3l4 4-4 4" />
            </svg>
            Completed today ({completed.length})
          </button>

          {completedOpen && (
            <div className="mt-2 space-y-1.5">
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] opacity-60"
                >
                  {/* Done check */}
                  <div className="w-[18px] h-[18px] rounded bg-[var(--success)] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[14px] text-[var(--text-secondary)] line-through flex-1 truncate">{task.title}</p>
                  <Button variant="ghost" size="sm" onClick={() => undoComplete(task.id)}>
                    Undo
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)]">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">{selected.size} selected</span>
          <Button variant="primary" size="sm" onClick={bulkMarkDone}>Mark all done</Button>
          <div className="relative">
            <select
              onChange={(e) => { if (e.target.value) { bulkAssign(e.target.value); e.target.value = '' } }}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] outline-none"
              defaultValue=""
            >
              <option value="" disabled>Assign all to...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Cancel</Button>
        </div>
      )}
    </div>
  )
}
