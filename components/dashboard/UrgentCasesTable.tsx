'use client'

import { DashboardCase, CaseUrgency, IntakeSource } from '@/data/mock-dashboard'
import { Sparkles, Mic, MessageSquare, Phone, User, GitBranch, ArrowRight } from 'lucide-react'

interface UrgentCasesTableProps {
  cases: DashboardCase[]
  selectedId: string | null
  onSelectCase: (id: string) => void
  onAction: (caseId: string, action: string) => void
}

const urgencyConfig: Record<CaseUrgency, { label: string; pill: string; dot: string }> = {
  CRITICAL: { label: 'Critical', pill: 'bg-[#b91c1c] text-white', dot: 'bg-white' },
  URGENT: { label: 'Urgent', pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ROUTINE: { label: 'Routine', pill: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500' },
}

const sourceConfig: Record<IntakeSource, { label: string; color: string; icon: React.ReactNode }> = {
  VOICE_AI: { label: 'Voice AI', color: 'text-teal-700 bg-teal-50', icon: <Mic className="w-3 h-3" /> },
  WEB_CHAT: { label: 'Web Chat', color: 'text-emerald-700 bg-emerald-50', icon: <MessageSquare className="w-3 h-3" /> },
  PHONE: { label: 'Phone', color: 'text-purple-700 bg-purple-50', icon: <Phone className="w-3 h-3" /> },
  FRONT_DESK: { label: 'Front Desk', color: 'text-slate-600 bg-slate-100', icon: <User className="w-3 h-3" /> },
  REFERRAL: { label: 'Referral', color: 'text-indigo-700 bg-indigo-50', icon: <GitBranch className="w-3 h-3" /> },
}

const statusLabel: Record<string, { text: string; color: string }> = {
  HANDLED:          { text: 'Handled',          color: 'text-emerald-600 bg-emerald-50' },
  CALLBACK_REQUIRED: { text: 'Callback Needed', color: 'text-amber-600 bg-amber-50' },
  ESCALATED:        { text: 'Escalated',        color: 'text-[#b91c1c] bg-rose-50' },
  PENDING:          { text: 'Pending',           color: 'text-teal-600 bg-teal-50' },
  BOOKING_REQUESTED: { text: 'Book Appt',       color: 'text-sky-600 bg-sky-50' },
  // Legacy values kept for safety
  WAITING:          { text: 'Waiting',           color: 'text-rose-600 bg-rose-50' },
  IN_REVIEW:        { text: 'In Review',         color: 'text-teal-600 bg-teal-50' },
  IN_TREATMENT:     { text: 'In Treatment',      color: 'text-emerald-600 bg-emerald-50' },
  AWAITING_OWNER:   { text: 'Awaiting Owner',    color: 'text-amber-600 bg-amber-50' },
}

function actionLabel(c: DashboardCase): { label: string; style: string } {
  if (c.urgency === 'CRITICAL') return { label: 'Admit to ER', style: 'bg-[#b91c1c] text-white hover:bg-red-800' }
  if (c.status === 'CALLBACK_REQUIRED') return { label: 'Triage Now', style: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]' }
  if (c.status === 'PENDING') return { label: 'Review', style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' }
  if (!c.clinician) return { label: 'Assign', style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' }
  return { label: 'Update', style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' }
}

const SPECIES_EMOJI: Record<string, string> = {
  Feline: '🐈',
  Canine: '🐕',
  Avian: '🦜',
  Exotic: '🦎',
  Rabbit: '🐇',
}

export default function UrgentCasesTable({ cases, selectedId, onSelectCase, onAction }: UrgentCasesTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-900">Live Urgent Cases</h3>
          <span className="text-sm text-slate-500 font-medium">{cases.length} active</span>
        </div>
        <button className="text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-hover)] flex items-center gap-1 transition-colors">
          View Full Queue <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <th className="px-6 py-3.5">Patient</th>
              <th className="px-4 py-3.5">Issue &amp; Source</th>
              <th className="px-4 py-3.5">Status &amp; Wait</th>
              <th className="px-4 py-3.5">AI Summary</th>
              <th className="px-4 py-3.5">Clinician</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cases.map((c) => {
              const urg = urgencyConfig[c.urgency]
              const src = sourceConfig[c.source]
              const st = statusLabel[c.status]
              const act = actionLabel(c)
              const isSelected = selectedId === c.id

              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected ? 'bg-[var(--brand-light)]' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Patient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {SPECIES_EMOJI[c.species] ?? '🐾'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{c.patientName}</p>
                        <p className="text-xs text-slate-500">{c.breed}</p>
                      </div>
                    </div>
                  </td>

                  {/* Issue & Source */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-slate-900 mb-1.5">{c.issue}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${src.color}`}>
                      {src.icon}
                      {src.label}
                    </div>
                  </td>

                  {/* Status & Wait */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${urg.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urg.dot} ${c.urgency === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                          {urg.label}
                        </span>
                        <span className={`text-sm font-bold ${c.urgency === 'CRITICAL' ? 'text-[#b91c1c]' : c.urgency === 'URGENT' ? 'text-amber-600' : 'text-slate-600'}`}>
                          {c.waitMinutes}m
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${st.color}`}>
                        {st.text}
                      </span>
                    </div>
                  </td>

                  {/* AI Summary */}
                  <td className="px-4 py-4 max-w-[200px]">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 italic">{c.aiSummary}</p>
                    </div>
                  </td>

                  {/* Clinician */}
                  <td className="px-4 py-4">
                    {c.clinician ? (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.clinicianAvatar}&backgroundColor=e2e8f0`}
                          alt={c.clinician}
                          className="w-7 h-7 rounded-full border border-slate-200"
                        />
                        <span className="text-xs font-semibold text-slate-700">{c.clinician}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                          ?
                        </div>
                        <span className="text-xs font-medium text-slate-400">Unassigned</span>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-colors ${act.style}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAction(c.id, act.label)
                      }}
                    >
                      {act.label}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
