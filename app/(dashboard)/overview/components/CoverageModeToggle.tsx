'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/app/components/ui/Toast'

/**
 * Compact 3-button AI coverage toggle (AI off / Business hours / After hours).
 * Designed to sit inside the Command Centre "Stella is standing by" card.
 *
 * Same semantics as the old full-width OverviewHeader — PATCHes
 * `/api/clinic/:clinicId/mode`, optimistic update, rolls back on failure.
 */

const MODE_BUTTONS = [
  { label: 'AI off',         value: 'off' },
  { label: 'Business hours', value: 'business_hours' },
  { label: 'After hours',    value: 'after_hours' },
] as const

type CoverageMode = typeof MODE_BUTTONS[number]['value']

interface Props {
  initialMode: string
  clinicId: string
  onModeChange?: (mode: CoverageMode) => void
}

export default function CoverageModeToggle({ initialMode, clinicId, onModeChange }: Props) {
  const [mode, setMode] = useState<CoverageMode>(
    (MODE_BUTTONS.find((b) => b.value === initialMode)?.value) ?? 'business_hours',
  )
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleModeClick = useCallback(
    async (newMode: CoverageMode) => {
      if (newMode === mode || saving) return
      const prev = mode
      setMode(newMode)
      onModeChange?.(newMode)
      setSaving(true)
      try {
        const res = await fetch(`/api/clinic/${clinicId}/mode`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: newMode }),
        })
        if (!res.ok) throw new Error('Failed to update mode')
        toast({
          type: 'success',
          title: `Coverage set to ${MODE_BUTTONS.find((b) => b.value === newMode)?.label}`,
        })
      } catch {
        setMode(prev)
        onModeChange?.(prev)
        toast({ type: 'error', title: 'Could not update coverage mode' })
      } finally {
        setSaving(false)
      }
    },
    [mode, saving, clinicId, toast, onModeChange],
  )

  return (
    <div
      role="tablist"
      aria-label="AI coverage mode"
      className="cf-cov-toggle"
    >
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
            className={`cf-cov-btn ${active ? 'cf-cov-btn-active' : ''} ${
              active && value === 'off' ? 'cf-cov-btn-off' : ''
            }`}
          >
            {label}
          </button>
        )
      })}
      <style>{`
        .cf-cov-toggle {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 3px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          flex-shrink: 0;
        }
        .cf-cov-btn {
          height: 30px;
          padding: 0 12px;
          border: none;
          background: transparent;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background-color 140ms ease, color 140ms ease;
          white-space: nowrap;
        }
        .cf-cov-btn:hover:not(:disabled):not(.cf-cov-btn-active) {
          color: var(--text-primary);
        }
        .cf-cov-btn:disabled { cursor: wait; }
        .cf-cov-btn-active {
          background: var(--brand);
          color: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        .cf-cov-btn-off.cf-cov-btn-active {
          background: var(--error);
        }
      `}</style>
    </div>
  )
}
