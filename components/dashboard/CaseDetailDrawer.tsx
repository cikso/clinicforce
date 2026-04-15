'use client'

import { DashboardCase, Clinician } from '@/data/mock-dashboard'
import { X, Sparkles, MapPin, Phone, MessageSquare, Info, AlertTriangle, UserCheck } from 'lucide-react'

interface CaseDetailDrawerProps {
  cases: DashboardCase[]
  selectedId: string | null
  clinicians: Clinician[]
  onClose: () => void
  onAction: (caseId: string, action: string) => void
  onAssign: (caseId: string) => void
}

const urgencyStyles: Record<string, { pill: string; scoreColor: string; riskColor: string }> = {
  CRITICAL: { pill: 'bg-[#b91c1c] text-white', scoreColor: 'text-[#b91c1c]', riskColor: 'text-[#b91c1c]' },
  URGENT: { pill: 'bg-orange-500 text-white', scoreColor: 'text-orange-600', riskColor: 'text-orange-600' },
  ROUTINE: { pill: 'bg-teal-500 text-white', scoreColor: 'text-teal-600', riskColor: 'text-teal-600' },
}

const statusMap: Record<string, string> = {
  WAITING: 'Waiting for Assessment',
  IN_REVIEW: 'Under Clinical Review',
  IN_TREATMENT: 'In Active Treatment',
  AWAITING_OWNER: 'Awaiting Owner Arrival',
  ESCALATED: 'Escalated to ER',
}

export default function CaseDetailDrawer({
  cases,
  selectedId,
  clinicians,
  onClose,
  onAction,
  onAssign,
}: CaseDetailDrawerProps) {
  const caseData = cases.find((c) => c.id === selectedId) ?? cases[0]
  const styles = urgencyStyles[caseData?.urgency ?? 'ROUTINE']

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          selectedId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-[580px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 ${
          selectedId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors mt-0.5"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Case #{caseData?.caseRef}
              </p>
              <h2 className="text-xl font-bold text-slate-900">
                <span className="text-[#17C4BE]">{caseData?.patientName}</span>
                {' '}— {caseData?.breed}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{caseData?.species} · {caseData?.createdAt}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${styles.pill}`}>
            {caseData?.urgency}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 space-y-8">

            {/* AI Triage Intelligence */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#17C4BE] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Triage Intelligence</h3>
              </div>

              <div className="bg-[#E5F9F8] border border-[#bae6fd] rounded-2xl p-5">
                <p className="text-sm text-slate-700 leading-relaxed mb-5 italic">
                  &quot;{caseData?.aiJustification}&quot;
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-3.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Factor</p>
                    <p className={`font-bold text-sm ${styles.riskColor}`}>{caseData?.riskFactor}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency Score</p>
                    <p className={`font-bold text-sm ${styles.scoreColor}`}>
                      {caseData?.urgencyScore} <span className="text-slate-400 font-medium">/ 10</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white rounded-xl p-3.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs text-slate-600">{caseData?.aiSummary}</p>
                </div>
              </div>
            </section>

            {/* Current Status */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Current Status</h3>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                <div className={`w-2.5 h-2.5 rounded-full ${caseData?.urgency === 'CRITICAL' ? 'bg-[#b91c1c] animate-pulse' : 'bg-[#17C4BE]'}`} />
                <span className="text-sm font-semibold text-slate-700">{statusMap[caseData?.status ?? 'WAITING']}</span>
                {caseData?.clinician && (
                  <span className="ml-auto text-xs font-medium text-slate-500">
                    Assigned to <span className="font-bold text-slate-700">{caseData.clinician}</span>
                  </span>
                )}
              </div>
            </section>

            {/* Owner */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Owner &amp; Contact</h3>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caseData?.ownerAvatar}&backgroundColor=f8fafc`}
                  alt={caseData?.ownerName}
                  className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50"
                />
                <div>
                  <p className="font-bold text-slate-900">{caseData?.ownerName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {caseData?.ownerAddress}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="text-xs font-bold text-[#17C4BE] flex items-center gap-1 hover:text-[#13ADA8] transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {caseData?.ownerPhone}
                    </button>
                    <button className="text-xs font-bold text-[#17C4BE] flex items-center gap-1 hover:text-[#13ADA8] transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Media Assets */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Media Assets</h3>
                <span className="text-[10px] font-bold text-[#17C4BE] bg-teal-50 px-2 py-0.5 rounded-full">3 Assets</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
                  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
                ].map((url, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden group cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Asset ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
                <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[10px] font-bold gap-1 cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-lg">▶</span>
                  <span>Video.mp4</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          {caseData?.urgency === 'CRITICAL' && (
            <button
              onClick={() => onAction(caseData.id, 'ESCALATE')}
              className="w-full py-3.5 bg-[#b91c1c] text-white font-bold rounded-full hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm mb-3"
            >
              <AlertTriangle className="w-4 h-4" />
              Escalate to Emergency
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => onAction(caseData?.id ?? '', 'APPROVE')}
              className="flex-1 py-3.5 bg-[#17C4BE] text-white font-bold rounded-full hover:bg-[#13ADA8] transition-colors text-sm"
            >
              Approve &amp; Assign
            </button>
            <button
              onClick={() => onAssign(caseData?.id ?? '')}
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Assign Clinician
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
