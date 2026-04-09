'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import EmptyState from '@/app/components/ui/EmptyState'
import CreateTaskModal from './CreateTaskModal'
import type { CallItem } from './ConversationList'
import { cn } from '@/lib/utils'

interface ConversationDetailProps {
  call: CallItem | null
  hasExtraFields: boolean
  clinicId: string
  onStatusChange: (id: string, status: string) => void
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()

    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    if (isToday) return `Today at ${time}`
    if (isYesterday) return `Yesterday at ${time}`
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) + ` at ${time}`
  } catch {
    return '—'
  }
}

function formatDuration(secs: number | null): string {
  if (!secs || secs <= 0) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

function urgencyVariant(u: string): 'routine' | 'urgent' | 'high' {
  if (u === 'CRITICAL' || u === 'URGENT') return 'urgent'
  if (u === 'HIGH') return 'high'
  return 'routine'
}

function statusVariant(s: string): 'info' | 'routine' | 'neutral' {
  if (s === 'UNREAD') return 'info'
  if (s === 'ACTIONED') return 'routine'
  return 'neutral'
}

function coverageLabel(r: string | null): string | null {
  if (!r) return null
  const map: Record<string, string> = {
    DAYTIME: 'Overflow', LUNCH: 'Lunch Cover', AFTER_HOURS: 'After Hours',
    EMERGENCY_ONLY: 'Emergency', WEEKEND: 'Weekend', OVERFLOW: 'Overflow',
  }
  return map[r] ?? r
}

export default function ConversationDetail({
  call,
  hasExtraFields,
  clinicId,
  onStatusChange,
}: ConversationDetailProps) {
  const [status, setStatus] = useState(call?.status ?? '')
  const [detailOpen, setDetailOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Sync when call changes
  if (call && call.status !== status && !updatingStatus) {
    setStatus(call.status)
    setDetailOpen(false)
  }

  const updateStatus = useCallback(async (newStatus: string) => {
    if (!call) return
    setUpdatingStatus(true)
    setStatus(newStatus)
    onStatusChange(call.id, newStatus)
    try {
      const supabase = createClient()
      await supabase
        .from('call_inbox')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', call.id)
    } catch { /* ignore */ }
    setUpdatingStatus(false)
  }, [call, onStatusChange])

  if (!call) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)]">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
              <path d="M42 32c0 1.1-.4 2.1-1.2 2.8A4 4 0 0 1 38 36H14l-8 8V12a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v20z" />
            </svg>
          }
          title="Select a conversation"
          description="Choose a call from the list to view details."
        />
      </div>
    )
  }

  const petName = hasExtraFields ? (call.industry_data?.pet_name as string) : null
  const petSpecies = hasExtraFields ? (call.industry_data?.pet_species as string) : null
  const coverage = coverageLabel(call.coverage_reason)

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-secondary)]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-bold text-[var(--text-primary)] font-heading">
                {call.caller_name || 'Unknown Caller'}
              </h2>
              <a
                href={`tel:${call.caller_phone}`}
                className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
              >
                {call.caller_phone}
              </a>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={urgencyVariant(call.urgency)}>{call.urgency}</Badge>
              <Badge variant={statusVariant(status)}>{status}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
            <span className="font-mono-data">{formatDateTime(call.created_at)}</span>
            {coverage && <span>Handled during: <span className="font-medium">{coverage}</span></span>}
            <span>Duration: <span className="font-medium font-mono-data">{formatDuration(call.call_duration_seconds)}</span></span>
          </div>

          {/* Industry-specific badges */}
          {hasExtraFields && (petName || petSpecies) && (
            <div className="flex items-center gap-2 mt-1">
              {petName && <Badge variant="info">{petName}</Badge>}
              {petSpecies && <Badge variant="info">{petSpecies}</Badge>}
            </div>
          )}
        </div>

        {/* AI Summary */}
        <Card header={{ title: 'AI Summary' }}>
          <p className="text-[14px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
            {call.summary || 'No summary available.'}
          </p>

          {call.ai_detail && (
            <div className="mt-4">
              <button
                onClick={() => setDetailOpen(!detailOpen)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className={cn('transition-transform', detailOpen && 'rotate-90')}
                >
                  <path d="M5 3l4 4-4 4" />
                </svg>
                Detailed Notes
              </button>
              {detailOpen && (
                <div className="mt-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {call.ai_detail}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Action Required */}
        {call.action_required && (
          <Card
            header={{
              title: 'Action Required',
              action: (
                <span className="w-2 h-2 rounded-full bg-[var(--warning)] inline-block" />
              ),
            }}
            className="border-[var(--warning)] bg-[var(--warning-light)]"
          >
            <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">
              {call.action_required}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {status === 'UNREAD' && (
                <Button variant="secondary" size="sm" onClick={() => updateStatus('REVIEWED')}>
                  Mark as Reviewed
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={() => setTaskModalOpen(true)}>
                Create Callback Task
              </Button>
              {status !== 'ACTIONED' && (
                <Button variant="ghost" size="sm" onClick={() => updateStatus('ACTIONED')}>
                  Mark as Done
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="shrink-0 px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-primary)] flex items-center gap-2">
        <a href={`tel:${call.caller_phone}`}>
          <Button variant="primary" size="sm">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
            </svg>
            Call Back
          </Button>
        </a>
        <Button variant="secondary" size="sm" onClick={() => setTaskModalOpen(true)}>
          Create Task
        </Button>
        {status === 'UNREAD' && (
          <Button variant="ghost" size="sm" onClick={() => updateStatus('REVIEWED')}>
            Mark Reviewed
          </Button>
        )}
        <div className="flex-1" />
        <span className={cn(
          'text-[12px] font-medium',
          status === 'ACTIONED' ? 'text-[var(--success)]' : status === 'REVIEWED' ? 'text-[var(--text-tertiary)]' : 'text-[var(--brand)]',
        )}>
          {status}
        </span>
      </div>

      {/* Task Modal */}
      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreated={() => {
          setStatus('ACTIONED')
          onStatusChange(call.id, 'ACTIONED')
        }}
        clinicId={clinicId}
        defaultTitle={`Callback: ${call.caller_name || 'Unknown'}`}
        defaultDescription={call.action_required || call.summary || ''}
        callId={call.id}
      />
    </div>
  )
}
