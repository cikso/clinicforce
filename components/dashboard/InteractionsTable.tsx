'use client'

import { ExternalLink } from 'lucide-react'
import type { CoveredInteraction, IntakeSource, Urgency, InteractionStatus, EnquiryType } from '@/data/mock-dashboard'

interface InteractionsTableProps {
  interactions: CoveredInteraction[]
  onSelect: (id: string) => void
  selectedId: string | null
}

const SOURCE_BADGES: Record<IntakeSource, { label: string; color: string }> = {
  VOICE_AI:   { label: 'Voice AI',  color: 'bg-[#0891b2]/[0.08] text-[#0e7490] border border-[#0891b2]/20' },
  WEB_CHAT:   { label: 'Web Chat',  color: 'bg-violet-50 text-violet-600 border border-violet-100' },
  PHONE:      { label: 'Phone',     color: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
  FRONT_DESK: { label: 'Walk-in',   color: 'bg-slate-50 text-slate-500 border border-slate-200/50' },
  REFERRAL:   { label: 'Referral',  color: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
}

const URGENCY_CONFIG: Record<Urgency, { label: string; badge: string; dot: string; rowAccent: string }> = {
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    dot:   'bg-rose-500 animate-pulse',
    rowAccent: 'border-l-[2px] border-l-rose-400',
  },
  URGENT: {
    label: 'Urgent',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    dot:   'bg-amber-400',
    rowAccent: 'border-l-[2px] border-l-amber-400',
  },
  ROUTINE: {
    label: 'Routine',
    badge: 'bg-slate-50 text-slate-500 border border-slate-200/70',
    dot:   'bg-slate-300',
    rowAccent: 'border-l-[2px] border-l-transparent',
  },
}

const STATUS_CONFIG: Record<InteractionStatus, { label: string; color: string }> = {
  HANDLED:           { label: 'Handled',   color: 'text-emerald-700 bg-emerald-50 border border-emerald-200/80' },
  CALLBACK_REQUIRED: { label: 'Callback',  color: 'text-amber-700 bg-amber-50 border border-amber-200/80' },
  ESCALATED:         { label: 'Escalated', color: 'text-rose-700 bg-rose-50 border border-rose-200/80' },
  PENDING:           { label: 'Pending',   color: 'text-slate-600 bg-slate-50 border border-slate-200/70' },
  BOOKING_REQUESTED: { label: 'Book Appt', color: 'text-[#0e7490] bg-[#0891b2]/[0.06] border border-[#0891b2]/20' },
}

const ENQUIRY_LABELS: Record<EnquiryType, string> = {
  APPOINTMENT:      'Appointment',
  URGENT_CONCERN:   'Urgent Concern',
  GENERAL_ENQUIRY:  'General',
  CALLBACK_REQUEST: 'Callback',
  EMERGENCY:        'Emergency',
  PRICING:          'Pricing',
  MEDICATION:       'Medication',
}

export default function InteractionsTable({ interactions, onSelect, selectedId }: InteractionsTableProps) {
  if (interactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(15,39,68,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-[#0f2744]">Today&apos;s Interactions</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">No interactions yet — VetDesk is standing by</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-3">
            <span className="text-base">📞</span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">No calls captured yet</p>
          <p className="text-[11px] text-slate-400">Interactions handled by VetDesk will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(15,39,68,0.06)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-[#0f2744]">Today&apos;s Interactions</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {interactions.length} interaction{interactions.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <button className="text-[11px] font-semibold text-[#0891b2] hover:text-[#0e7490] transition-colors">
          View all →
        </button>
      </div>

      {/* Column headers */}
      <div
        className="grid px-6 py-2.5 bg-[#f8f9fb] border-b border-slate-100"
        style={{ gridTemplateColumns: '72px 1fr 120px 120px 88px 106px 28px' }}
      >
        {['Time', 'Caller', 'Pet', 'Reason', 'Urgency', 'Status', ''].map((col) => (
          <span key={col} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {interactions.map((row) => {
          const urgency    = URGENCY_CONFIG[row.urgency]
          const status     = STATUS_CONFIG[row.status]
          const source     = SOURCE_BADGES[row.source]
          const isSelected = selectedId === row.id

          return (
            <div
              key={row.id}
              onClick={() => onSelect(row.id)}
              className={`grid px-6 py-3 cursor-pointer transition-colors ${urgency.rowAccent} ${
                isSelected ? 'bg-[#eef7f9]' : 'hover:bg-[#f8f9fb]'
              }`}
              style={{ gridTemplateColumns: '72px 1fr 120px 120px 88px 106px 28px' }}
            >
              {/* Time */}
              <div className="flex items-center">
                <span className="text-[11px] text-slate-400 font-medium tabular-nums">{row.createdAt}</span>
              </div>

              {/* Caller */}
              <div className="min-w-0 pr-4 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[13px] font-semibold text-slate-900 truncate">{row.callerName}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-[2px] rounded shrink-0 ${source.color}`}>
                    {source.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate leading-snug">{row.summary}</p>
              </div>

              {/* Pet */}
              <div className="flex flex-col justify-center pr-3">
                <span className="text-[13px] text-slate-700 font-medium truncate">
                  {row.petName === '—' ? <span className="text-slate-300">—</span> : row.petName}
                </span>
                {row.species !== '—' && (
                  <span className="text-[11px] text-slate-400 mt-px">{row.species}</span>
                )}
              </div>

              {/* Reason */}
              <div className="flex items-center pr-3">
                <span className="text-[12px] text-slate-600 truncate">{ENQUIRY_LABELS[row.enquiryType]}</span>
              </div>

              {/* Urgency */}
              <div className="flex items-center">
                <div className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold ${urgency.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgency.dot}`} />
                  {urgency.label}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span className={`text-[10px] font-semibold px-2 py-[3px] rounded ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* View icon */}
              <div className="flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-slate-300 hover:text-slate-400 transition-colors" />
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
