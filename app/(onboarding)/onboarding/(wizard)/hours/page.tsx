'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, SubmitButton, ErrorBanner, BackButton, Toggle,
  stepHeading, stepSubheading, inputBase, StepDescription,
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
      <p style={stepSubheading}>Step 2 of 4</p>
      <h1 style={stepHeading}>Opening hours</h1>
      <StepDescription>
        Your AI receptionist uses these hours to tell callers when you&apos;re open and when to expect a callback.
      </StepDescription>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Day rows */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: '24px',
            backgroundColor: 'var(--bg-primary)',
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
                  gap: '16px',
                  padding: '14px 16px',
                  borderBottom: i < DAYS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <Toggle
                  checked={h.open}
                  onChange={(v) => setDay(day, { open: v })}
                />

                <span
                  style={{
                    fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: h.open ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    width: 90,
                    flexShrink: 0,
                    transition: 'color 180ms ease',
                  }}
                >
                  {day}
                </span>

                {h.open ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <input
                      type="time"
                      aria-label={`${day} opening time`}
                      value={h.start}
                      onChange={(e) => setDay(day, { start: e.target.value })}
                      style={{
                        ...inputBase,
                        padding: '8px 12px',
                        fontSize: '13.5px',
                        width: 120,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--brand)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 214, 143, 0.18)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                        fontSize: '12.5px',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      to
                    </span>
                    <input
                      type="time"
                      aria-label={`${day} closing time`}
                      value={h.end}
                      onChange={(e) => setDay(day, { end: e.target.value })}
                      style={{
                        ...inputBase,
                        padding: '8px 12px',
                        fontSize: '13.5px',
                        width: 120,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--brand)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 214, 143, 0.18)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                      fontSize: '12.5px',
                      color: 'var(--text-tertiary)',
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
