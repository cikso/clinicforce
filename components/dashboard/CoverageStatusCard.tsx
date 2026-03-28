'use client'

import { useState } from 'react'
import { Radio, Clock, Zap, MapPin, ChevronDown, Power } from 'lucide-react'
import type { CoverageSession, CoverageReason } from '@/data/mock-dashboard'

interface CoverageStatusCardProps {
  session: CoverageSession
  onActivate?: (reason: CoverageReason) => void
  onDeactivate?: () => void
}

const REASON_LABELS: Record<CoverageReason, string> = {
  LUNCH_BREAK:   'Lunch Break',
  MEETING:       'Team Meeting',
  SICK_LEAVE:    'Sick Leave',
  OVERFLOW:      'Overflow Period',
  AFTER_HOURS:   'After Hours',
  MORNING_RUSH:  'Morning Rush',
}

const REASON_COLORS: Record<CoverageReason, string> = {
  LUNCH_BREAK:  'bg-sky-100 text-sky-700',
  MEETING:      'bg-violet-100 text-violet-700',
  SICK_LEAVE:   'bg-rose-100 text-rose-700',
  OVERFLOW:     'bg-amber-100 text-amber-700',
  AFTER_HOURS:  'bg-slate-100 text-slate-600',
  MORNING_RUSH: 'bg-orange-100 text-orange-700',
}

export default function CoverageStatusCard({ session, onActivate, onDeactivate }: CoverageStatusCardProps) {
  const [showActivate, setShowActivate] = useState(false)
  const isActive = session.status === 'ACTIVE'

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isActive
        ? 'bg-[#0f2744] border-[#1a3a5c] shadow-lg'
        : 'bg-white border-slate-100 shadow-sm'
    }`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 ${isActive ? 'border-b border-white/10' : 'border-b border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-sky-300' : 'text-slate-500'}`}>
            Coverage Status
          </span>
        </div>

        {/* Status pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 text-slate-500'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          {isActive ? 'Active' : 'Standby'}
        </div>
      </div>

      <div className="p-5">
        {isActive ? (
          <div className="space-y-4">

            {/* Reason pill */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${REASON_COLORS[session.reason]}`}>
                {REASON_LABELS[session.reason]}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-300/70 uppercase tracking-wider">Active Since</span>
                </div>
                <p className="text-base font-bold text-white">{session.startTime}</p>
                <p className="text-xs text-white/50">{session.durationMinutes}m running</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-300/70 uppercase tracking-wider">Handled</span>
                </div>
                <p className="text-base font-bold text-white">{session.interactionsHandled} calls</p>
                <p className="text-xs text-white/50">this session</p>
              </div>
            </div>

            {/* Clinic line */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="text-xs text-white/50 truncate">{session.clinicName} — {session.location}</span>
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onDeactivate}
                className="flex-1 py-2.5 text-xs font-bold text-white/70 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                End Coverage
              </button>
              <button className="flex-1 py-2.5 text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 rounded-xl transition-colors">
                Extend 30m
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Power className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 leading-snug">
                VetDesk is on standby.<br />
                Activate when your team steps away.
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowActivate(!showActivate)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f5b8a] text-white text-sm font-bold rounded-xl hover:bg-[#0c4a70] transition-colors"
              >
                Activate Coverage
                <ChevronDown className={`w-4 h-4 transition-transform ${showActivate ? 'rotate-180' : ''}`} />
              </button>
              {showActivate && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  {(Object.entries(REASON_LABELS) as [CoverageReason, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { onActivate?.(key); setShowActivate(false) }}
                      className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 font-medium border-b border-slate-50 last:border-0"
                    >
                      {label}
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
