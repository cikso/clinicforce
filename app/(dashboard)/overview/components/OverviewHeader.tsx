'use client'

import { useState, useCallback } from 'react'

const MODE_BUTTONS = [
  { label: 'AI Off',       value: 'off' },
  { label: 'Overflow',     value: 'overflow' },
  { label: 'Lunch Cover',  value: 'lunch_cover' },
  { label: 'After Hours',    value: 'after_hours' },
  { label: 'Emergency Only', value: 'emergency_only' },
  { label: 'Weekend',        value: 'weekend' },
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
      const res = await fetch(`/api/clinic/${clinicId}/mode`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      })
      if (!res.ok) throw new Error('Failed to update mode')
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
          <span
            className="inline-block w-2.5 h-2.5 rounded-full transition-colors duration-300"
            style={{ backgroundColor: isActive ? '#22C55E' : '#EF4444' }}
          />
          <span className={`text-xs font-medium ${isActive ? 'text-gray-600' : 'text-red-500'}`}>
            {isActive ? 'Active: Sarah is covering your phones' : 'Off: Sarah is not covering your phones'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {MODE_BUTTONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleModeClick(value)}
              className={
                mode === value
                  ? 'bg-teal-600 border border-teal-600 text-white text-xs font-bold rounded px-3 py-1'
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
