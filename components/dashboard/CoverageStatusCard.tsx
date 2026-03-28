'use client'

import { useState } from 'react'
import { Clock, Phone, ChevronDown, Power, CheckCircle } from 'lucide-react'
import type { CoverageSession, CoverageReason } from '@/data/mock-dashboard'

interface CoverageStatusCardProps {
  session: CoverageSession
  onActivate?: (reason: CoverageReason) => void
  onDeactivate?: () => void
}

const REASON_OPTIONS: { key: CoverageReason; label: string; description: string }[] = [
  { key: 'LUNCH_BREAK',  label: 'Lunch Break',    description: 'Team on lunch' },
  { key: 'MEETING',      label: 'Team Meeting',    description: 'Internal meeting' },
  { key: 'MORNING_RUSH', label: 'Morning Rush',    description: 'Overflow cover' },
  { key: 'SICK_LEAVE',   label: 'Sick Leave',      description: 'Staff unavailable' },
  { key: 'AFTER_HOURS',  label: 'After Hours',     description: 'Clinic closed' },
  { key: 'OVERFLOW',     label: 'Overflow',        description: 'High call volume' },
]

const REASON_LABELS: Record<CoverageReason, string> = {
  LUNCH_BREAK: 'Lunch Break', MEETING: 'Team Meeting', SICK_LEAVE: 'Sick Leave',
  OVERFLOW: 'Overflow', AFTER_HOURS: 'After Hours', MORNING_RUSH: 'Morning Rush',
}

export default function CoverageStatusCard({ session, onActivate, onDeactivate }: CoverageStatusCardProps) {
  const [showReasons, setShowReasons] = useState(false)
  const isActive = session.status === 'ACTIVE'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coverage Control</span>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
          isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          {isActive ? 'Active' : 'Standby'}
        </div>
      </div>

      <div className="p-5">
        {isActive ? (
          <div className="space-y-4">

            {/* Reason */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Coverage Reason</p>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-slate-800">{REASON_LABELS[session.reason]}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active since</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{session.startTime}</p>
                {session.durationMinutes > 0 && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{session.durationMinutes}m running</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Handled</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{session.interactionsHandled}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">calls this session</p>
              </div>
            </div>

            {/* End coverage */}
            <button
              onClick={onDeactivate}
              className="w-full py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              End Coverage
            </button>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Standby message */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Power className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">VetDesk is on standby</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Activate when your team steps away from reception.</p>
              </div>
            </div>

            {/* Activate dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowReasons(!showReasons)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f5b8a] text-white text-sm font-bold rounded-xl hover:bg-[#0c4a70] transition-colors shadow-sm"
              >
                Activate Coverage
                <ChevronDown className={`w-4 h-4 transition-transform ${showReasons ? 'rotate-180' : ''}`} />
              </button>
              {showReasons && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  {REASON_OPTIONS.map(({ key, label, description }) => (
                    <button
                      key={key}
                      onClick={() => { onActivate?.(key); setShowReasons(false) }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group"
                    >
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#0f5b8a]">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
