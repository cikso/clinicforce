'use client'

import { useState } from 'react'
import {
  Play, AlertTriangle, MessageSquare, Activity,
  Clock, ChevronRight, Check, RotateCcw, Sparkles, Stethoscope, Asterisk
} from 'lucide-react'
import { mockCalls } from '@/data/mock-calls'
import { mockStats } from '@/data/mock-stats'
import type { Call } from '@/lib/types'
import { formatRelative } from '@/lib/formatters'

export default function CallsClient() {
  const [tab, setTab] = useState<'live' | 'archived'>('live')

  const liveCalls     = mockCalls.filter((c) => c.status !== 'ACTIONED')
  const archivedCalls = mockCalls.filter((c) => c.status === 'ACTIONED')
  const displayCalls  = tab === 'live' ? liveCalls : archivedCalls

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">After-Hours Calls</h1>
          <p className="text-slate-600 text-lg mt-2 max-w-2xl">
            Review and manage emergency inquiries. AI-analyzed transcripts prioritized by urgency.
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-full p-1 shadow-inner border border-slate-200">
          <button
            onClick={() => setTab('live')}
            className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${tab === 'live' ? 'text-[#00D68F] bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Queue ({liveCalls.length})
          </button>
          <button
            onClick={() => setTab('archived')}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${tab === 'archived' ? 'text-[#00D68F] bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Archived
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Call Cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {displayCalls.map((call) => (
            <CallCard key={call.id} call={call} />
          ))}
          {displayCalls.length === 0 && (
            <div className="bg-white rounded-[2rem] p-12 text-center text-slate-400 border border-slate-200">
              No calls in this view.
            </div>
          )}
        </div>

        {/* Right: Widgets */}
        <div className="flex flex-col gap-6">
          {/* Live Session Widget */}
          <div className="bg-[#00D68F] rounded-[2rem] p-6 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white/90" />
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                LIVE SESSION
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-1">Queue Response Rate</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-6xl font-bold tracking-tighter">{mockStats.queueResponseRate}</span>
                <span className="text-2xl font-medium text-white/80">%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-white rounded-full" style={{ width: `${mockStats.queueResponseRate}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-white/80 uppercase tracking-wider">
                <span>AVG WAIT: 1.4M</span>
                <span>CALLS: 12/HR</span>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          </div>

          {/* Priority Trends */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#00D68F]" />
              <h3 className="text-lg font-bold text-slate-900">Priority Trends</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">TOP URGENCY FACTOR</p>
                    <p className="text-sm font-bold text-slate-900">Toxin Ingestion (40%)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="h-px bg-slate-100 w-full"></div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">PEAK VOLUME</p>
                    <p className="text-sm font-bold text-slate-900">01:00 AM – 02:30 AM</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Voice AI Status */}
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Voice AI Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-sm font-bold text-[#00D68F]">Transcription Online</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Last checked 12s ago. All cloud processing pipelines executing within 250ms latency.
            </p>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 border-[16px] border-slate-100 rounded-full opacity-50"></div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 border-[16px] border-slate-100 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CallCard({ call }: { call: Call }) {
  const isCritical = call.urgency === 'CRITICAL'
  const isUrgent   = call.urgency === 'URGENT'

  const borderColor = isCritical || isUrgent ? 'border-l-[#e11d48]' : 'border-l-teal-500'
  const badgeBg     = isCritical || isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'
  const iconBg      = isCritical || isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-600'
  const badgeLabel  = isCritical ? 'CRITICAL' : isUrgent ? 'URGENT' : 'ROUTINE'

  return (
    <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 border-l-[6px] ${borderColor} flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            {isCritical ? <Asterisk className="w-6 h-6" /> : isUrgent ? <AlertTriangle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{call.callerName}</h3>
            <p className="text-sm text-slate-500">{call.callerPhone} • {formatRelative(call.createdAt)}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${badgeBg}`}>
          {badgeLabel}
        </span>
      </div>

      {call.petName && call.petName !== '—' && (
        <div className="flex items-center gap-2 text-[#00D68F] font-bold text-sm">
          <span>🐾</span>
          Patient: {call.petName} ({call.petSpecies})
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-4 text-slate-600 italic text-sm leading-relaxed">
        {call.aiDetail || call.summary}
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3 flex-1">
          <StatusPill call={call} />
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${isCritical ? 'bg-[#00D68F] w-1/3' : isUrgent ? 'bg-slate-300 w-0' : 'bg-slate-300 w-1/2'}`}></div>
          </div>
          <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isCritical ? 'bg-[#00D68F] text-white hover:bg-[#00B578] shadow-sm' : 'border-2 border-slate-200 text-slate-400 hover:border-slate-300'
          }`}>
            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
          </button>
        </div>
        <div className="ml-6">
          <ActionButton call={call} />
        </div>
      </div>
    </div>
  )
}

function StatusPill({ call }: { call: Call }) {
  if (call.urgency === 'CRITICAL') {
    return (
      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
        Critical
      </span>
    )
  }
  if (call.status === 'UNREAD') {
    return (
      <span className="flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-full">
        <RotateCcw className="w-3.5 h-3.5" />
        Needs Action
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 bg-slate-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full">
      <Check className="w-3.5 h-3.5" />
      Actioned
    </span>
  )
}

function ActionButton({ call }: { call: Call }) {
  if (call.urgency === 'CRITICAL') {
    return (
      <button className="px-6 py-2.5 bg-[#00D68F] text-white text-sm font-bold rounded-full hover:bg-[#00B578] transition-colors shadow-sm">
        Create Case
      </button>
    )
  }
  if (call.status === 'UNREAD') {
    return (
      <button className="px-6 py-2.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-full hover:bg-slate-300 transition-colors">
        Mark Actioned
      </button>
    )
  }
  return (
    <button className="px-6 py-2.5 text-slate-700 text-sm font-bold rounded-full hover:bg-slate-50 transition-colors">
      View Details
    </button>
  )
}
