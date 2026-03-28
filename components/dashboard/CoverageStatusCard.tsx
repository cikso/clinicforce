'use client'

import { useState } from 'react'
import { Radio, Clock, MapPin, Zap, ChevronDown } from 'lucide-react'
import type { CoverageSession, CoverageReason } from '@/data/mock-dashboard'

interface CoverageStatusCardProps {
  session: CoverageSession
  onActivate?: (reason: CoverageReason) => void
  onDeactivate?: () => void
}

const REASON_LABELS: Record<CoverageReason, string> = {
  LUNCH_BREAK: 'Lunch Break',
  MEETING: 'Team Meeting',
  SICK_LEAVE: 'Sick Leave',
  OVERFLOW: 'Overflow Period',
  AFTER_HOURS: 'After Hours',
  MORNING_RUSH: 'Morning Rush',
}

const REASON_COLORS: Record<CoverageReason, string> = {
  LUNCH_BREAK: 'bg-sky-100 text-sky-700',
  MEETING: 'bg-violet-100 text-violet-700',
  SICK_LEAVE: 'bg-rose-100 text-rose-700',
  OVERFLOW: 'bg-amber-100 text-amber-700',
  AFTER_HOURS: 'bg-slate-100 text-slate-700',
  MORNING_RUSH: 'bg-orange-100 text-orange-700',
}

export default function CoverageStatusCard({ session, onActivate, onDeactivate }: CoverageStatusCardProps) {
  const [showActivate, setShowActivate] = useState(false)
  const isActive = session.status === 'ACTIVE'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coverage Status</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {isActive ? 'Active' : 'Standby'}
        </div>
      </div>

      {isActive ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${REASON_COLORS[session.reason]}`}>
              {REASON_LABELS[session.reason]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Since</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{session.startTime}</p>
              <p className="text-xs text-slate-500">{session.durationMinutes}m running</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Handled</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{session.interactionsHandled} calls</p>
              <p className="text-xs text-slate-500">this session</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{session.clinicName} — {session.location}</span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onDeactivate}
              className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              End Coverage
            </button>
            <button className="flex-1 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
              Extend 30m
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">VetDesk is on standby. Activate when your team is unavailable.</p>
          <div className="relative">
            <button
              onClick={() => setShowActivate(!showActivate)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#0f5b8a] text-white text-sm font-bold rounded-xl hover:bg-[#0c4a70] transition-colors"
            >
              Activate Coverage
              <ChevronDown className={`w-4 h-4 transition-transform ${showActivate ? 'rotate-180' : ''}`} />
            </button>
            {showActivate && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {(Object.entries(REASON_LABELS) as [CoverageReason, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { onActivate?.(key); setShowActivate(false) }}
                    className="w-full px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 font-medium"
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
  )
}
