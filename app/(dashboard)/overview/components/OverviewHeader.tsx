'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const MODE_BUTTONS = [
  { label: 'AI Off',       value: 'off' },
  { label: 'Overflow',     value: 'overflow' },
  { label: 'Lunch Cover',  value: 'lunch_cover' },
  { label: 'After Hours',  value: 'after_hours' },
  { label: 'Weekend',      value: 'weekend' },
] as const

type CoverageMode = typeof MODE_BUTTONS[number]['value']

interface OverviewHeaderProps {
  initialMode: string
  clinicId: string
  todayLabel: string
}

export default function OverviewHeader({ initialMode, clinicId, todayLabel }: OverviewHeaderProps) {
  const [mode, setMode] = useState<CoverageMode>(
    (MODE_BUTTONS.find(b => b.value === initialMode)?.value) ?? 'after_hours'
  )
  const isActive = mode !== 'off'

  const handleModeClick = useCallback(async (newMode: CoverageMode) => {
    const prevMode = mode
    setMode(newMode)

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
      setMode(prevMode)
    }
  }, [mode, clinicId])

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-3 mb-4 flex items-center justify-between">
      {/* Title */}
      <h1 className="text-lg font-bold text-gray-900 border-r border-gray-200 pr-5 mr-5">Overview</h1>
      {/* Status + Mode buttons */}
      <div className="flex items-center gap-4 mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#2dd4bf' }} />
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#3e3e3c' }} />
          <span className="text-xs font-medium text-gray-600">
            {isActive ? 'Active: Sarah is covering your phones' : 'Standby: Sarah is on standby'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {MODE_BUTTONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleModeClick(value)}
              className={
                mode === value
                  ? 'bg-blue-600 border border-blue-600 text-white text-xs font-bold rounded px-3 py-1'
                  : 'bg-white border border-gray-300 rounded text-xs font-medium text-gray-800 px-3 py-1 hover:bg-gray-50 transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{todayLabel}</span>
    </div>
  )
}
