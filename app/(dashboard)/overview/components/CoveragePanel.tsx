'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MODE_BUTTONS = [
  { label: 'AI Off',         value: 'off' },
  { label: 'Overflow',       value: 'overflow' },
  { label: 'Lunch Cover',    value: 'lunch_cover' },
  { label: 'After Hours',    value: 'after_hours' },
  { label: 'Emergency Only', value: 'emergency_only' },
  { label: 'Weekend',        value: 'weekend' },
] as const

export type CoverageMode = typeof MODE_BUTTONS[number]['value']

interface CoveragePanelProps {
  initialMode: CoverageMode
  initialStats: {
    activeSince: string | null
    activatedBy: string | null
    callsCovered: number
  }
  clinicId: string
}

export default function CoveragePanel({ initialMode, initialStats, clinicId }: CoveragePanelProps) {
  const [mode, setMode] = useState<CoverageMode>(initialMode)
  const [stats, setStats] = useState(initialStats)
  const isActive = mode !== 'off'

  const handleModeClick = useCallback(async (newMode: CoverageMode) => {
    const prevMode = mode
    setMode(newMode)

    // Optimistic: reset stats if switching from off
    if (prevMode === 'off' && newMode !== 'off') {
      setStats({ activeSince: new Date().toISOString(), activatedBy: 'You', callsCovered: 0 })
    }

    try {
      const supabase = createClient()
      await supabase
        .from('clinics')
        .update({
          coverage_mode: newMode,
          coverage_mode_activated_at: new Date().toISOString(),
          coverage_mode_activated_by: 'Manual',
        })
        .eq('id', clinicId)
    } catch {
      setMode(prevMode) // rollback
    }
  }, [mode, clinicId])

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    } catch { return '—' }
  }

  return (
    <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#0A2540]">Coverage Control</h3>
          <p className="text-[11px] text-[#8A94A6] mt-0.5">
            {isActive ? 'Sarah is covering your phones' : 'Sarah is on standby'}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border',
            isActive
              ? 'bg-[#EAF7F1] text-[#0A6B4F] border-[#B3DFD0]'
              : 'bg-[#F4F6F9] text-[#8A94A6] border-[#DDE1E7]',
          )}
        >
          {isActive && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A6B4F] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0A6B4F]" />
            </span>
          )}
          {isActive ? 'Active' : 'Standby'}
        </span>
      </div>

      {/* Mode buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MODE_BUTTONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleModeClick(value)}
            className={cn(
              'text-[12px] font-semibold rounded-md transition-all',
              mode === value
                ? 'bg-[#1558D6] text-white border-[#1558D6]'
                : 'bg-[#F4F6F9] text-[#637381] border-[#DDE1E7] hover:bg-[#EBEEF3]',
            )}
            style={{
              padding: '6px 14px',
              border: `1.5px solid ${mode === value ? '#1558D6' : '#DDE1E7'}`,
              borderRadius: 6,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid #F0F2F5' }}>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6] mb-1">Active Since</p>
          <p className="text-[14px] font-semibold text-[#0A2540]">{formatTime(stats.activeSince)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6] mb-1">Activated By</p>
          <p className="text-[14px] font-semibold text-[#0A2540]">{stats.activatedBy || '—'}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6] mb-1">Calls Covered</p>
          <p className="text-[14px] font-semibold text-[#0A2540]">{stats.callsCovered}</p>
        </div>
      </div>
    </div>
  )
}
