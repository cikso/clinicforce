'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import EmptyState from '@/app/components/ui/EmptyState'
import Button from '@/app/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type Filter = 'all' | 'unread' | 'urgent' | 'actioned'

export interface CallItem {
  id: string
  caller_name: string
  caller_phone: string
  pet_name: string | null
  pet_species: string | null
  summary: string
  ai_detail: string | null
  action_required: string | null
  urgency: string
  status: string
  coverage_reason: string | null
  call_duration_seconds: number | null
  industry_data: Record<string, unknown> | null
  elevenlabs_conversation_id: string | null
  created_at: string
  updated_at?: string | null
}

interface ConversationListProps {
  initialCalls: CallItem[]
  selectedId: string | null
  onSelect: (call: CallItem) => void
  hasExtraFields: boolean
  clinicId: string
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (isToday) return time
    if (isYesterday) return 'Yesterday'
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
}

const URGENCY_PILL: Record<string, { bg: string; label: string }> = {
  CRITICAL: { bg: 'bg-[var(--error)]',   label: 'EMERGENCY' },
  URGENT:   { bg: 'bg-[var(--warning)]', label: 'URGENT' },
  ROUTINE:  { bg: 'bg-[var(--success)]', label: 'ROUTINE' },
}

function leftBorderColor(call: CallItem, isSelected: boolean): string {
  if (isSelected)                    return 'var(--info)'
  if (call.status === 'UNREAD')      return 'var(--info)'
  if (call.urgency === 'CRITICAL')   return 'var(--error)'
  if (call.urgency === 'URGENT')     return 'var(--warning)'
  return 'var(--success)'
}

// ─── Saved-view persistence ────────────────────────────────────────────────
// Lightweight per-surface persistence: remember the last filter/search the
// user chose so reopening the Call Inbox doesn't reset their view. Scoped by
// clinicId so switching clinics starts fresh.
const STORAGE_KEY_PREFIX = 'cf.callInbox.view'

interface SavedView {
  filter: Filter
  search: string
}

function loadSavedView(clinicId: string): SavedView | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}.${clinicId}`)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<SavedView>
    if (v.filter && ['all', 'unread', 'urgent', 'actioned'].includes(v.filter)) {
      return { filter: v.filter as Filter, search: typeof v.search === 'string' ? v.search : '' }
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

export default function ConversationList({
  initialCalls,
  selectedId,
  onSelect,
  hasExtraFields,
  clinicId,
}: ConversationListProps) {
  const [calls, setCalls] = useState<CallItem[]>(initialCalls)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialCalls.length >= 20)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  // Restore the user's last filter/search for this clinic on mount. Runs once
  // per clinic switch — avoids flicker because initial state is 'all'.
  useEffect(() => {
    const saved = loadSavedView(clinicId)
    if (saved) {
      setFilter(saved.filter)
      setSearch(saved.search)
    }
  }, [clinicId])

  // Persist whenever filter or search settles. Runs on every keystroke in
  // search, which is fine — localStorage.setItem is synchronous and cheap.
  useEffect(() => {
    persistSavedView(clinicId, { filter, search })
  }, [clinicId, filter, search])

  const updateCallStatus = useCallback((id: string, newStatus: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }, [])

  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__updateCallStatus = updateCallStatus
  }

  // ── Bulk selection + actions ──────────────────────────────────────────
  const toggleSelect = (id: string, ev?: React.MouseEvent) => {
    ev?.stopPropagation()
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  const clearSelection = () => setSelected(new Set())

  const bulkUpdateStatus = useCallback(async (newStatus: string) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setBulkBusy(true)

    // Optimistic: update UI immediately, roll back if the write fails.
    const before = calls
    setCalls(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: newStatus } : c))
    clearSelection()

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('call_inbox')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', ids)
      if (error) throw error
    } catch {
      // Roll back on failure — don't leave the UI lying to the user.
      setCalls(before)
    } finally {
      setBulkBusy(false)
    }
  }, [selected, calls])

  const counts = useMemo(() => ({
    all: calls.length,
    unread: calls.filter(c => c.status === 'UNREAD').length,
    urgent: calls.filter(c => c.urgency === 'URGENT' || c.urgency === 'CRITICAL').length,
    actioned: calls.filter(c => c.status === 'ACTIONED').length,
  }), [calls])

  const filtered = useMemo(() => {
    let result = calls
    if (filter === 'unread') result = result.filter(c => c.status === 'UNREAD')
    else if (filter === 'urgent') result = result.filter(c => c.urgency === 'URGENT' || c.urgency === 'CRITICAL')
    else if (filter === 'actioned') result = result.filter(c => c.status === 'ACTIONED')

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        (c.caller_name?.toLowerCase().includes(q)) ||
        (c.caller_phone?.toLowerCase().includes(q)) ||
        (c.summary?.toLowerCase().includes(q))
      )
    }
    return result
  }, [calls, filter, search])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const supabase = createClient()
      const oldest = calls[calls.length - 1]?.created_at
      const { data } = await supabase
        .from('call_inbox')
        .select('id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, coverage_reason, call_duration_seconds, industry_data, elevenlabs_conversation_id, created_at')
        .eq('clinic_id', clinicId)
        .lt('created_at', oldest)
        .order('created_at', { ascending: false })
        .limit(20)
      const newCalls = (data ?? []) as CallItem[]
      if (newCalls.length < 20) setHasMore(false)
      setCalls(prev => [...prev, ...newCalls])
    } catch { /* ignore */ }
    setLoadingMore(false)
  }, [calls, clinicId, hasMore, loadingMore])

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'unread', label: 'Unread', count: counts.unread },
    { key: 'urgent', label: 'Urgent', count: counts.urgent },
    { key: 'actioned', label: 'Actioned', count: counts.actioned },
  ]

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] border-r border-[var(--border)]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[var(--text-primary)] font-heading">Recent Calls</h2>
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-secondary)] rounded-md px-2 py-0.5 uppercase tracking-wide">
            {counts.all} total
          </span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="shrink-0 px-4 pb-3 space-y-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-1.5 border border-[var(--border-subtle)]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] shrink-0">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full outline-none"
          />
        </div>
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

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title="No calls found"
            description={search ? 'Try a different search term.' : 'No calls match this filter.'}
            className="py-16"
          />
        ) : (
          <div>
            {filtered.map((call) => {
              const isSelected = call.id === selectedId
              const isUnread = call.status === 'UNREAD'
              const pill = URGENCY_PILL[call.urgency] ?? URGENCY_PILL.ROUTINE
              const borderColor = leftBorderColor(call, isSelected)

              const isChecked = selected.has(call.id)
              return (
                <div
                  key={call.id}
                  className={cn(
                    'group relative border-b border-[var(--border-subtle)] transition-colors',
                    isSelected ? 'bg-[var(--brand-light)]' :
                    isChecked  ? 'bg-[var(--brand-light)]/60' :
                                 'hover:bg-[var(--bg-hover)]',
                  )}
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                >
                  {/* Checkbox — shown on hover or when any row is selected */}
                  <button
                    onClick={(e) => toggleSelect(call.id, e)}
                    aria-label={isChecked ? 'Deselect call' : 'Select call'}
                    className={cn(
                      'absolute top-3 left-2 w-[16px] h-[16px] rounded border flex items-center justify-center transition-all z-10',
                      isChecked
                        ? 'bg-[var(--brand)] border-[var(--brand)] opacity-100'
                        : 'border-[var(--border)] bg-white',
                      isChecked || selected.size > 0
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 focus:opacity-100',
                    )}
                  >
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => onSelect(call)}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-colors',
                      selected.size > 0 ? 'pl-7' : '',
                    )}
                  >
                    {/* Top row: name + time */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={cn(
                        'text-[13px] truncate',
                        isUnread ? 'font-bold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-primary)]',
                      )}>
                        {call.caller_name || 'Unknown'}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 font-mono-data">
                        {formatTimestamp(call.created_at)}
                      </span>
                    </div>

                    {/* Urgency pill */}
                    <span className={cn(
                      'inline-block text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded mb-1.5',
                      pill.bg,
                    )}>
                      {pill.label}
                    </span>

                    {/* Summary preview */}
                    <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {call.summary || 'No summary available'}
                    </p>
                  </button>
                </div>
              )
            })}

            {/* Load more */}
            {hasMore && (
              <div className="p-3">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-2 text-[13px] font-medium text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk action bar — floats at the bottom of the list pane when any
          calls are selected. Mirrors the Salesforce mass-action pattern. */}
      {selected.size > 0 && (
        <div className="shrink-0 sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 shadow-[0_-4px_12px_rgba(15,23,42,0.05)]">
          <span className="text-caption font-semibold text-[var(--text-primary)]">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="sm"
            disabled={bulkBusy}
            onClick={() => bulkUpdateStatus('READ')}
          >
            Mark read
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={bulkBusy}
            onClick={() => bulkUpdateStatus('ACTIONED')}
          >
            Mark actioned
          </Button>
          <button
            onClick={clearSelection}
            aria-label="Clear selection"
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
