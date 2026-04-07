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
    <div className="bg-white rounded-lg border border-[#e9ecef] shadow-[0_1px_3px_rgba(0,0,0,0.07)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
        <span className="text-[0.75rem] font-semibold text-[#555] uppercase tracking-widest">
          Coverage Control
        </span>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-[#e6f7ff] text-[#007bff] border-[#b3d9ff]'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-[#007bff]'}`} />
          {isActive ? MODE_CONFIG[mode!].label : 'Standby'}
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* ── Segmented mode control ───────────────────────── */}
        <div className="flex bg-[#f1f3f5] rounded-[20px] p-1 gap-1">
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => onModeSelect(m)}
              className={`flex-1 rounded-[15px] px-3 py-2 text-[0.875rem] font-medium transition-all ${
                mode === m
                  ? 'bg-white shadow-sm text-[#333] font-semibold'
                  : 'text-[#555] hover:text-[#333]'
              }`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* ── Active since ─────────────────────────────────── */}
        {isActive && activatedAtLabel && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
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
            className="w-full py-2.5 text-xs font-semibold text-[#555] bg-white hover:bg-[#f8f9fa] rounded-lg border border-[#e9ecef] transition-colors"
          >
            Deactivate — return to reception
          </button>
        )}

      </div>
    </div>
  )
}
