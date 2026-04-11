'use client'

import { useState, useMemo, useCallback } from 'react'
import EmptyState from '@/app/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type Filter = 'all' | 'unread' | 'urgent' | 'actioned'

export interface CallItem {
  id: string
  caller_name: string
  caller_phone: string
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
  CRITICAL: { bg: 'bg-[#ba1a1a]', label: 'EMERGENCY' },
  URGENT:   { bg: 'bg-[#b45309]', label: 'URGENT' },
  ROUTINE:  { bg: 'bg-[#0f6e56]', label: 'ROUTINE' },
}

function leftBorderColor(call: CallItem, isSelected: boolean): string {
  if (isSelected) return '#0058a7'
  if (call.status === 'UNREAD') return '#0058a7'
  if (call.urgency === 'CRITICAL') return '#ba1a1a'
  if (call.urgency === 'URGENT') return '#b45309'
  return '#0f6e56'
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

  const updateCallStatus = useCallback((id: string, newStatus: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }, [])

  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__updateCallStatus = updateCallStatus
  }

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
        .select('id, caller_name, caller_phone, summary, ai_detail, action_required, urgency, status, coverage_reason, call_duration_seconds, industry_data, elevenlabs_conversation_id, created_at')
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

              return (
                <button
                  key={call.id}
                  onClick={() => onSelect(call)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-[var(--border-subtle)] transition-colors relative',
                    isSelected ? 'bg-[var(--brand-light)]' : 'hover:bg-[var(--bg-hover)]',
                  )}
                  style={{ borderLeft: `3px solid ${borderColor}` }}
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
    </div>
  )
}
