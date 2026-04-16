'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Phone, Calendar, CheckCheck, AlertCircle, Clock, User } from 'lucide-react'
import PageShell from '@/components/layout/PageShell'
import { useClinic } from '@/context/ClinicContext'
import ToastContainer from '@/components/dashboard/ToastContainer'
import EmptyState from '@/app/components/ui/EmptyState'
import { INITIAL_INBOX, type CallInboxItem, type Urgency } from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function avatarBg(urgency: Urgency): string {
  if (urgency === 'CRITICAL') return '#DC2626'
  if (urgency === 'URGENT')   return '#D97706'
  return '#00D68F'
}

const URGENCY_RANK: Record<Urgency, number> = { CRITICAL: 0, URGENT: 1, ROUTINE: 2 }

// ── Action card ───────────────────────────────────────────────────────────────

function ActionCard({
  item,
  onAction,
}: {
  item:     CallInboxItem
  onAction: (id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => void
}) {
  const isActioned = item.status === 'ACTIONED'
  const isCritical = item.urgency === 'CRITICAL'
  const isUrgent   = item.urgency === 'URGENT'

  return (
    <div className={`bg-white rounded-2xl border shadow-[0_1px_3px_rgba(15,39,68,0.04)] p-4 flex gap-3.5 transition-opacity ${
      isActioned ? 'opacity-50' : ''
    } ${isCritical ? 'border-red-200' : 'border-slate-200'}`}>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
        style={{ background: avatarBg(item.urgency) }}
      >
        {initials(item.callerName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold text-slate-900">{item.callerName}</span>
            {item.petName !== '—' && (
              <span className="text-[11px] text-slate-400">
                · {item.petName}{item.petSpecies !== '—' ? ` (${item.petSpecies})` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isCritical && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="w-2.5 h-2.5" /> Critical
              </span>
            )}
            {isUrgent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Urgent
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" /> {item.createdAt}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-[12px] text-slate-500 leading-relaxed mb-2">
          {item.summary || 'No summary available.'}
        </p>

        {/* Action tag */}
        {item.actionRequired && item.actionRequired !== '—' && (
          <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 text-[11px] font-medium px-2 py-0.5 rounded-full mb-2.5">
            {item.actionRequired}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
          {item.callerPhone !== '—' && (
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3" /> {item.callerPhone}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {item.coverageReason.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
          </span>
        </div>

        {/* Actions */}
        {isActioned ? (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="text-[12px] font-semibold">Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onAction(item.id, 'CALL_BACK')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: isCritical ? '#DC2626' : '#0F6E56' }}
            >
              <Phone className="w-3 h-3" />
              Call back
            </button>
            <button
              onClick={() => onAction(item.id, 'BOOK')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Calendar className="w-3 h-3" />
              Book appointment
            </button>
            <button
              onClick={() => onAction(item.id, 'DONE')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              Mark done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ActionQueuePage() {
  const { activeClinicId } = useClinic()
  const [inbox,    setInbox]    = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [toasts,   setToasts]   = useState<ToastItem[]>([])
  const [showDone, setShowDone] = useState(false)

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
      prevClinicRef.current = activeClinicId
    }
    fetchInbox()
    const interval = setInterval(fetchInbox, 30_000)
    return () => clearInterval(interval)
  }, [fetchInbox, activeClinicId])

  const handleAction = useCallback((id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => {
    const item = inbox.find(i => i.id === id)
    if (!item) return
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status: 'ACTIONED' } : i))
    fetch('/api/inbox', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status: 'ACTIONED' }),
    }).catch(() => {})
    if (action === 'CALL_BACK')   addToast(`Callback marked for ${item.callerName}`)
    else if (action === 'BOOK')   addToast(`Booking logged for ${item.petName || item.callerName}`)
    else                          addToast(`Marked done — ${item.callerName}`)
  }, [inbox, addToast])

  // Sort: Critical first, then Urgent, then Routine
  const pending = inbox
    .filter(i => i.status !== 'ACTIONED')
    .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency])

  const done = inbox.filter(i => i.status === 'ACTIONED')

  const criticalCount = pending.filter(i => i.urgency === 'CRITICAL').length

  return (
    <PageShell title="Action Queue" subtitle="Callbacks, bookings and follow-ups that need attention">

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-[0_1px_3px_rgba(15,39,68,0.04)]">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Pending</p>
          <p className="text-5xl font-bold leading-none tracking-tight text-slate-900">{pending.length}</p>
        </div>
        <div className={`rounded-2xl border px-5 py-4 shadow-[0_1px_3px_rgba(15,39,68,0.04)] ${
          criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Critical</p>
          <p className={`text-5xl font-bold leading-none tracking-tight ${
            criticalCount > 0 ? 'text-red-600' : 'text-slate-900'
          }`}>{criticalCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-[0_1px_3px_rgba(15,39,68,0.04)]">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Completed</p>
          <p className="text-5xl font-bold leading-none tracking-tight text-slate-900">{done.length}</p>
        </div>
      </div>

      {/* ── Pending actions ───────────────────────────────────── */}
      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState
            icon={<CheckCheck className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />}
            title="All clear"
            description="No pending referrals — the queue is empty."
            className="py-12"
          />
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {pending.map(item => (
            <ActionCard key={item.id} item={item} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* ── Completed section ─────────────────────────────────── */}
      {done.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowDone(v => !v)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-600 transition-colors mb-3"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {showDone ? 'Hide' : 'Show'} completed ({done.length})
          </button>
          {showDone && (
            <div className="space-y-3">
              {done.map(item => (
                <ActionCard key={item.id} item={item} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>
      )}

      <ToastContainer
        toasts={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </PageShell>
  )
}
