'use client'

import { DashboardCase } from '@/data/mock-dashboard'
import { Sparkles, ChevronRight, AlertTriangle } from 'lucide-react'

interface AiWatchlistPanelProps {
  cases: DashboardCase[]
  onSelectCase: (id: string) => void
  onAction: (caseId: string, action: string) => void
}

function ctaForCase(c: DashboardCase): string {
  if (c.urgency === 'CRITICAL') return 'Escalate to ER'
  if (c.riskFactor.toLowerCase().includes('toxin') || c.riskFactor.toLowerCase().includes('theobromine'))
    return 'Authorize Emesis Protocol'
  if (c.riskFactor.toLowerCase().includes('renal') || c.riskFactor.toLowerCase().includes('block'))
    return 'Escalate for Review'
  return 'Notify ER Team'
}

export default function AiWatchlistPanel({ cases, onSelectCase, onAction }: AiWatchlistPanelProps) {
  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#00BFA5]" />
          <h3 className="text-sm font-bold text-slate-900">AI Clinical Watchlist</h3>
        </div>
        <p className="text-sm text-slate-400 text-center py-4">No flagged cases at this time.</p>
      </div>
    )
  }

  const [primary, ...rest] = cases.sort((a, b) => b.urgencyScore - a.urgencyScore)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#00BFA5]" />
        <h3 className="text-sm font-bold text-slate-900">AI Clinical Watchlist</h3>
        <span className="ml-auto text-[10px] font-bold text-[#b91c1c] bg-rose-50 px-2 py-0.5 rounded-full">
          {cases.length} flagged
        </span>
      </div>

      {/* Primary alert */}
      <div
        className="p-5 bg-[#fff8f8] border-b border-rose-100 cursor-pointer hover:bg-rose-50 transition-colors"
        onClick={() => onSelectCase(primary.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#b91c1c]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Highest Risk Detected</p>
              <p className="text-sm font-bold text-slate-900">{primary.patientName} — {primary.issue}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</p>
            <p className="text-lg font-bold text-[#b91c1c]">{primary.urgencyScore}<span className="text-xs text-slate-400">/10</span></p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-white rounded-xl p-3 border border-rose-100 mb-4 italic">
          "{primary.aiJustification}"
        </p>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#b91c1c] bg-rose-100 px-2 py-1 rounded-md flex-1 text-center">
            {primary.riskFactor}
          </span>
          <button
            className="flex-1 py-2 bg-[#b91c1c] text-white text-[11px] font-bold rounded-full hover:bg-red-800 transition-colors text-center"
            onClick={(e) => {
              e.stopPropagation()
              onAction(primary.id, ctaForCase(primary))
            }}
          >
            {ctaForCase(primary)}
          </button>
        </div>
      </div>

      {/* Additional flagged cases */}
      {rest.slice(0, 2).map((c) => (
        <div
          key={c.id}
          className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
          onClick={() => onSelectCase(c.id)}
        >
          <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{c.patientName} — {c.issue}</p>
            <p className="text-[10px] text-slate-500 truncate">{c.riskFactor}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
              {c.urgencyScore}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      ))}
    </div>
  )
}
