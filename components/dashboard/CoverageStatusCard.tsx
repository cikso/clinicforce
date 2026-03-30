'use client'

import { Clock } from 'lucide-react'
import type { CoverageMode } from '@/data/mock-dashboard'

export const MODE_CONFIG: Record<CoverageMode, { label: string; subtitle: string }> = {
  DAYTIME:     { label: 'Daytime',     subtitle: 'Reception support' },
  LUNCH:       { label: 'Lunch break', subtitle: 'Overflow coverage' },
  AFTER_HOURS: { label: 'After hours', subtitle: 'Closed coverage'   },
}

const MODES: CoverageMode[] = ['DAYTIME', 'LUNCH', 'AFTER_HOURS']

interface CoverageStatusCardProps {
  mode:             CoverageMode | null
  activatedAtLabel: string | null
  onModeSelect:     (mode: CoverageMode) => void
  onDeactivate:     () => void
}

export default function CoverageStatusCard({
  mode,
  activatedAtLabel,
  onModeSelect,
  onDeactivate,
}: CoverageStatusCardProps) {
  const isActive = mode !== null

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(15,39,68,0.06)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coverage Control</span>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-slate-100 text-slate-500'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          {isActive ? MODE_CONFIG[mode!].label : 'Standby'}
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* ── Three mode cards ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(m => {
            const cfg        = MODE_CONFIG[m]
            const isSelected = mode === m
            return (
              <button
                key={m}
                onClick={() => onModeSelect(m)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  isSelected
                    ? 'border-[#0891b2] bg-[#0891b2]/[0.06]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className={`text-[11px] font-bold leading-tight ${
                  isSelected ? 'text-[#0891b2]' : 'text-slate-700'
                }`}>
                  {cfg.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{cfg.subtitle}</p>
              </button>
            )
          })}
        </div>

        {/* ── Active since ─────────────────────────────────── */}
        {isActive && activatedAtLabel && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-emerald-700">
              Active since {activatedAtLabel}
            </span>
          </div>
        )}

        {/* ── Deactivate ───────────────────────────────────── */}
        {isActive && (
          <button
            onClick={onDeactivate}
            className="w-full py-2.5 text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
          >
            Deactivate — return to reception
          </button>
        )}

      </div>
    </div>
  )
}
