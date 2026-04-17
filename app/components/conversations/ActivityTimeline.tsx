'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

/**
 * ActivityTimeline — Salesforce-style record timeline for a call_inbox row.
 *
 * Data sources (in order):
 *   1. Synthetic events derived from the call_inbox row itself (always present)
 *   2. activity_log entries where metadata->>call_inbox_id = call.id
 *   3. tasks related to this call (by call_inbox_id if present, else title match)
 *
 * Client-side fetch keeps the parent server component cache-friendly and lets
 * us refresh the timeline without a full page refetch when status changes.
 */

type TimelineEventKind =
  | 'CALL_RECEIVED'
  | 'AI_CLASSIFIED'
  | 'FLAGGED_URGENT'
  | 'STATUS_CHANGED'
  | 'TASK_CREATED'
  | 'NOTE_ADDED'
  | 'ACTIONED'
  | 'GENERIC'

interface TimelineEvent {
  id: string
  kind: TimelineEventKind
  title: string
  detail?: string | null
  actor?: string | null
  at: string // ISO timestamp
}

interface ActivityTimelineProps {
  callId: string
  clinicId: string
  call: {
    id: string
    created_at: string
    updated_at?: string | null
    urgency: string
    status: string
    caller_name?: string | null
    action_required?: string | null
  }
}

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60)   return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60)   return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24)   return `${h}h ago`
    const days = Math.floor(h / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function formatExact(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-AU', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const EVENT_STYLE: Record<TimelineEventKind, { ring: string; dot: string; icon: React.ReactNode }> = {
  CALL_RECEIVED: {
    ring: 'ring-[var(--brand)]/15',
    dot:  'bg-[var(--brand)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
      </svg>
    ),
  },
  AI_CLASSIFIED: {
    ring: 'ring-[var(--info)]/15',
    dot:  'bg-[var(--info)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2L10.8 6.5L15.5 7.2L12 10.4L12.9 15L9 12.7L5.1 15L6 10.4L2.5 7.2L7.2 6.5Z" />
      </svg>
    ),
  },
  FLAGGED_URGENT: {
    ring: 'ring-[var(--error)]/15',
    dot:  'bg-[var(--error)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2L16.5 15H1.5L9 2z" />
        <path d="M9 7v3M9 12.5v.01" />
      </svg>
    ),
  },
  STATUS_CHANGED: {
    ring: 'ring-[var(--text-tertiary)]/15',
    dot:  'bg-[var(--text-secondary)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l5 5L15 5" />
      </svg>
    ),
  },
  TASK_CREATED: {
    ring: 'ring-[var(--warning)]/15',
    dot:  'bg-[var(--warning)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="12" height="12" rx="1.5" />
        <path d="M7 9h4M7 12h2" />
      </svg>
    ),
  },
  NOTE_ADDED: {
    ring: 'ring-[var(--text-tertiary)]/15',
    dot:  'bg-[var(--text-tertiary)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h9l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  ACTIONED: {
    ring: 'ring-[var(--success)]/15',
    dot:  'bg-[var(--success)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l4 4L15 5" />
      </svg>
    ),
  },
  GENERIC: {
    ring: 'ring-[var(--text-tertiary)]/15',
    dot:  'bg-[var(--text-tertiary)]',
    icon: (
      <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3" />
      </svg>
    ),
  },
}

export default function ActivityTimeline({ callId, clinicId, call }: ActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      // ── Synthetic base events derived from the call row ─────────────────
      const base: TimelineEvent[] = [
        {
          id: `${call.id}:received`,
          kind: 'CALL_RECEIVED',
          title: `Call received${call.caller_name ? ` from ${call.caller_name}` : ''}`,
          detail: 'Stella answered the call and captured a transcript.',
          actor: 'Stella · AI receptionist',
          at: call.created_at,
        },
      ]

      if (call.urgency) {
        base.push({
          id: `${call.id}:classified`,
          kind: call.urgency === 'CRITICAL' ? 'FLAGGED_URGENT' : 'AI_CLASSIFIED',
          title:
            call.urgency === 'CRITICAL' ? 'Flagged EMERGENCY'
            : call.urgency === 'URGENT'  ? 'Classified URGENT'
            :                              'Classified ROUTINE',
          detail: call.action_required ?? null,
          actor: 'Stella · AI receptionist',
          at: call.created_at,
        })
      }

      if (call.status === 'ACTIONED' && call.updated_at && call.updated_at !== call.created_at) {
        base.push({
          id: `${call.id}:actioned`,
          kind: 'ACTIONED',
          title: 'Marked actioned',
          actor: null,
          at: call.updated_at,
        })
      }

      // ── Related activity_log + tasks (parallel fetches) ─────────────────
      let extra: TimelineEvent[] = []
      try {
        const supabase = createClient()
        const [logRes, taskRes] = await Promise.all([
          supabase
            .from('activity_log')
            .select('id, type, message, created_at, metadata')
            .eq('clinic_id', clinicId)
            .contains('metadata', { call_inbox_id: callId })
            .order('created_at', { ascending: true })
            .limit(20),
          supabase
            .from('tasks')
            .select('id, title, description, priority, created_at')
            .eq('clinic_id', clinicId)
            .ilike('title', `%${call.caller_name ?? ''}%`)
            .gte('created_at', call.created_at)
            .order('created_at', { ascending: true })
            .limit(10),
        ])

        const logRows = logRes.data ?? []
        const taskRows = taskRes.data ?? []

        extra = [
          ...logRows.map((row): TimelineEvent => ({
            id: `log:${row.id}`,
            kind:
              row.type === 'TASK'   ? 'TASK_CREATED' :
              row.type === 'NOTE'   ? 'NOTE_ADDED'   :
              row.type === 'STATUS' ? 'STATUS_CHANGED' :
                                      'GENERIC',
            title: row.message as string,
            detail: null,
            actor: null,
            at: row.created_at as string,
          })),
          ...taskRows.map((row): TimelineEvent => ({
            id: `task:${row.id}`,
            kind: 'TASK_CREATED',
            title: `Task: ${row.title}`,
            detail: (row.description as string) ?? null,
            actor: (row.priority as string) ? `${row.priority} priority` : null,
            at: row.created_at as string,
          })),
        ]
      } catch {
        // Silent — timeline degrades to base events only
      }

      if (!cancelled) {
        const merged = [...base, ...extra].sort(
          (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
        )
        setEvents(merged)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [callId, clinicId, call.id, call.created_at, call.updated_at, call.status, call.urgency, call.caller_name, call.action_required])

  return (
    <div>
      <span className="block text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-2">
        Activity Timeline
      </span>
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-5">
        {loading && events.length === 0 ? (
          <div className="flex items-center gap-2 text-caption text-[var(--text-tertiary)]">
            <span className="inline-block w-3 h-3 rounded-full bg-[var(--border)] animate-pulse" />
            Loading timeline…
          </div>
        ) : events.length === 0 ? (
          <p className="text-small text-[var(--text-tertiary)]">No timeline events yet.</p>
        ) : (
          <ol className="relative">
            {/* Vertical guide line */}
            <span
              aria-hidden
              className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border)]"
            />
            <div className="space-y-4">
              {events.map((ev) => {
                const style = EVENT_STYLE[ev.kind]
                return (
                  <li key={ev.id} className="relative flex gap-3">
                    <span
                      className={cn(
                        'relative z-10 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white',
                        style.dot,
                      )}
                    >
                      {style.icon}
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-body font-semibold text-[var(--text-primary)] leading-snug truncate">
                          {ev.title}
                        </p>
                        <time
                          dateTime={ev.at}
                          title={formatExact(ev.at)}
                          className="text-caption text-[var(--text-tertiary)] shrink-0"
                        >
                          {formatRelative(ev.at)}
                        </time>
                      </div>
                      {ev.detail && (
                        <p className="text-small text-[var(--text-secondary)] leading-relaxed mt-0.5">
                          {ev.detail}
                        </p>
                      )}
                      {ev.actor && (
                        <p className="text-caption text-[var(--text-tertiary)] mt-1">
                          {ev.actor}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </div>
          </ol>
        )}
      </div>
    </div>
  )
}
