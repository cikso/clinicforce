'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, SubmitButton, ErrorBanner, BackButton, Toggle,
  stepHeading, stepSubheading, inputBase,
} from '../../_components'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type DayHours = { open: boolean; start: string; end: string }
type Hours = Record<string, DayHours>

const DEFAULT_HOURS: Hours = {
  Monday:    { open: true,  start: '08:00', end: '18:00' },
  Tuesday:   { open: true,  start: '08:00', end: '18:00' },
  Wednesday: { open: true,  start: '08:00', end: '18:00' },
  Thursday:  { open: true,  start: '08:00', end: '18:00' },
  Friday:    { open: true,  start: '08:00', end: '18:00' },
  Saturday:  { open: true,  start: '09:00', end: '13:00' },
  Sunday:    { open: false, start: '09:00', end: '13:00' },
}

export default function HoursPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [hours, setHours] = useState<Hours>(DEFAULT_HOURS)

  function setDay(day: string, patch: Partial<DayHours>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'hours', data: { business_hours: hours } }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save.'); return }
      router.push('/onboarding/call-handling')
    })
  }

  return (
    <StepCard>
      <BackButton href="/onboarding/clinic-details" />
      <p style={stepSubheading}>Step 2 of 3</p>
      <h1 style={stepHeading}>Opening hours</h1>
      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.925rem', color: '#6B6B6B', marginBottom: '2rem', lineHeight: 1.5 }}>
        Your AI receptionist uses these hours to tell callers when you&apos;re open and when to expect a callback.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Day rows */}
        <div
          style={{
            border: '1px solid #E8E4DE',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          {DAYS.map((day, i) => {
            const h = hours[day]
            return (
              <div
                key={day}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderBottom: i < DAYS.length - 1 ? '1px solid #F0EDE8' : 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* Toggle */}
                <Toggle
                  checked={h.open}
                  onChange={(v) => setDay(day, { open: v })}
                />

                {/* Day name */}
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: h.open ? '#1A1A1A' : '#B0B0B0',
                    width: 90,
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                >
                  {day}
                </span>

                {/* Time pickers or Closed label */}
                {h.open ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                    <Field label="">
                      <input
                        type="time"
                        value={h.start}
                        onChange={(e) => setDay(day, { start: e.target.value })}
                        style={{
                          ...inputBase,
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          width: 120,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#17C4BE')}
                        onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                      />
                    </Field>
                    <span style={{ fontFamily: "'DM Sans'", fontSize: '0.82rem', color: '#9B9B9B' }}>to</span>
                    <Field label="">
                      <input
                        type="time"
                        value={h.end}
                        onChange={(e) => setDay(day, { end: e.target.value })}
                        style={{
                          ...inputBase,
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          width: 120,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#17C4BE')}
                        onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                      />
                    </Field>
                  </div>
                ) : (
                  <span
                    style={{
                      fontFamily: "'DM Sans'",
                      fontSize: '0.82rem',
                      color: '#B0B0B0',
                      flex: 1,
                    }}
                  >
                    Closed
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} />
      </form>
    </StepCard>
  )
}
