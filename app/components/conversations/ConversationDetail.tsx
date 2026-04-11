'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/app/components/ui/Button'
import EmptyState from '@/app/components/ui/EmptyState'
import CreateTaskModal from './CreateTaskModal'
import type { CallItem } from './ConversationList'
import { cn } from '@/lib/utils'

interface ConversationDetailProps {
  call: CallItem | null
  hasExtraFields: boolean
  clinicId: string
  clinicName: string
  clinicVertical: string
  onStatusChange: (id: string, status: string) => void
}

/* ── Formatters ─────────────────────────────────────────────────────────────── */

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' at '
      + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

/* ── Urgency & Status colour maps ───────────────────────────────────────────── */

const URGENCY_BADGE: Record<string, { bg: string; label: string }> = {
  CRITICAL: { bg: 'bg-[#ba1a1a]', label: 'EMERGENCY' },
  URGENT:   { bg: 'bg-[#b45309]', label: 'URGENT' },
  ROUTINE:  { bg: 'bg-[#0f6e56]', label: 'ROUTINE' },
}

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  UNREAD:   { bg: 'bg-[#0058a7]', label: 'UNREAD' },
  READ:     { bg: 'bg-gray-400',  label: 'READ' },
  REVIEWED: { bg: 'bg-gray-400',  label: 'REVIEWED' },
  ACTIONED: { bg: 'bg-[#0f6e56]', label: 'ACTIONED' },
  ARCHIVED: { bg: 'bg-gray-400',  label: 'ARCHIVED' },
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
    <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
    <rect x="2" y="3.5" width="14" height="12" rx="1.5" />
    <path d="M2 7.5h14M6 2v3M12 2v3" />
  </svg>
)

const InfoCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#b45309]">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 7v4M8 5.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function ConversationDetail({
  call,
  hasExtraFields,
  clinicId,
  clinicName,
  clinicVertical,
  onStatusChange,
}: ConversationDetailProps) {
  const [status, setStatus] = useState(call?.status ?? '')
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Sync when call changes
  if (call && call.status !== status && !updatingStatus) {
    setStatus(call.status)
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

  /* ── Empty state ────────────────────────────────────────────────────────── */
  if (!call) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f8]">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
              <path d="M42 32c0 1.1-.4 2.1-1.2 2.8A4 4 0 0 1 38 36H14l-8 8V12a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v20z" />
            </svg>
          }
          title="Select a call"
          description="Choose a call from the list to view details."
        />
      </div>
    )
  }

  const industryData = call.industry_data ?? {}
  const petName = call.pet_name || (industryData.pet_name as string) || '—'
  const petSpecies = call.pet_species || (industryData.pet_species as string) || '—'
  const petBreed = (industryData.pet_breed as string) || 'Not specified'
  const urgencyBadge = URGENCY_BADGE[call.urgency] ?? URGENCY_BADGE.ROUTINE
  const statusBadge = STATUS_BADGE[status] ?? STATUS_BADGE.UNREAD
  const isVet = clinicVertical === 'vet'

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-[var(--border)] px-6 py-4">
        {/* Hero row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] leading-tight" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
              {call.caller_name || 'Unknown Caller'}
            </h2>
            <span className={cn('text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded', urgencyBadge.bg)}>
              {urgencyBadge.label}
            </span>
            <span className={cn('text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded', statusBadge.bg)}>
              {statusBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status !== 'ACTIONED' && (
              <Button variant="secondary" size="sm" onClick={() => updateStatus('ACTIONED')}>
                Mark Actioned
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setTaskModalOpen(true)}>
              Assign Task
            </Button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 text-[13px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <PhoneIcon />
            <a href={`tel:${call.caller_phone}`} className="hover:text-[var(--brand)] transition-colors">
              {call.caller_phone}
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarIcon />
            {formatDateTime(call.created_at)}
          </span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-[#f9f9f8] px-8 py-5 space-y-4">
        {/* Section 1: AI Summary */}
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-2">AI Summary</span>
          <div className="rounded-xl bg-[#f0f9f8] p-[18px_20px]" style={{ borderLeft: '4px solid #009688' }}>
            <p className="text-[14px] font-medium text-[var(--text-primary)] leading-[1.65] whitespace-pre-wrap">
              {call.ai_detail || call.summary || 'No summary available.'}
            </p>
          </div>
        </div>

        {/* Section 2: Action Required */}
        {call.action_required && (
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-2">Action Required</span>
            <div className="flex items-start gap-3 rounded-lg bg-[#fffbeb] border border-[#fde68a] p-3.5">
              <InfoCircleIcon />
              <p className="text-[13px] font-bold text-[#92400e] leading-snug">{call.action_required}</p>
            </div>
          </div>
        )}

        {/* Section 3: Call Details */}
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-2">Call Details</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Caller Name */}
            <DetailCard label="CALLER NAME" value={call.caller_name || '—'} sub="Existing caller" />

            {/* Card 2: Phone */}
            <DetailCard label="PHONE" value={call.caller_phone || '—'} sub="Primary mobile" />

            {/* Card 3 & 4: Industry-specific */}
            {isVet || hasExtraFields ? (
              <>
                <DetailCard label="PET NAME" value={petName} sub={petSpecies !== '—' ? petSpecies : 'Not provided'} />
                <DetailCard label="SPECIES" value={petSpecies} sub={petBreed} />
              </>
            ) : (
              <>
                <DetailCard label="SUBJECT" value={petName} sub="Not provided" />
                <DetailCard label="CATEGORY" value={petSpecies} sub={petBreed} />
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-[var(--border)] px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0f6e56] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0f6e56]" />
          </span>
          <span className="text-[12px] text-[var(--text-secondary)]">
            {status} · Triage: {call.urgency}
          </span>
        </div>
        <span className="text-[12px] text-[var(--text-tertiary)]">
          Urgency: {call.urgency} · {clinicName || 'Clinic'}
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

/* ── Reusable detail card ─────────────────────────────────────────────────── */

function DetailCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-[10px] border border-[#eeeeed] p-4">
      <span className="block text-[9px] font-bold uppercase tracking-[1px] text-[var(--text-tertiary)] mb-1.5">{label}</span>
      <p className="text-[15px] font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Manrope, sans-serif' }}>
        {value}
      </p>
      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{sub}</p>
    </div>
  )
}
