'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/app/components/ui/Toast'

/**
 * 3-mode AI coverage toggle. Lives at the top of the single-clinic overview.
 * Calls PATCH /api/clinic/:clinicId/mode; rolls back local state if the API
 * rejects the change. Keeps the modes intentionally simple (off / business
 * hours / after hours) — the richer 6-mode switcher remains on the admin
 * per-clinic page for platform owners.
 */

const MODE_BUTTONS = [
  { label: 'AI off',         value: 'off' },
  { label: 'Business hours', value: 'business_hours' },
  { label: 'After hours',    value: 'after_hours' },
] as const

type CoverageMode = typeof MODE_BUTTONS[number]['value']

const STATUS_TEXT: Record<CoverageMode, { text: string; tone: 'brand' | 'error' }> = {
  business_hours: { text: 'Active · Stella is covering your phones',        tone: 'brand' },
  after_hours:    { text: 'Active · Stella is covering after-hours calls',  tone: 'brand' },
  off:            { text: 'AI is off · calls go straight to your phones',   tone: 'error' },
}

interface OverviewHeaderProps {
  initialMode: string
  clinicId: string
}

export default function OverviewHeader({ initialMode, clinicId }: OverviewHeaderProps) {
  const [mode, setMode] = useState<CoverageMode>(
    (MODE_BUTTONS.find((b) => b.value === initialMode)?.value) ?? 'business_hours',
  )
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const status = STATUS_TEXT[mode]

  const handleModeClick = useCallback(
    async (newMode: CoverageMode) => {
      if (newMode === mode || saving) return
      const prev = mode
      setMode(newMode)
      setSaving(true)
      try {
        const res = await fetch(`/api/clinic/${clinicId}/mode`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: newMode }),
        })
        if (!res.ok) throw new Error('Failed to update mode')
        toast({ type: 'success', title: `Coverage set to ${MODE_BUTTONS.find((b) => b.value === newMode)?.label}` })
      } catch {
        setMode(prev)
        toast({ type: 'error', title: 'Could not update coverage mode' })
      } finally {
        setSaving(false)
      }
    },
    [mode, saving, clinicId, toast],
  )

  return (
    <div
      className="flex items-center justify-between gap-4 flex-wrap mb-5 rounded-xl bg-[var(--bg-primary)] px-5 py-3 shadow-[var(--shadow-card)] cf-enter"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Status */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`relative flex h-2.5 w-2.5 shrink-0 transition-colors duration-300 rounded-full ${
            status.tone === 'brand' ? 'bg-[var(--brand)]' : 'bg-[var(--error)]'
          }`}
          aria-hidden
        >
          {status.tone === 'brand' && (
            <span className="absolute inset-0 rounded-full bg-[var(--brand)] opacity-60 animate-ping" />
          )}
        </span>
        <span
          className={`text-[12.5px] font-medium truncate ${
            status.tone === 'brand' ? 'text-[var(--text-secondary)]' : 'text-[var(--error)]'
          }`}
        >
          {status.text}
        </span>
      </div>

      {/* Mode buttons */}
      <div role="tablist" aria-label="AI coverage mode" className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border-subtle)] shrink-0">
        {MODE_BUTTONS.map(({ label, value }) => {
          const active = mode === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={saving}
              onClick={() => handleModeClick(value)}
              className={`h-8 px-3 rounded-md text-[12.5px] font-semibold transition-colors disabled:cursor-wait ${
                active
                  ? value === 'off'
                    ? 'bg-[var(--error)] text-white shadow-sm'
                    : 'bg-[var(--brand)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
