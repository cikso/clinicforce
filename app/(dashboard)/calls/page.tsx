'use client'

import { useState, useEffect, useCallback } from 'react'
import PageShell from '@/components/layout/PageShell'
import CallInbox from '@/components/dashboard/CallInbox'
import ToastContainer from '@/components/dashboard/ToastContainer'
import { INITIAL_INBOX, type CallInboxItem } from '@/data/mock-dashboard'
import type { ToastItem } from '@/components/dashboard/ToastContainer'

export default function CallsPage() {
  const [inbox, setInbox]   = useState<CallInboxItem[]>(INITIAL_INBOX)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // ── Helpers ──────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  // ── Fetch inbox ───────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────
  const handleMarkRead = useCallback((id: string) => {
    setInbox(prev => prev.map(i => i.id === id && i.status === 'UNREAD' ? { ...i, status: 'READ' } : i))
    fetch('/api/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'READ' }),
    }).catch(() => {})
  }, [])

  const handleAction = useCallback((id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => {
    const item = inbox.find(i => i.id === id)
    if (!item) return
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status: 'ACTIONED' } : i))
    fetch('/api/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'ACTIONED' }),
    }).catch(() => {})
    if (action === 'CALL_BACK')      addToast(`Callback marked for ${item.callerName}`, 'success')
    else if (action === 'BOOK')      addToast(`Booking request logged for ${item.petName}`, 'success')
    else                             addToast(`Marked done — ${item.callerName}`, 'success')
  }, [inbox, addToast])

  // ── Stats ─────────────────────────────────────────────────────
  const total    = inbox.length
  const unread   = inbox.filter(i => i.status === 'UNREAD').length
  const urgent   = inbox.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT').length
  const actioned = inbox.filter(i => i.status === 'ACTIONED').length

  return (
    <PageShell title="Call Inbox" subtitle="Every call Sarah handled — review, action, and follow up">

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Calls',  value: total,    color: 'text-[#0f2744]' },
          { label: 'Unread',       value: unread,   color: unread   > 0 ? 'text-[#0891b2]' : 'text-slate-400' },
          { label: 'Urgent',       value: urgent,   color: urgent   > 0 ? 'text-rose-600'  : 'text-slate-400' },
          { label: 'Actioned',     value: actioned, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(15,39,68,0.06)] px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Full inbox ────────────────────────────────────────── */}
      <CallInbox
        items={inbox}
        onAction={handleAction}
        onMarkRead={handleMarkRead}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </PageShell>
  )
}
