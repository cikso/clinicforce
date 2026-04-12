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

interface Props {
  clinicId: string
  clinicName: string
  initialMode: string
  activatedAt: string | null
  activatedBy: string | null
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '—'
  }
}

export default function CoverageControl({ clinicId, clinicName, initialMode, activatedAt, activatedBy }: Props) {
  const [mode, setMode] = useState<CoverageMode>(
    (MODE_BUTTONS.find(b => b.value === initialMode)?.value) ?? 'after_hours'
  )
  const [lastActivatedAt, setLastActivatedAt] = useState(activatedAt)
  const [lastActivatedBy, setLastActivatedBy] = useState(activatedBy)
  const [saving, setSaving] = useState(false)
  const isActive = mode !== 'off'

  const handleModeClick = useCallback(async (newMode: CoverageMode) => {
    const prevMode = mode
    const prevAt = lastActivatedAt
    const prevBy = lastActivatedBy

    setMode(newMode)
    setLastActivatedAt(new Date().toISOString())
    setLastActivatedBy('Platform Admin')
    setSaving(true)

    try {
      const supabase = createClient()
      await supabase
        .from('clinics')
        .update({
          coverage_mode: newMode,
          coverage_mode_activated_at: new Date().toISOString(),
          coverage_mode_activated_by: 'Platform Admin',
        })
        .eq('id', clinicId)
    } catch {
      setMode(prevMode)
      setLastActivatedAt(prevAt)
      setLastActivatedBy(prevBy)
    } finally {
      setSaving(false)
    }
  }, [mode, lastActivatedAt, lastActivatedBy, clinicId])

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)] mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
            Coverage Control
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Override AI coverage mode for {clinicName}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
          style={{
            backgroundColor: isActive ? '#ECFDF5' : '#F3F4F6',
            color: isActive ? '#059669' : '#6B7280',
            border: `1px solid ${isActive ? 'rgba(5,150,105,0.2)' : '#E5E7EB'}`,
          }}
        >
          {isActive && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#059669]" />
            </span>
          )}
          {isActive ? 'Active' : 'Off'}
        </span>
      </div>

      {/* Mode buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {MODE_BUTTONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleModeClick(value)}
            disabled={saving}
            className={`text-[12px] font-semibold rounded-lg px-4 py-2 border transition-all ${
              mode === value
                ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-primary)] hover:border-[var(--text-tertiary)]'
            } ${saving ? 'opacity-60 cursor-wait' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
            Last Changed
          </span>
          <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
            {formatTime(lastActivatedAt)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
            Changed By
          </span>
          <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">
            {lastActivatedBy || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
