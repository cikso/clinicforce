'use client'

import { CheckCircle, Phone, Calendar, AlertTriangle, Radio, Clock } from 'lucide-react'
import type { HandoverItem, HandoverType } from '@/data/mock-dashboard'

interface HandoverSummaryProps {
  items: HandoverItem[]
  sessionStart: string
  sessionReason: string
}

const TYPE_CONFIG: Record<HandoverType, { icon: React.ElementType; color: string; bg: string }> = {
  escalation: { icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50' },
  callback:   { icon: Phone,         color: 'text-amber-500',  bg: 'bg-amber-50' },
  booking:    { icon: Calendar,      color: 'text-sky-500',    bg: 'bg-sky-50' },
  coverage:   { icon: Radio,         color: 'text-emerald-500',bg: 'bg-emerald-50' },
  handled:    { icon: CheckCircle,   color: 'text-slate-400',  bg: 'bg-slate-50' },
}

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function HandoverSummary({ items, sessionStart, sessionReason }: HandoverSummaryProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
      {/* Lighter header — this is a secondary panel */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Handover Log</span>
        </div>
        <p className="text-[10px] text-slate-400">{sessionReason} · {sessionStart}</p>
      </div>

      <div className="px-4 py-3 max-h-60 overflow-y-auto space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-slate-400 py-3 text-center">No activity logged yet</p>
        )}
        {items.slice(0, 20).map((item) => {
          const config = TYPE_CONFIG[item.type]
          const Icon = config.icon

          return (
            <div key={item.id} className="flex items-start gap-2.5">
              <div className={`w-5 h-5 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-2.5 h-2.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{relativeTime(item.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
