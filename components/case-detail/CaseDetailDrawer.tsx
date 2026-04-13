'use client'

import {
  X,
  Sparkles,
  MapPin,
  Phone,
  MessageSquare,
  PlayCircle,
  AlertTriangle,
  Info,
  Asterisk,
} from 'lucide-react'
import { mockQueue } from '@/data/mock-queue'
import { mockCases } from '@/data/mock-cases'
import CaseTimeline from './CaseTimeline'

interface Props {
  entryId: string | null
  open: boolean
  onClose: () => void
}

const urgencyBadge: Record<string, string> = {
  URGENT: 'bg-[#b91c1c] text-white',
  HIGH: 'bg-orange-500 text-white',
  ROUTINE: 'bg-teal-500 text-white',
  FOLLOW_UP: 'bg-slate-400 text-white',
}

const riskColor: Record<string, string> = {
  URGENT: 'text-[#b91c1c]',
  HIGH: 'text-orange-600',
  ROUTINE: 'text-teal-600',
  FOLLOW_UP: 'text-slate-600',
}

export default function CaseDetailDrawer({ entryId, open, onClose }: Props) {
  const entry = mockQueue.find((e) => e.id === entryId) ?? mockQueue[0]
  const fullCase = mockCases.find((c) => c.id === entry.caseId) ?? null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-4">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close case drawer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Case #{entry.caseId ?? entry.id}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="text-[#00BFA5]">{entry.patient.name.toUpperCase()}</span>
                {' '}|{' '}
                {entry.patient.age} {entry.patient.species} / {entry.patient.breed}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${urgencyBadge[entry.triageLevel]}`}
          >
            {entry.triageLevel === 'FOLLOW_UP' ? 'FOLLOW-UP' : entry.triageLevel}
          </span>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* AI Triage Intelligence */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#00BFA5] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Triage Intelligence</h3>
            </div>

            <div className="bg-[#E0F7F3] border border-[#bae6fd] rounded-3xl p-6">
              <p className="text-slate-700 text-sm leading-relaxed mb-6">{entry.aiSummary}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Risk Factor
                  </p>
                  <p className={`font-bold text-sm ${riskColor[entry.triageLevel]}`}>
                    {entry.riskFactor}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Urgency Score
                  </p>
                  <p className="text-[#00BFA5] font-bold text-sm">{entry.urgencyScore} / 10</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white rounded-2xl p-4">
                <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-slate-600 italic">
                  &ldquo;{entry.aiJustification}&rdquo;
                </p>
              </div>
            </div>
          </section>

          {/* Owner Identity & Contact */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Owner Identity &amp; Contact
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.patient.ownerName.replace(/\s/g, '')}&backgroundColor=f8fafc`}
                  alt={entry.patient.ownerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{entry.patient.ownerName}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {entry.patient.ownerAddress ?? 'Address not on file'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="text-xs font-bold text-[#00BFA5] flex items-center gap-1.5 hover:text-[#00A98E] transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    {entry.patient.ownerPhone}
                  </button>
                  <button className="text-xs font-bold text-[#00BFA5] flex items-center gap-1.5 hover:text-[#00A98E] transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Chief Concern */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Chief Concern
            </h3>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-sm text-slate-700 font-medium">{entry.chiefConcern}</p>
              {entry.notes && (
                <p className="text-xs text-slate-500 mt-2">{entry.notes}</p>
              )}
            </div>
          </section>

          {/* Case Timeline */}
          {fullCase && fullCase.timeline.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Case Timeline
              </h3>
              <CaseTimeline events={fullCase.timeline} />
            </section>
          )}

          {/* Media Assets */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Media Assets
              </h3>
              <span className="px-3 py-1 bg-[#E0F7F3] text-[#00BFA5] text-[10px] font-bold rounded-full">
                3 Assets
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                'photo-1583337130417-3346a1be7dee',
                'photo-1587300003388-59208cc962cb',
              ].map((img, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={`https://images.unsplash.com/${img}?auto=format&fit=crop&q=80&w=200`}
                    alt="Media asset"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
              <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
                <PlayCircle className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Video</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Sticky footer actions ────────────────────────────────────────────── */}
        <div className="p-6 shrink-0 border-t border-slate-100 bg-white">
          <button className="w-full py-4 bg-[#b91c1c] text-white font-bold rounded-full hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm mb-3">
            <AlertTriangle className="w-4 h-4" />
            ESCALATE TO EMERGENCY
          </button>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-[#00BFA5] text-white font-bold rounded-full hover:bg-[#00A98E] transition-colors text-sm">
              Approve Booking
            </button>
            <button className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-300 transition-colors text-sm">
              Assign Clinician
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
