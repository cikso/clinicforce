'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

// ── Step configuration ────────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'clinic_profile',
    label: 'Complete clinic profile',
    description: 'Add your clinic name, address, phone number, and contact details.',
    cta: 'Mark as done',
  },
  {
    key: 'staff_added',
    label: 'Add your team',
    description: 'Invite staff members so your team can access the dashboard and manage calls.',
    cta: 'Mark as done',
  },
  {
    key: 'voice_agent_configured',
    label: 'Configure voice agent',
    description: 'Connect your ElevenLabs agent ID and assign your Twilio phone number.',
    cta: 'Mark as done',
  },
  {
    key: 'phone_forwarding_set',
    label: 'Set up phone forwarding',
    description: 'Forward your clinic\u2019s number to the AI receptionist line to start routing calls.',
    cta: 'Mark as done',
  },
  {
    key: 'test_call_done',
    label: 'Make a test call',
    description: 'Call your clinic number to verify the AI receptionist answers and responds correctly.',
    cta: 'Mark as done',
  },
  {
    key: 'go_live',
    label: 'Go live',
    description: 'All systems are ready. Activate your AI receptionist to start taking real patient calls.',
    cta: 'Activate & go live',
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

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'cf-cl-spin 0.75s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="cf-cl-progress" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total}>
      <div className="cf-cl-progress-track">
        <div className="cf-cl-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="cf-cl-progress-label">{done} / {total}</span>
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
  const state = isDone ? 'done' : isActive ? 'active' : 'locked'

  return (
    <div className={`cf-cl-step cf-cl-step-${state}`}>
      {/* Step indicator */}
      <div className="cf-cl-step-dot" aria-hidden>
        {isDone ? (
          <CheckIcon size={14} />
        ) : isLocked ? (
          <LockIcon />
        ) : (
          <span className="cf-cl-step-num">{index + 1}</span>
        )}
      </div>

      {/* Text */}
      <div className="cf-cl-step-body">
        <p className="cf-cl-step-label">{label}</p>
        <p className="cf-cl-step-desc">{description}</p>

        {isActive && (
          <button
            type="button"
            onClick={onComplete}
            disabled={isLoading}
            className="cf-cl-cta"
          >
            {isLoading ? (
              <>
                <SpinnerIcon />
                Saving&hellip;
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
        <div className="cf-cl-badge">Done</div>
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
  const allDone = completedCount === STEPS.length

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
    <div className="cf-cl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="cf-cl-nav">
        <div className="cf-cl-logo">
          <div className="cf-cl-logo-mark" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" fill="currentColor" opacity="0.9" />
              <path d="M10 10V2L3 6l7 4z" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <span className="cf-cl-logo-text">ClinicForce</span>
        </div>
        <span className="cf-cl-nav-meta">
          {allDone ? 'All steps complete' : 'Setup checklist'}
        </span>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="cf-cl-main">
        {/* Title block */}
        <div className="cf-cl-title-block">
          <p className="cf-cl-eyebrow">Getting started</p>
          <h1 className="cf-cl-title">Get your clinic ready to go live</h1>
          <p className="cf-cl-subtitle">
            Complete each step in order to activate your AI receptionist. It only takes a few minutes.
          </p>
          <ProgressBar done={completedCount} total={STEPS.length} />
        </div>

        {/* Step list */}
        <div className="cf-cl-list">
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
          <div className="cf-cl-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
      </main>

      {/* ── Scoped styles ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes cf-cl-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

        .cf-cl {
          min-height: 100vh;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
        }

        .cf-cl-nav {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
        }
        .cf-cl-logo { display: inline-flex; align-items: center; gap: 10px; }
        .cf-cl-logo-mark {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--brand);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cf-cl-logo-text {
          font-family: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: -0.01em;
        }
        .cf-cl-nav-meta {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-tertiary);
        }

        .cf-cl-main {
          max-width: 640px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        .cf-cl-title-block { margin-bottom: 32px; }
        .cf-cl-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brand-dark);
          margin: 0 0 10px;
        }
        .cf-cl-title {
          font-family: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
          font-size: 28px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .cf-cl-subtitle {
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--text-secondary);
          margin: 0 0 22px;
          max-width: 540px;
        }

        .cf-cl-progress {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cf-cl-progress-track {
          flex: 1;
          height: 6px;
          border-radius: 999px;
          background: var(--bg-hover);
          overflow: hidden;
        }
        .cf-cl-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--brand) 0%, #2fdfa5 100%);
          transition: width 400ms ease;
        }
        .cf-cl-progress-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--brand-dark);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .cf-cl-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cf-cl-step {
          display: flex;
          gap: 16px;
          padding: 18px 20px;
          border-radius: 14px;
          background: transparent;
          border: 1px solid transparent;
          transition: background-color 200ms ease, border-color 200ms ease, opacity 200ms ease;
        }
        .cf-cl-step-done {
          background: var(--brand-light);
          border-color: rgba(0, 214, 143, 0.25);
        }
        .cf-cl-step-active {
          background: var(--bg-primary);
          border-color: var(--border);
          box-shadow: var(--shadow-card);
        }
        .cf-cl-step-locked {
          opacity: 0.55;
        }

        .cf-cl-step-dot {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          background: transparent;
          border: 2px solid var(--border);
          color: var(--text-tertiary);
          transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
        }
        .cf-cl-step-done .cf-cl-step-dot {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }
        .cf-cl-step-active .cf-cl-step-dot {
          border-color: var(--brand);
          color: var(--brand);
        }
        .cf-cl-step-num {
          font-size: 12px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .cf-cl-step-body {
          flex: 1;
          min-width: 0;
        }
        .cf-cl-step-label {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.3;
          color: var(--text-primary);
          font-family: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
          letter-spacing: -0.005em;
        }
        .cf-cl-step-done .cf-cl-step-label {
          color: var(--text-secondary);
          text-decoration: line-through;
        }
        .cf-cl-step-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-secondary);
        }

        .cf-cl-cta {
          margin-top: 14px;
          padding: 9px 18px;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: background-color 140ms ease, transform 90ms ease;
        }
        .cf-cl-cta:hover:not(:disabled) {
          background: var(--brand-hover);
        }
        .cf-cl-cta:active:not(:disabled) {
          transform: scale(0.985);
        }
        .cf-cl-cta:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cf-cl-badge {
          flex-shrink: 0;
          align-self: flex-start;
          padding: 3px 10px;
          background: var(--brand-light);
          border: 1px solid rgba(0, 214, 143, 0.25);
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--brand-dark);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .cf-cl-error {
          margin-top: 20px;
          padding: 10px 14px;
          background: var(--error-light);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--error);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cf-cl-error svg { flex-shrink: 0; }

        @media (prefers-reduced-motion: reduce) {
          .cf-cl-progress-fill,
          .cf-cl-step,
          .cf-cl-step-dot,
          .cf-cl-cta { transition: none; }
        }
      `}</style>
    </div>
  )
}
