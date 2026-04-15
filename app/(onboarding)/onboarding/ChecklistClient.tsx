'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

// ── Step configuration ────────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'clinic_profile',
    label: 'Complete Clinic Profile',
    description: 'Add your clinic name, address, phone number, and contact details.',
    cta: 'Mark as Done',
  },
  {
    key: 'staff_added',
    label: 'Add Your Team',
    description: 'Invite staff members so your team can access the dashboard and manage calls.',
    cta: 'Mark as Done',
  },
  {
    key: 'voice_agent_configured',
    label: 'Configure Voice Agent',
    description: 'Connect your ElevenLabs agent ID and assign your Twilio phone number.',
    cta: 'Mark as Done',
  },
  {
    key: 'phone_forwarding_set',
    label: 'Set Up Phone Forwarding',
    description: 'Forward your clinic\'s number to the AI receptionist line to start routing calls.',
    cta: 'Mark as Done',
  },
  {
    key: 'test_call_done',
    label: 'Make a Test Call',
    description: 'Call your clinic number to verify the AI receptionist answers and responds correctly.',
    cta: 'Mark as Done',
  },
  {
    key: 'go_live',
    label: 'Go Live',
    description: 'All systems are ready. Activate your AI receptionist to start taking real patient calls.',
    cta: 'Activate & Go Live',
  },
] as const

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StepRow {
  step: string
  completed: boolean
  completed_at: string | null
}

interface Props {
  initialSteps: StepRow[]
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg:           '#0A1628',
  surface:      '#0F1E30',
  surfaceHover: '#132336',
  border:       'rgba(255,255,255,0.07)',
  borderActive: 'rgba(0,212,170,0.35)',
  teal:         '#00D4AA',
  tealDim:      'rgba(0,212,170,0.15)',
  tealDimBorder:'rgba(0,212,170,0.25)',
  text:         '#EEF2F7',
  muted:        '#6B85A0',
  faint:        '#3A4F63',
  danger:       '#FF6B6B',
}

// ── Keyframe style injected once ──────────────────────────────────────────────

const SPIN_STYLE = `@keyframes cf-checklist-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`

// ── CheckIcon ─────────────────────────────────────────────────────────────────

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

// ── LockIcon ──────────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ── SpinnerIcon ───────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'cf-checklist-spin 0.75s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${T.teal}, #00f0c4)`,
          borderRadius: 999,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.teal, whiteSpace: 'nowrap' }}>
        {done} / {total}
      </span>
    </div>
  )
}

// ── StepCard ──────────────────────────────────────────────────────────────────

interface StepCardProps {
  index:      number
  label:      string
  description:string
  cta:        string
  isDone:     boolean
  isActive:   boolean
  isLoading:  boolean
  onComplete: () => void
}

function StepCard({ index, label, description, cta, isDone, isActive, isLoading, onComplete }: StepCardProps) {
  const isLocked = !isDone && !isActive

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      padding: '20px 22px',
      borderRadius: 14,
      background: isDone ? 'rgba(0,212,170,0.06)' : isActive ? T.surface : 'transparent',
      border: '1px solid',
      borderColor: isDone ? T.tealDimBorder : isActive ? T.border : 'transparent',
      opacity: isLocked ? 0.45 : 1,
      transition: 'opacity 0.2s, background 0.2s',
    }}>

      {/* Step indicator */}
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        {isDone ? (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: T.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A1628',
          }}>
            <CheckIcon size={14} />
          </div>
        ) : (
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `2px solid ${isActive ? T.teal : T.faint}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? T.teal : T.faint,
            fontSize: 12,
            fontWeight: 700,
          }}>
            {isLocked ? <LockIcon /> : index + 1}
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 4px',
          fontSize: 15,
          fontWeight: 600,
          color: isDone ? T.muted : T.text,
          textDecoration: isDone ? 'line-through' : 'none',
          lineHeight: 1.3,
        }}>
          {label}
        </p>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: isDone ? T.faint : T.muted,
          lineHeight: 1.55,
        }}>
          {description}
        </p>

        {/* CTA (shown for active step only) */}
        {isActive && (
          <button
            onClick={onComplete}
            disabled={isLoading}
            style={{
              marginTop: 14,
              padding: '9px 20px',
              background: isLoading ? 'rgba(0,212,170,0.5)' : T.teal,
              color: '#0A1628',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'background 0.15s',
            }}
          >
            {isLoading ? (
              <>
                <SpinnerIcon />
                Saving…
              </>
            ) : (
              <>
                {cta}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* Done badge */}
      {isDone && (
        <div style={{
          flexShrink: 0,
          alignSelf: 'flex-start',
          padding: '3px 9px',
          background: T.tealDim,
          border: `1px solid ${T.tealDimBorder}`,
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          color: T.teal,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Done
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChecklistClient({ initialSteps }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [steps, setSteps] = useState<StepRow[]>(
    STEPS.map((s) => {
      const found = initialSteps.find((r) => r.step === s.key)
      return { step: s.key, completed: found?.completed ?? false, completed_at: found?.completed_at ?? null }
    })
  )
  const [completing, setCompleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const completedCount = steps.filter((s) => s.completed).length

  async function completeStep(stepKey: string) {
    if (completing) return
    setError(null)
    setCompleting(stepKey)

    try {
      const res = await fetch('/api/onboarding/steps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepKey }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to update step. Please try again.')
        return
      }

      setSteps((prev) =>
        prev.map((s) =>
          s.step === stepKey
            ? { ...s, completed: true, completed_at: new Date().toISOString() }
            : s
        )
      )

      if (json.allComplete) {
        startTransition(() => router.push('/overview'))
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      color: T.text,
    }}>
      <style>{SPIN_STYLE}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        height: 60,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: T.teal, letterSpacing: '-0.01em' }}>
          ClinicForce
        </span>
        <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
          {completedCount === STEPS.length ? 'All steps complete!' : 'Setup checklist'}
        </span>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main style={{
        maxWidth: 620,
        margin: '0 auto',
        padding: '52px 24px 80px',
      }}>

        {/* Title block */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            margin: '0 0 8px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: T.teal,
          }}>
            Getting Started
          </p>
          <h1 style={{
            margin: '0 0 10px',
            fontSize: 28,
            fontWeight: 700,
            color: T.text,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            Get your clinic ready to go live
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
            Complete each step in order to activate your AI receptionist.
            It only takes a few minutes.
          </p>
          <ProgressBar done={completedCount} total={STEPS.length} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.border, marginBottom: 8 }} />

        {/* Step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STEPS.map((step, index) => {
            const row = steps[index]
            const isDone   = row.completed
            const prevDone = index === 0 || steps[index - 1].completed
            const isActive = !isDone && prevDone

            return (
              <StepCard
                key={step.key}
                index={index}
                label={step.label}
                description={step.description}
                cta={step.cta}
                isDone={isDone}
                isActive={isActive}
                isLoading={completing === step.key}
                onComplete={() => completeStep(step.key)}
              />
            )
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            marginTop: 20,
            padding: '12px 16px',
            background: 'rgba(255,107,107,0.12)',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: 10,
            fontSize: 13,
            color: T.danger,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

      </main>
    </div>
  )
}
