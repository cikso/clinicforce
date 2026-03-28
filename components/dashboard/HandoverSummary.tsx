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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-900">Handover Summary</span>
        </div>
        <p className="text-xs text-slate-400">{sessionReason} · Started {sessionStart}</p>
      </div>

      <div className="p-4 max-h-72 overflow-y-auto space-y-2">
        {items.slice(0, 20).map((item) => {
          const config = TYPE_CONFIG[item.type]
          const Icon = config.icon

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-3 h-3 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-relaxed">{item.message}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{relativeTime(item.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
