'use client'

import type { CoveredInteraction, IntakeSource, Urgency, InteractionStatus, EnquiryType } from '@/data/mock-dashboard'

interface InteractionsTableProps {
  interactions: CoveredInteraction[]
  onSelect: (id: string) => void
  selectedId: string | null
}

const SOURCE_BADGES: Record<IntakeSource, { label: string; color: string }> = {
  VOICE_AI:   { label: 'Voice AI',    color: 'bg-sky-50 text-sky-700 border border-sky-100' },
  WEB_CHAT:   { label: 'Web Chat',    color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  PHONE:      { label: 'Phone',       color: 'bg-violet-50 text-violet-700 border border-violet-100' },
  FRONT_DESK: { label: 'Walk-in',     color: 'bg-slate-100 text-slate-600' },
  REFERRAL:   { label: 'Referral',    color: 'bg-indigo-50 text-indigo-700' },
}

const URGENCY_BADGES: Record<Urgency, { label: string; color: string; dot: string }> = {
  CRITICAL: { label: 'Critical',  color: 'bg-red-50 text-red-700',    dot: 'bg-red-500 animate-pulse' },
  URGENT:   { label: 'Urgent',    color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  ROUTINE:  { label: 'Routine',   color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

const STATUS_BADGES: Record<InteractionStatus, { label: string; color: string }> = {
  HANDLED:          { label: 'Handled',          color: 'text-emerald-600 bg-emerald-50' },
  CALLBACK_REQUIRED: { label: 'Callback Needed', color: 'text-amber-700 bg-amber-50' },
  ESCALATED:        { label: 'Escalated',        color: 'text-red-700 bg-red-50' },
  PENDING:          { label: 'Pending',           color: 'text-slate-600 bg-slate-100' },
  BOOKING_REQUESTED: { label: 'Book Appt',       color: 'text-sky-700 bg-sky-50' },
}

const ENQUIRY_LABELS: Record<EnquiryType, string> = {
  APPOINTMENT:     'Appointment',
  URGENT_CONCERN:  'Urgent Concern',
  GENERAL_ENQUIRY: 'General Enquiry',
  CALLBACK_REQUEST:'Callback Request',
  EMERGENCY:       'Emergency',
  PRICING:         'Pricing',
  MEDICATION:      'Medication',
}

export default function InteractionsTable({ interactions, onSelect, selectedId }: InteractionsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Today&apos;s Covered Interactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">{interactions.length} interactions during active coverage windows</p>
        </div>
        <button className="text-xs font-semibold text-[#0f5b8a] hover:underline">View All →</button>
      </div>

      <div className="divide-y divide-slate-50">
        {interactions.map((interaction) => {
          const urgency = URGENCY_BADGES[interaction.urgency]
          const status = STATUS_BADGES[interaction.status]
          const source = SOURCE_BADGES[interaction.source]
          const isSelected = selectedId === interaction.id

          return (
            <div
              key={interaction.id}
              onClick={() => onSelect(interaction.id)}
              className={`px-6 py-4 cursor-pointer hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-[#f0f6ff]' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-slate-500">
                    {interaction.callerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{interaction.callerName}</span>
                    {interaction.petName !== '—' && (
                      <span className="text-xs text-slate-400">/ {interaction.petName} ({interaction.species})</span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${source.color}`}>
                      {source.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 line-clamp-1">{interaction.summary}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {ENQUIRY_LABELS[interaction.enquiryType]}
                    </span>
                    <span className="text-[10px] text-slate-400">{interaction.createdAt}</span>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${urgency.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                    {urgency.label}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${status.color}`}>
                    {status.label}
                  </span>
                  {interaction.nextAction !== '—' && (
                    <span className="text-[10px] text-slate-400 max-w-[120px] text-right truncate">{interaction.nextAction}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
