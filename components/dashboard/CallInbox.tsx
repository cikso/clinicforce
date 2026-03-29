'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Calendar, CheckCheck, ChevronDown, ChevronUp, Inbox, ArrowRight } from 'lucide-react'
import type { CallInboxItem } from '@/data/mock-dashboard'

type Filter = 'all' | 'unread' | 'urgent'

const URGENCY_CONFIG = {
  CRITICAL: { label: 'Critical', bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200/80',  dot: 'bg-rose-500'  },
  URGENT:   { label: 'Urgent',   bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200/80', dot: 'bg-amber-500' },
  ROUTINE:  { label: 'Routine',  bg: 'bg-slate-100', text: 'text-slate-500',  border: 'border-slate-200',    dot: 'bg-slate-300' },
}

const AVATAR_COLORS = [
  'bg-[#0f2744]', 'bg-[#0891b2]', 'bg-violet-700',
  'bg-emerald-700', 'bg-rose-700', 'bg-amber-700',
]

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

interface CallInboxProps {
  items:       CallInboxItem[]
  onAction:    (id: string, action: 'CALL_BACK' | 'BOOK' | 'DONE') => void
  onMarkRead:  (id: string) => void
  limit?:      number   // cap rows (dashboard preview mode)
  viewAllHref?: string  // if set, shows "View all" footer
}

export default function CallInbox({ items, onAction, onMarkRead, limit, viewAllHref }: CallInboxProps) {
  const [filter, setFilter]     = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const unreadCount = items.filter(i => i.status === 'UNREAD').length
  const urgentCount = items.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT').length

  const filtered = items.filter(item => {
    if (filter === 'unread') return item.status === 'UNREAD'
    if (filter === 'urgent') return item.urgency === 'CRITICAL' || item.urgency === 'URGENT'
    return true
  })

  const displayed  = limit ? filtered.slice(0, limit) : filtered
  const hiddenCount = limit ? Math.max(0, filtered.length - limit) : 0

  function handleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      onMarkRead(id)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(15,39,68,0.06)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-bold text-[#0f2744]">Call Inbox</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#0891b2] text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {(['all', 'unread', 'urgent'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                filter === f
                  ? 'bg-white text-[#0f2744] shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f === 'unread'
                ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`
                : f === 'urgent'
                ? `Urgent${urgentCount > 0 ? ` (${urgentCount})` : ''}`
                : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Items ────────────────────────────────────────────── */}
      <div className="divide-y divide-slate-100">
        {displayed.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Inbox className="w-8 h-8 text-slate-200 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-400">No calls to show</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Calls handled by VetForce will appear here
            </p>
          </div>
        ) : (
          displayed.map(item => {
            const isExpanded = expandedId === item.id
            const isUnread   = item.status === 'UNREAD'
            const isActioned = item.status === 'ACTIONED'
            const urg        = URGENCY_CONFIG[item.urgency]

            return (
              <div
                key={item.id}
                className={`transition-colors ${isExpanded ? 'bg-[#f7fbfd]' : isUnread ? 'bg-[#fafcfe]' : 'bg-white'}`}
              >
                {/* ── Row button ─────────────────────────────── */}
                <button
                  onClick={() => handleExpand(item.id)}
                  className="w-full px-5 py-3.5 flex items-start gap-3 text-left hover:bg-slate-50/80 transition-colors"
                >
                  {/* Unread dot */}
                  <div className="w-2 shrink-0 pt-[7px]">
                    {isUnread && <div className="w-2 h-2 rounded-full bg-[#0891b2]" />}
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full ${avatarColor(item.callerName)} flex items-center justify-center shrink-0 text-white text-[10px] font-bold`}>
                    {initials(item.callerName)}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                      <span className={`text-sm leading-snug ${isUnread ? 'font-bold text-[#0f2744]' : 'font-semibold text-slate-700'}`}>
                        {item.callerName}
                      </span>
                      {item.petName && item.petName !== '—' && (
                        <span className="text-[11px] text-slate-400">
                          · {item.petName}
                          {item.petSpecies && item.petSpecies !== '—' ? ` (${item.petSpecies})` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">{item.summary}</p>
                  </div>

                  {/* Right: badge + time */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${urg.bg} ${urg.text} ${urg.border}`}>
                      <span className={`w-1 h-1 rounded-full ${urg.dot}`} />
                      {urg.label}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.createdAt}</span>
                  </div>

                  {/* Chevron */}
                  <div className="text-slate-300 pt-0.5 shrink-0">
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* ── Expanded panel ─────────────────────────── */}
                {isExpanded && (
                  <div className="px-5 pb-4 pl-[52px]">
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">

                      {/* AI Summary */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">AI Summary</p>
                        <p className="text-[13px] text-slate-700 leading-relaxed">{item.aiDetail}</p>
                      </div>

                      {/* Action required */}
                      {item.actionRequired && item.actionRequired !== '—' && (
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action Required</p>
                          <p className="text-xs font-semibold text-slate-700">{item.actionRequired}</p>
                        </div>
                      )}

                      {/* Phone */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-xs font-semibold text-slate-700">{item.callerPhone}</p>
                      </div>

                      {/* Action buttons */}
                      {isActioned ? (
                        <div className="flex items-center gap-1.5 pt-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-600">Actioned</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <button
                            onClick={e => { e.stopPropagation(); onAction(item.id, 'CALL_BACK') }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2744] text-white text-xs font-bold rounded-lg hover:bg-[#162032] transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            Call Back
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onAction(item.id, 'BOOK') }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2]/[0.08] text-[#0e7490] border border-[#0891b2]/20 text-xs font-bold rounded-lg hover:bg-[#0891b2]/[0.14] transition-colors"
                          >
                            <Calendar className="w-3 h-3" />
                            Book Appointment
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onAction(item.id, 'DONE') }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Mark Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── View all footer ───────────────────────────────────── */}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center justify-center gap-1.5 px-5 py-3 border-t border-slate-100 text-[12px] font-semibold text-[#0891b2] hover:bg-slate-50 transition-colors rounded-b-xl"
        >
          {hiddenCount > 0 ? `View all calls (${hiddenCount} more)` : 'View all calls'}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}
