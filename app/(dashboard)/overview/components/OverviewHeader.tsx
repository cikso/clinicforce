'use client'

import { useState, useCallback } from 'react'

const MODE_BUTTONS = [
  { label: 'AI Off',         value: 'off' },
  { label: 'Business Hours', value: 'business_hours' },
  { label: 'After Hours',    value: 'after_hours' },
] as const

type CoverageMode = typeof MODE_BUTTONS[number]['value']

const STATUS_TEXT: Record<CoverageMode, { text: string; dot: string; color: string }> = {
  business_hours: { text: 'Active: Stella is covering your phones',       dot: '#22C55E', color: 'text-gray-600' },
  off:            { text: 'AI is turned off — calls go to your phones',   dot: '#EF4444', color: 'text-red-500'  },
  after_hours:    { text: 'Active: Stella is covering after-hours calls', dot: '#22C55E', color: 'text-gray-600' },
}

interface OverviewHeaderProps {
  initialMode: string
  clinicId: string
  todayLabel: string
}

export default function OverviewHeader({ initialMode, clinicId, todayLabel }: OverviewHeaderProps) {
  const [mode, setMode] = useState<CoverageMode>(
    (MODE_BUTTONS.find(b => b.value === initialMode)?.value) ?? 'business_hours'
  )
  const status = STATUS_TEXT[mode]

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
            style={{ backgroundColor: status.dot }}
          />
          <span className={`text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
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
