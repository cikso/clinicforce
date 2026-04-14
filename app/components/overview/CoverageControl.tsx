'use client'

import { useState, useCallback } from 'react'
import { useClinic } from '@/context/ClinicContext'
import { createClient } from '@/lib/supabase/client'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import Toggle from '@/app/components/ui/Toggle'
import StatusDot from '@/app/components/ui/StatusDot'
import { cn } from '@/lib/utils'

const MODE_PILLS = [
  { label: 'AI Off',         value: 'OFF' },
  { label: 'Overflow',       value: 'DAYTIME' },
  { label: 'Lunch Cover',    value: 'LUNCH' },
  { label: 'After Hours',    value: 'AFTER_HOURS' },
  { label: 'Emergency Only', value: 'EMERGENCY_ONLY' },
  { label: 'Weekend',        value: 'WEEKEND' },
] as const

export type CoverageMode = typeof MODE_PILLS[number]['value']

interface CallHandlingPrefs {
  emergency_triage?: boolean
  appointment_capture?: boolean
  transfers?: boolean
  followup_queue?: boolean
}

interface CoverageControlProps {
  initialMode: CoverageMode | null
  initialActiveSince: string | null
  initialActivatedBy: string | null
  initialCallsCovered: number
  initialPrefs: CallHandlingPrefs
  clinicId: string
}

export default function CoverageControl({
  initialMode,
  initialActiveSince,
  initialActivatedBy,
  initialCallsCovered,
  initialPrefs,
  clinicId,
}: CoverageControlProps) {
  const { activeClinicId } = useClinic()
  const effectiveClinicId = activeClinicId || clinicId

  const [mode, setMode] = useState<CoverageMode | null>(initialMode)
  const [prefs, setPrefs] = useState<CallHandlingPrefs>(initialPrefs)
  const [activeSince] = useState(initialActiveSince)

  const isActive = mode !== null && mode !== 'OFF'

  const handleModeSelect = useCallback(async (newMode: CoverageMode) => {
    setMode(newMode)
    const modeToSend = newMode === 'OFF' ? null : newMode
    try {
      await fetch(`/api/clinic/${effectiveClinicId}/mode`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: modeToSend }),
      })
    } catch { /* ignore */ }
  }, [effectiveClinicId])

  const handleTogglePref = useCallback(async (key: keyof CallHandlingPrefs, checked: boolean) => {
    const updated = { ...prefs, [key]: checked }
    setPrefs(updated)
    try {
      const supabase = createClient()
      await supabase
        .from('clinics')
        .update({ call_handling_prefs: updated })
        .eq('id', effectiveClinicId)
    } catch { /* ignore */ }
  }, [prefs, effectiveClinicId])

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '—' }
  }

  return (
    <Card
      header={{
        title: 'Coverage Control',
        subtitle: isActive ? 'Stella is covering your phones' : 'Stella is on standby',
        action: (
          <div className="flex items-center gap-2">
            <StatusDot variant={isActive ? 'active' : 'standby'} />
            <Badge variant={isActive ? 'routine' : 'neutral'}>
              {isActive ? 'Active' : 'Standby'}
            </Badge>
          </div>
        ),
      }}
    >
      <div className="space-y-5">
        {/* Mode Pills */}
        <div className="flex flex-wrap gap-2">
          {MODE_PILLS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleModeSelect(value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                mode === value
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Coverage Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">Active Since</p>
            <p className="text-[14px] font-semibold text-[var(--text-primary)] font-mono-data mt-1">
              {formatTime(activeSince)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">Activated By</p>
            <p className="text-[14px] font-semibold text-[var(--text-primary)] mt-1">
              {initialActivatedBy || '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">Calls Covered</p>
            <p className="text-[14px] font-semibold text-[var(--text-primary)] font-mono-data mt-1">
              {initialCallsCovered}
            </p>
          </div>
        </div>

        {/* Active Rules */}
        <div>
          <p className="text-[12px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium mb-3">Active Rules</p>
          <div className="space-y-2.5">
            {[
              { key: 'emergency_triage' as const, label: 'Emergency Triage' },
              { key: 'appointment_capture' as const, label: 'Appointment Capture' },
              { key: 'transfers' as const, label: 'Call Transfers' },
              { key: 'followup_queue' as const, label: 'Follow-up Queue' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-[13px] text-[var(--text-primary)]">{label}</span>
                <Toggle
                  checked={prefs[key] ?? false}
                  onChange={(checked) => handleTogglePref(key, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
