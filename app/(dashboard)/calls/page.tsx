'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Phone, Calendar, CheckCheck, Info, Clock, AlertTriangle, Sparkles } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { useClinic } from '@/context/ClinicContext'
import ToastContainer from '@/components/dashboard/ToastContainer'
import { INITIAL_INBOX, type CallInboxItem } from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'
import { useVertical } from '@/context/VerticalContext'

// ── SASH hallucination guard ──────────────────────────────────────────────────
const SASH_DIGITS = '0298890289'
function isSashHallucination(phone: string | null | undefined): boolean {
  if (!phone) return false
  return phone.replace(/\D/g, '') === SASH_DIGITS
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function avatarBg(item: CallInboxItem): string {
  if (item.urgency === 'CRITICAL') return '#c23934'
  if (item.urgency === 'URGENT')   return '#e8830a'
  return '#00BFA5'
}

// ── Left pane: list row ───────────────────────────────────────────────────────

function ListRow({
  item,
  isActive,
  onClick,
}: {
  item:     CallInboxItem
  isActive: boolean
  onClick:  () => void
}) {
  const isNew      = item.status === 'UNREAD'
  const isCritical = item.urgency === 'CRITICAL'
  const isUrgent   = item.urgency === 'URGENT'
  const hasUrgency = isCritical || isUrgent

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-l-[3px] transition-colors ${
        isActive
          ? hasUrgency
            ? 'bg-red-50/40 border-l-[#c23934]'
            : 'bg-[#E0F7F3]/60 border-l-[#00BFA5]'
          : 'border-l-transparent hover:bg-slate-50/80'
      }`}
    >
      <div className="flex items-start gap-2.5 px-4 py-3.5">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
          style={{ background: avatarBg(item) }}
        >
          {initials(item.callerName)}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-1 mb-0.5">
            <span className={`text-[13px] leading-snug truncate ${
              isNew ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'
            }`}>
              {item.callerName}
            </span>
            <span className="text-[10px] text-[#706e6b] flex-shrink-0 tabular-nums">
              {item.createdAt}
            </span>
          </div>

          {/* Urgency badge */}
          {hasUrgency && (
            <div className="mb-1">
              <span className={`inline-flex text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                isCritical
                  ? 'bg-[#c23934] text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {isCritical ? 'EMERGENCY' : 'URGENT'}
              </span>
            </div>
          )}

          <p className="text-[11px] text-[#706e6b] truncate leading-relaxed">
            {[
              item.petName !== '—' ? item.petName : null,
              item.summary || null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>
    </button>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ item }: { item: CallInboxItem }) {
  if (item.urgency === 'CRITICAL')
    return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#c23934] text-white">EMERGENCY</span>
  if (item.urgency === 'URGENT')
    return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">URGENT</span>
  if (item.status === 'UNREAD')
    return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F7F3] text-[#00BFA5] border border-[#00BFA5]/20">NEW</span>
  if (item.status === 'READ')
    return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
  return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Done</span>
}

// ── Info card (detail grid) ───────────────────────────────────────────────────

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-[#dddbda] rounded-lg p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#706e6b] mb-1">{label}</p>
      <p className="text-[14px] font-semibold text-slate-900 leading-snug">{value}</p>
      {sub && <p className="text-[11px] text-[#706e6b] mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  item,
  onAction,
}: {
  item:     CallInboxItem
  onAction: (id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => void
}) {
  const vertical   = useVertical()
  const isActioned = item.status === 'ACTIONED'
  const isUrgent   = item.urgency === 'CRITICAL' || item.urgency === 'URGENT'

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-[#dddbda] shadow-sm overflow-hidden">

      {/* Record Header */}
      <div className="px-6 py-5 border-b border-[#dddbda] flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h2 className="text-[22px] font-bold text-slate-900 leading-tight">{item.callerName}</h2>
              <StatusBadge item={item} />
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[#706e6b] flex-wrap">
              {item.callerPhone !== '—' && (
                isSashHallucination(item.callerPhone) ? (
                  <span className="flex items-center gap-1 text-[#c23934] font-semibold">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {item.callerPhone}
                    <span className="text-[10px] font-normal">(System Hallucination — SASH)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    {item.callerPhone}
                  </span>
                )
              )}
              <span className="w-1 h-1 bg-[#dddbda] rounded-full" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {item.createdAt}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="px-3.5 py-1.5 text-[13px] text-[#00BFA5] font-medium border border-[#dddbda] rounded-md bg-white hover:bg-[#f4f6f9] transition-colors">
              Assign Task
            </button>
            <button className="px-3.5 py-1.5 text-[13px] text-[#00BFA5] font-medium border border-[#dddbda] rounded-md bg-white hover:bg-[#f4f6f9] transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Emergency alert bar */}
      {isUrgent && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2.5 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-[13px] font-medium text-amber-900">
            Emergency referral logged — follow up with owner immediately
          </span>
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* AI Summary */}
        <div className="border border-[#dddbda] rounded-lg overflow-hidden">
          <div className="px-5 py-3 bg-[#f4f6f9] border-b border-[#dddbda] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0d9488]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#706e6b]">AI Summary &amp; Routing</p>
          </div>
          <div className="px-5 py-4 border-l-[3px] border-l-[#0d9488]">
            <p className="text-[13px] text-slate-700 leading-relaxed italic">
              {item.aiDetail || item.summary || 'No summary available.'}
            </p>
            <p className="text-[10px] text-[#706e6b]/70 mt-2">
              Auto-generated from call transcript. Staff to verify before acting.
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#706e6b] mb-2.5">Details</p>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label={vertical.ownerLabel}
              value={item.callerName}
            />
            <InfoCard
              label="Phone"
              value={isSashHallucination(item.callerPhone) ? '— (Hallucination)' : (item.callerPhone !== '—' ? item.callerPhone : '—')}
              sub="Primary Mobile"
            />
            <InfoCard
              label={vertical.patientLabel}
              value={item.petName !== '—' ? item.petName : '—'}
            />
            {vertical.key === 'vet' ? (
              <InfoCard
                label="Species"
                value={item.petSpecies !== '—' ? item.petSpecies : '—'}
              />
            ) : (
              <div className="bg-white border border-[#dddbda] rounded-lg p-4 col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#706e6b] mb-1">Key Handover Fields</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">{vertical.handoverFields.join(' · ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Required */}
        {item.actionRequired && item.actionRequired !== '—' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#706e6b] mb-2.5">Action Required</p>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-medium px-3.5 py-2 rounded-md">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              {item.actionRequired}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-[#dddbda] flex items-center gap-3 flex-shrink-0">
        {/* Live tracking indicator */}
        <div className="mr-auto flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-[#706e6b] uppercase tracking-wider">Live Case Tracking</span>
        </div>

        {isActioned ? (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCheck className="w-4 h-4" />
            <span className="text-[13px] font-semibold">Actioned</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => onAction(item.id, 'BOOK')}
              className="px-4 py-2.5 bg-white border border-[#dddbda] text-slate-700 text-[13px] font-medium rounded-md hover:bg-[#f4f6f9] transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book appointment
            </button>
            <button
              onClick={() => onAction(item.id, 'CALL_BACK')}
              className={`px-5 py-2.5 text-white text-[13px] font-semibold rounded-md shadow-sm transition-all flex items-center gap-1.5 ${
                isUrgent
                  ? 'bg-[#c23934] hover:bg-[#a61f1f] shadow-red-200/50'
                  : 'bg-[#00BFA5] hover:bg-[#00A98E] shadow-teal-200/50'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Call back
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-white rounded-lg border border-[#dddbda] text-center p-10">
      <div className="w-12 h-12 rounded-full bg-[#f4f6f9] border border-[#dddbda] flex items-center justify-center mb-3">
        <Phone className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-[13px] font-semibold text-slate-400">Select a call to view details</p>
      <p className="text-[11px] text-slate-300 mt-1">Click any call in the list</p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CallsPage() {
  const { activeClinicId } = useClinic()
  const [inbox,      setInbox]      = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toasts,     setToasts]     = useState<ToastItem[]>([])

  useEffect(() => {
    if (inbox.length > 0 && !selectedId) {
      setSelectedId(inbox[0].id)
    }
  }, [inbox, selectedId])

  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const fetchInbox = useCallback(() => {
    fetch('/api/inbox')
      .then(r => r.json())
      .then((live: CallInboxItem[]) => {
        if (Array.isArray(live) && live.length > 0) setInbox(live)
      })
      .catch(() => {})
  }, [])

  const prevClinicRef = useRef(activeClinicId)
  useEffect(() => {
    if (prevClinicRef.current !== activeClinicId) {
      setInbox([])
      setSelectedId(null)
      prevClinicRef.current = activeClinicId
    }
    fetchInbox()
    const interval = setInterval(fetchInbox, 30_000)
    return () => clearInterval(interval)
  }, [fetchInbox, activeClinicId])

  const handleMarkRead = useCallback((id: string) => {
    setInbox(prev =>
      prev.map(i => i.id === id && i.status === 'UNREAD' ? { ...i, status: 'READ' } : i)
    )
    fetch('/api/inbox', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status: 'READ' }),
    }).catch(() => {})
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    handleMarkRead(id)
  }, [handleMarkRead])

  const handleAction = useCallback((id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => {
    const item = inbox.find(i => i.id === id)
    if (!item) return
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status: 'ACTIONED' } : i))
    fetch('/api/inbox', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status: 'ACTIONED' }),
    }).catch(() => {})
    if (action === 'CALL_BACK')     addToast(`Callback marked for ${item.callerName}`)
    else if (action === 'BOOK')     addToast(`Booking request logged for ${item.petName}`)
    else                            addToast(`Marked done — ${item.callerName}`)
  }, [inbox, addToast])

  const unread       = inbox.filter(i => i.status === 'UNREAD').length
  const selectedItem = inbox.find(i => i.id === selectedId) ?? null

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

      <TopBar
        title="Call Inbox"
        subtitle="Every call Sarah handled — review, action, and follow up"
      />

      {/* Split-pane body */}
      <div className="flex flex-1 overflow-hidden bg-[#f4f6f9]">

        {/* LEFT — call list */}
        <div className="w-[288px] flex-shrink-0 flex flex-col border-r border-[#dddbda] bg-white overflow-hidden">

          {/* List header */}
          <div className="px-4 py-3.5 border-b border-[#dddbda] flex items-center justify-between flex-shrink-0 bg-[#f4f6f9]">
            <span className="text-[13px] font-bold text-slate-700">Recent Calls</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <span className="text-[10px] font-bold text-[#00BFA5] bg-[#E0F7F3] border border-[#00BFA5]/20 px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
              <span className="text-[10px] font-bold text-[#706e6b] bg-white border border-[#dddbda] px-2 py-0.5 rounded shadow-sm uppercase tracking-tight">
                {inbox.length} Total
              </span>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#dddbda]/60">
            {inbox.length === 0 ? (
              <p className="text-center text-[12px] text-[#706e6b] py-10">No calls yet</p>
            ) : (
              inbox.map(item => (
                <ListRow
                  key={item.id}
                  item={item}
                  isActive={selectedId === item.id}
                  onClick={() => handleSelect(item.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT — detail panel */}
        <div className="flex-1 p-5 overflow-hidden">
          {selectedItem
            ? <DetailPanel item={selectedItem} onAction={handleAction} />
            : <EmptyDetail />
          }
        </div>
      </div>

      <ToastContainer
        toasts={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  )
}
