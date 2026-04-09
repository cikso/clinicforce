'use client'

import { useState, useMemo, useCallback } from 'react'
import Badge from '@/app/components/ui/Badge'
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
  created_at: string
}

interface ConversationListProps {
  initialCalls: CallItem[]
  selectedId: string | null
  onSelect: (call: CallItem) => void
  hasExtraFields: boolean
  clinicId: string
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function urgencyDot(u: string): string {
  if (u === 'CRITICAL' || u === 'URGENT') return 'bg-[var(--error)]'
  return 'bg-[var(--success)]'
}

function coverageLabel(r: string | null): string | null {
  if (!r) return null
  const map: Record<string, string> = {
    DAYTIME: 'Overflow',
    LUNCH: 'Lunch Cover',
    AFTER_HOURS: 'After Hours',
    EMERGENCY_ONLY: 'Emergency',
    WEEKEND: 'Weekend',
    OVERFLOW: 'Overflow',
  }
  return map[r] ?? r
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

  // Update calls when a status changes externally
  const updateCallStatus = useCallback((id: string, newStatus: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }, [])

  // Expose updater via window for cross-component comms
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
        .select('id, caller_name, caller_phone, summary, ai_detail, action_required, urgency, status, coverage_reason, call_duration_seconds, industry_data, created_at')
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
      {/* Search + Filters */}
      <div className="shrink-0 p-3 space-y-2 border-b border-[var(--border-subtle)]">
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
              const petName = hasExtraFields ? (call.industry_data?.pet_name as string) : null
              const coverageTag = coverageLabel(call.coverage_reason)

              return (
                <button
                  key={call.id}
                  onClick={() => onSelect(call)}
                  className={cn(
                    'w-full text-left px-3 py-3 border-b border-[var(--border-subtle)] transition-colors relative',
                    isSelected ? 'bg-[var(--brand-light)]' : 'hover:bg-[var(--bg-hover)]',
                    isUnread && !isSelected && 'border-l-[3px] border-l-[var(--brand)]',
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Urgency dot */}
                    <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', urgencyDot(call.urgency))} />

                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-[14px] truncate',
                          isUnread ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-primary)]',
                        )}>
                          {call.caller_name || 'Unknown'}
                        </span>
                        {petName && (
                          <Badge variant="info" className="text-[10px] px-1.5 py-0">{petName}</Badge>
                        )}
                      </div>

                      {/* Summary preview */}
                      <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                        {call.summary || 'No summary available'}
                      </p>

                      {/* Bottom row */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-[var(--text-tertiary)] font-mono-data">
                          {relativeTime(call.created_at)}
                        </span>
                        {coverageTag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)] font-medium">
                            {coverageTag}
                          </span>
                        )}
                        {call.status === 'ACTIONED' && (
                          <span className="text-[10px] text-[var(--success)] font-medium">Actioned</span>
                        )}
                        {call.status === 'REVIEWED' && (
                          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Reviewed</span>
                        )}
                      </div>
                    </div>
                  </div>
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
