'use client'

import type { CoveredInteraction, IntakeSource, Urgency, InteractionStatus, EnquiryType } from '@/data/mock-dashboard'

interface InteractionsTableProps {
  interactions: CoveredInteraction[]
  onSelect: (id: string) => void
  selectedId: string | null
}

const SOURCE_BADGES: Record<IntakeSource, { label: string; color: string }> = {
  VOICE_AI:   { label: 'Voice AI',  color: 'bg-sky-50 text-sky-700 border border-sky-100' },
  WEB_CHAT:   { label: 'Web Chat',  color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  PHONE:      { label: 'Phone',     color: 'bg-violet-50 text-violet-700 border border-violet-100' },
  FRONT_DESK: { label: 'Walk-in',   color: 'bg-slate-100 text-slate-600' },
  REFERRAL:   { label: 'Referral',  color: 'bg-indigo-50 text-indigo-700' },
}

const URGENCY_CONFIG: Record<Urgency, { label: string; badge: string; dot: string; rowBorder: string; avatarBg: string }> = {
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-red-50 text-red-700 border border-red-100',
    dot: 'bg-red-500 animate-pulse',
    rowBorder: 'border-l-4 border-l-red-400',
    avatarBg: 'bg-red-50 text-red-600',
  },
  URGENT: {
    label: 'Urgent',
    badge: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: 'bg-amber-500',
    rowBorder: 'border-l-4 border-l-amber-400',
    avatarBg: 'bg-amber-50 text-amber-600',
  },
  ROUTINE: {
    label: 'Routine',
    badge: 'bg-slate-100 text-slate-500',
    dot: 'bg-slate-300',
    rowBorder: 'border-l-4 border-l-transparent',
    avatarBg: 'bg-slate-100 text-slate-500',
  },
}

const STATUS_BADGES: Record<InteractionStatus, { label: string; color: string }> = {
  HANDLED:           { label: 'Handled',         color: 'text-emerald-700 bg-emerald-50 border border-emerald-100' },
  CALLBACK_REQUIRED: { label: 'Callback Needed', color: 'text-amber-700 bg-amber-50 border border-amber-100' },
  ESCALATED:         { label: 'Escalated',       color: 'text-red-700 bg-red-50 border border-red-100' },
  PENDING:           { label: 'Pending',          color: 'text-slate-600 bg-slate-100' },
  BOOKING_REQUESTED: { label: 'Book Appt',        color: 'text-sky-700 bg-sky-50 border border-sky-100' },
}

const ENQUIRY_LABELS: Record<EnquiryType, string> = {
  APPOINTMENT:      'Appointment',
  URGENT_CONCERN:   'Urgent Concern',
  GENERAL_ENQUIRY:  'General Enquiry',
  CALLBACK_REQUEST: 'Callback Request',
  EMERGENCY:        'Emergency',
  PRICING:          'Pricing',
  MEDICATION:       'Medication',
}

export default function InteractionsTable({ interactions, onSelect, selectedId }: InteractionsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Today&apos;s Covered Calls</h2>
          <p className="text-xs text-slate-400 mt-0.5">{interactions.length} call{interactions.length !== 1 ? 's' : ''} handled by VetDesk</p>
        </div>
        <button className="text-xs font-semibold text-[#0ea5e9] hover:text-[#0f5b8a] transition-colors">
          View All →
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {interactions.map((interaction) => {
          const urgency = URGENCY_CONFIG[interaction.urgency]
          const status = STATUS_BADGES[interaction.status]
          const source = SOURCE_BADGES[interaction.source]
          const isSelected = selectedId === interaction.id
          const initials = interaction.callerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

          return (
            <div
              key={interaction.id}
              onClick={() => onSelect(interaction.id)}
              className={`px-6 py-4 cursor-pointer transition-colors ${urgency.rowBorder} ${
                isSelected ? 'bg-[#f0f6ff]' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full ${urgency.avatarBg} flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold`}>
                  {initials}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{interaction.callerName}</span>
                    {interaction.petName !== '—' && (
                      <span className="text-xs text-slate-400">
                        / {interaction.petName}
                        {interaction.species ? ` (${interaction.species})` : ''}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${source.color}`}>
                      {source.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 line-clamp-1">{interaction.summary}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                      {ENQUIRY_LABELS[interaction.enquiryType]}
                    </span>
                    <span className="text-[10px] text-slate-400">{interaction.createdAt}</span>
                  </div>
                </div>

                {/* Right side: urgency + status */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${urgency.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                    {urgency.label}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${status.color}`}>
                    {status.label}
                  </span>
                  {interaction.nextAction && interaction.nextAction !== '—' && (
                    <span className="text-[10px] text-slate-400 max-w-[130px] text-right truncate leading-tight">
                      {interaction.nextAction}
                    </span>
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
