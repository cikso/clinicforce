'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, Calendar, CheckCheck, Info, Clock, AlertTriangle } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import ToastContainer from '@/components/dashboard/ToastContainer'
import { INITIAL_INBOX, type CallInboxItem } from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'
import { useVertical } from '@/context/VerticalContext'

// ── SASH hallucination guard ──────────────────────────────────────────────────
// (02) 9889 0289 is the Southern Animal Specialist Hospital phone number.
// If the AI captures this as a caller's number it is a system hallucination.
const SASH_DIGITS = '0298890289'
function isSashHallucination(phone: string | null | undefined): boolean {
  if (!phone) return false
  return phone.replace(/\D/g, '') === SASH_DIGITS
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function avatarBg(item: CallInboxItem): string {
  if (item.urgency === 'CRITICAL' || item.urgency === 'URGENT') return '#DC2626'
  const action = item.actionRequired?.toLowerCase() ?? ''
  if (action.includes('callback') || action.includes('call back')) return '#D97706'
  return '#1D9E75'
}

// ── Left pane: compact list row ───────────────────────────────────────────────

function ListRow({
  item,
  isActive,
  onClick,
}: {
  item:     CallInboxItem
  isActive: boolean
  onClick:  () => void
}) {
  const isNew = item.status === 'UNREAD'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-all ${
        isActive
          ? 'bg-slate-50 border-l-2 border-[#1D9E75]'
          : 'hover:bg-slate-50 border-l-2 border-transparent'
      }`}
    >
      {/* Urgency / unread dot */}
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px] ${
        item.urgency === 'CRITICAL' ? 'bg-red-600 animate-pulse' :
        item.urgency === 'URGENT'   ? 'bg-amber-500' :
        isNew                       ? 'bg-green-500' : 'opacity-0'
      }`} />

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
        style={{ background: avatarBg(item) }}
      >
        {initials(item.callerName)}
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1 mb-0.5">
          <span className={`text-[13px] leading-snug truncate ${
            isNew ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'
          }`}>
            {item.callerName}
          </span>
          <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
            {item.createdAt}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate leading-relaxed">
          {[
            item.petName !== '—' ? item.petName : null,
            item.summary || null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </button>
  )
}

// ── Right pane: status badge ──────────────────────────────────────────────────

function StatusBadge({ item }: { item: CallInboxItem }) {
  if (item.urgency === 'CRITICAL')
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">EMERGENCY</span>
  if (item.urgency === 'URGENT')
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">URGENT</span>
  if (item.status === 'UNREAD')
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 border border-green-200">NEW</span>
  if (item.status === 'READ')
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">Done</span>
}

// ── Right pane: detail panel ──────────────────────────────────────────────────

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
  const primaryBg  = isUrgent ? '#DC2626' : '#0F6E56'

  return (
    <div className="flex flex-col h-full bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <h2 className="text-[18px] font-medium text-slate-900 leading-snug">{item.callerName}</h2>
          <StatusBadge item={item} />
        </div>
        <div className="flex items-center gap-4 text-[12px] text-slate-400 flex-wrap">
          {item.petName !== '—' && (
            <span>
              {item.petName}
              {item.petSpecies !== '—' ? ` · ${item.petSpecies}` : ''}
            </span>
          )}
          {item.callerPhone !== '—' && (
            isSashHallucination(item.callerPhone) ? (
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {item.callerPhone}
                <span className="text-[10px] font-normal">(System Hallucination — SASH)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {item.callerPhone}
              </span>
            )
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.createdAt}
          </span>
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* AI Summary */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            AI Summary
          </p>
          <div className="border-l-2 border-[#1D9E75] pl-3.5 py-2 bg-emerald-50/60 rounded-r-lg">
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {item.aiDetail || item.summary || 'No summary available.'}
            </p>
          </div>
        </div>

        {/* Action Required */}
        {item.actionRequired && item.actionRequired !== '—' && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Action Required
            </p>
            <div className="inline-flex items-center gap-1.5 bg-[#FAEEDA] text-[#633806] px-3 py-1.5 rounded-full text-[13px] font-medium">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              {item.actionRequired}
            </div>
          </div>
        )}

        {/* Details grid */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* Owner */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 mb-0.5">{vertical.ownerLabel}</p>
              <p className="text-[13px] text-slate-800 font-medium truncate">{item.callerName}</p>
            </div>
            {/* Phone — with SASH hallucination guard */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 mb-0.5">Phone</p>
              {isSashHallucination(item.callerPhone) ? (
                <div className="flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-mono font-semibold text-red-600 truncate">{item.callerPhone}</p>
                    <p className="text-[9px] text-red-500 leading-tight mt-0.5">System Hallucination — SASH Number</p>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] font-mono text-slate-800 font-medium truncate">{item.callerPhone}</p>
              )}
            </div>
            {/* Patient */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 mb-0.5">{vertical.patientLabel}</p>
              <p className="text-[13px] text-slate-800 font-medium truncate">{item.petName !== '—' ? item.petName : '—'}</p>
            </div>
            {/* Species */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 mb-0.5">Species</p>
              <p className="text-[13px] text-slate-800 font-medium truncate">{item.petSpecies !== '—' ? item.petSpecies : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer — fixed */}
      <div className="px-5 py-3.5 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
        {isActioned ? (
          <div className="flex items-center gap-1.5 py-2 text-emerald-600">
            <CheckCheck className="w-4 h-4" />
            <span className="text-[13px] font-semibold">Actioned</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => onAction(item.id, 'CALL_BACK')}
              className="flex-1 py-2.5 text-white text-[13px] font-medium rounded-lg transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
              style={{ background: primaryBg }}
            >
              <Phone className="w-3.5 h-3.5" />
              Call back
            </button>
            <button
              onClick={() => onAction(item.id, 'BOOK')}
              className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book appointment
            </button>
            <button
              onClick={() => onAction(item.id, 'DONE')}
              className="px-3 py-2.5 text-slate-400 text-[13px] font-medium rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-colors whitespace-nowrap"
            >
              Mark done
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
    <div className="flex flex-col h-full items-center justify-center bg-white rounded-[14px] border border-slate-200 text-center p-10">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <Phone className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-[13px] font-semibold text-slate-400">Select a call to view details</p>
      <p className="text-[11px] text-slate-300 mt-1">Click any call in the list</p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CallsPage() {
  const [inbox,      setInbox]      = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toasts,     setToasts]     = useState<ToastItem[]>([])

  // Auto-select first item once data is ready
  useEffect(() => {
    if (inbox.length > 0 && !selectedId) {
      setSelectedId(inbox[0].id)
    }
  }, [inbox, selectedId])

  // ── Toast helper ────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  // ── Fetch (poll every 30 s) ──────────────────────────────────────
  const fetchInbox = useCallback(() => {
    fetch('/api/inbox')
      .then(r => r.json())
      .then((live: CallInboxItem[]) => {
        if (Array.isArray(live) && live.length > 0) setInbox(live)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchInbox()
    const interval = setInterval(fetchInbox, 30_000)
    return () => clearInterval(interval)
  }, [fetchInbox])

  // ── Mark read ───────────────────────────────────────────────────
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

  // ── Select row ──────────────────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    handleMarkRead(id)
  }, [handleMarkRead])

  // ── Actions ─────────────────────────────────────────────────────
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

  // ── Derived ─────────────────────────────────────────────────────
  const unread       = inbox.filter(i => i.status === 'UNREAD').length
  const selectedItem = inbox.find(i => i.id === selectedId) ?? null

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

      <TopBar
        title="Call Inbox"
        subtitle="Every call Sarah handled — review, action, and follow up"
      />

      {/* ── Split-pane body ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden bg-slate-50">

        {/* LEFT — compact call list */}
        <div className="w-[280px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">

          {/* List header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <span className="text-[13px] font-semibold text-slate-700">All calls</span>
            {unread > 0 && (
              <span className="text-[10px] font-bold text-[#1D9E75] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {unread} new
              </span>
            )}
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {inbox.length === 0 ? (
              <p className="text-center text-[12px] text-slate-400 py-10">No calls yet</p>
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
