'use client'

import { ExternalLink } from 'lucide-react'
import type { CoveredInteraction, IntakeSource, Urgency, InteractionStatus, EnquiryType } from '@/data/mock-dashboard'

interface InteractionsTableProps {
  interactions: CoveredInteraction[]
  onSelect: (id: string) => void
  selectedId: string | null
}

const SOURCE_BADGES: Record<IntakeSource, { label: string; color: string }> = {
  VOICE_AI:   { label: 'Voice AI',  color: 'bg-sky-50 text-sky-700 border border-sky-100' },
  WEB_CHAT:   { label: 'Web Chat',  color: 'bg-violet-50 text-violet-700 border border-violet-100' },
  PHONE:      { label: 'Phone',     color: 'bg-slate-100 text-slate-600 border border-slate-200' },
  FRONT_DESK: { label: 'Walk-in',   color: 'bg-slate-100 text-slate-500' },
  REFERRAL:   { label: 'Referral',  color: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
}

const URGENCY_CONFIG: Record<Urgency, { label: string; badge: string; dot: string; rowAccent: string }> = {
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-red-50 text-red-700 border border-red-100',
    dot: 'bg-red-500 animate-pulse',
    rowAccent: 'border-l-2 border-l-red-400',
  },
  URGENT: {
    label: 'Urgent',
    badge: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: 'bg-amber-400',
    rowAccent: 'border-l-2 border-l-amber-400',
  },
  ROUTINE: {
    label: 'Routine',
    badge: 'bg-slate-50 text-slate-500 border border-slate-100',
    dot: 'bg-slate-300',
    rowAccent: 'border-l-2 border-l-transparent',
  },
}

const STATUS_CONFIG: Record<InteractionStatus, { label: string; color: string }> = {
  HANDLED:           { label: 'Handled',        color: 'text-emerald-700 bg-emerald-50 border border-emerald-100' },
  CALLBACK_REQUIRED: { label: 'Callback',        color: 'text-amber-700 bg-amber-50 border border-amber-100' },
  ESCALATED:         { label: 'Escalated',       color: 'text-red-700 bg-red-50 border border-red-100' },
  PENDING:           { label: 'Pending',          color: 'text-slate-600 bg-slate-100 border border-slate-200' },
  BOOKING_REQUESTED: { label: 'Book Appt',        color: 'text-sky-700 bg-sky-50 border border-sky-100' },
}

const ENQUIRY_LABELS: Record<EnquiryType, string> = {
  APPOINTMENT:      'Appointment',
  URGENT_CONCERN:   'Urgent Concern',
  GENERAL_ENQUIRY:  'General Enquiry',
  CALLBACK_REQUEST: 'Callback Request',
  EMERGENCY:        'Emergency',
  PRICING:          'Pricing Enquiry',
  MEDICATION:       'Medication',
}

export default function InteractionsTable({ interactions, onSelect, selectedId }: InteractionsTableProps) {
  if (interactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Today&apos;s Covered Calls</h2>
            <p className="text-xs text-slate-400 mt-0.5">No calls yet — VetDesk is ready</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
            <span className="text-lg">📞</span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">No calls captured yet</p>
          <p className="text-xs text-slate-400">Calls handled by VetDesk will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Today&apos;s Covered Calls</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {interactions.length} call{interactions.length !== 1 ? 's' : ''} handled by VetDesk
          </p>
        </div>
        <button className="text-xs font-semibold text-[#0ea5e9] hover:text-[#0f5b8a] transition-colors">
          View all →
        </button>
      </div>

      {/* Column headers */}
      <div className="grid gap-0 px-6 py-2.5 bg-slate-50/70 border-b border-slate-100"
        style={{ gridTemplateColumns: '80px 1fr 130px 130px 90px 110px 36px' }}>
        {['Time', 'Caller', 'Pet', 'Reason', 'Urgency', 'Status', ''].map((col) => (
          <span key={col} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {interactions.map((row) => {
          const urgency = URGENCY_CONFIG[row.urgency]
          const status = STATUS_CONFIG[row.status]
          const source = SOURCE_BADGES[row.source]
          const isSelected = selectedId === row.id

          return (
            <div
              key={row.id}
              onClick={() => onSelect(row.id)}
              className={`grid gap-0 px-6 py-3.5 cursor-pointer transition-colors ${urgency.rowAccent} ${
                isSelected ? 'bg-[#f0f7ff]' : 'hover:bg-slate-50/80'
              }`}
              style={{ gridTemplateColumns: '80px 1fr 130px 130px 90px 110px 36px' }}
            >
              {/* Time */}
              <div className="flex items-center">
                <span className="text-xs text-slate-400 font-medium">{row.createdAt}</span>
              </div>

              {/* Caller */}
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900 truncate">{row.callerName}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${source.color}`}>
                    {source.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate leading-relaxed">{row.summary}</p>
              </div>

              {/* Pet */}
              <div className="flex flex-col justify-center pr-4">
                <span className="text-sm text-slate-700 font-medium truncate">
                  {row.petName === '—' ? <span className="text-slate-300">—</span> : row.petName}
                </span>
                {row.species !== '—' && (
                  <span className="text-xs text-slate-400">{row.species}</span>
                )}
              </div>

              {/* Reason */}
              <div className="flex items-center pr-4">
                <span className="text-xs text-slate-600 truncate">{ENQUIRY_LABELS[row.enquiryType]}</span>
              </div>

              {/* Urgency */}
              <div className="flex items-center">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${urgency.badge}`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgency.dot}`} />
                  {urgency.label}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* View */}
              <div className="flex items-center justify-center">
                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
