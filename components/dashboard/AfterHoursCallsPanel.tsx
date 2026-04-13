'use client'

import { DashboardCall, CallRisk, CallStatus } from '@/data/mock-dashboard'
import { Asterisk, AlertTriangle, MessageSquare, Play, RotateCcw, Check, Phone } from 'lucide-react'

interface AfterHoursCallsPanelProps {
  calls: DashboardCall[]
  onAction: (callId: string, action: string) => void
}

const riskConfig: Record<CallRisk, { pill: string; icon: React.ReactNode; border: string }> = {
  CRITICAL: {
    pill: 'bg-rose-100 text-[#b91c1c]',
    icon: <Asterisk className="w-5 h-5" />,
    border: 'border-l-[#b91c1c]',
  },
  URGENT: {
    pill: 'bg-rose-100 text-rose-700',
    icon: <AlertTriangle className="w-5 h-5" />,
    border: 'border-l-orange-500',
  },
  GENERAL: {
    pill: 'bg-teal-100 text-teal-700',
    icon: <MessageSquare className="w-5 h-5" />,
    border: 'border-l-teal-500',
  },
}

const statusBadge: Record<CallStatus, { label: string; style: string; icon: React.ReactNode }> = {
  NEW: { label: 'New Call', style: 'bg-slate-100 text-slate-600', icon: <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> },
  REVIEWED: { label: 'Reviewed', style: 'bg-slate-100 text-slate-600', icon: <Check className="w-3 h-3" /> },
  CASE_CREATED: { label: 'Case Created', style: 'bg-emerald-100 text-emerald-700', icon: <Check className="w-3 h-3" /> },
  QUEUED: { label: 'In Queue', style: 'bg-teal-100 text-teal-700', icon: <Check className="w-3 h-3" /> },
  CALLBACK_MARKED: { label: 'Callback Marked', style: 'bg-teal-100 text-teal-700', icon: <Check className="w-3 h-3" /> },
  ESCALATED: { label: 'Escalated', style: 'bg-rose-100 text-[#b91c1c]', icon: <AlertTriangle className="w-3 h-3" /> },
}

function CallActions({ call, onAction }: { call: DashboardCall; onAction: (id: string, action: string) => void }) {
  const isActioned = ['CASE_CREATED', 'QUEUED', 'CALLBACK_MARKED', 'ESCALATED'].includes(call.status)

  if (isActioned) {
    return (
      <button className="px-5 py-2 text-slate-500 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors border border-slate-200">
        View Details
      </button>
    )
  }

  if (call.aiRiskLabel === 'CRITICAL') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onAction(call.id, 'CREATE_CASE')}
          className="px-4 py-2 bg-[#00BFA5] text-white text-xs font-bold rounded-full hover:bg-[#00A98E] transition-colors"
        >
          Create Case
        </button>
        <button
          onClick={() => onAction(call.id, 'ESCALATE')}
          className="px-4 py-2 bg-[#b91c1c] text-white text-xs font-bold rounded-full hover:bg-red-800 transition-colors"
        >
          Escalate
        </button>
      </div>
    )
  }

  if (call.aiRiskLabel === 'URGENT') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onAction(call.id, 'SEND_TO_QUEUE')}
          className="px-4 py-2 bg-[#00BFA5] text-white text-xs font-bold rounded-full hover:bg-[#00A98E] transition-colors"
        >
          Send to Queue
        </button>
        <button
          onClick={() => onAction(call.id, 'MARK_CALLBACK')}
          className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-300 transition-colors"
        >
          Mark Callback
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => onAction(call.id, 'MARK_CALLBACK')}
      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-300 transition-colors"
    >
      Mark Actioned
    </button>
  )
}

export default function AfterHoursCallsPanel({ calls, onAction }: AfterHoursCallsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900">After-Hours Calls</h3>
          <span className="text-xs font-bold text-slate-400">
            {calls.filter((c) => c.status === 'NEW').length} new
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          Sarah AI Online
        </div>
      </div>

      {/* Call cards */}
      <div className="divide-y divide-slate-50">
        {calls.map((call) => {
          const risk = riskConfig[call.aiRiskLabel]
          const badge = statusBadge[call.status]
          const isActioned = ['CASE_CREATED', 'QUEUED', 'CALLBACK_MARKED', 'ESCALATED'].includes(call.status)

          return (
            <div
              key={call.id}
              className={`p-6 border-l-[5px] transition-colors ${risk.border} ${isActioned ? 'opacity-60' : ''}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${call.aiRiskLabel === 'GENERAL' ? 'bg-teal-100 text-teal-600' : 'bg-rose-100 text-[#b91c1c]'} flex items-center justify-center`}>
                    {risk.icon}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{call.callerName}</p>
                    <p className="text-xs text-slate-500">{call.callerPhone} · {call.receivedMinsAgo}m ago</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${risk.pill}`}>
                  {call.aiRiskLabel}
                </span>
              </div>

              {/* Patient */}
              <p className="text-xs font-bold text-[#00BFA5] mb-3">
                🐾 Patient: {call.patientName} ({call.species})
              </p>

              {/* Transcript */}
              <div className="bg-slate-50 rounded-xl p-3.5 text-slate-600 italic text-sm leading-relaxed mb-3">
                {call.transcript}
              </div>

              {/* AI next step */}
              <div className="flex items-start gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-[#00BFA5] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[8px] font-bold">AI</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{call.aiNextStep}</p>
                <span className="ml-auto text-[10px] font-bold text-[#00BFA5] bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                  {call.aiConfidence}% confidence
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${badge.style}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActioned ? 'border border-slate-200 text-slate-300' : 'bg-[#00BFA5] text-white hover:bg-[#00A98E]'}`}>
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                  <CallActions call={call} onAction={onAction} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
