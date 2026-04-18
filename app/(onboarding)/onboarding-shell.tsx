'use client'

import { usePathname } from 'next/navigation'

/**
 * Wizard chrome — top bar, step indicator, and page content frame.
 *
 * Uses the app-wide design tokens (brand/border/text colors, Geist + heading
 * fonts) so the onboarding flow is visually continuous with the dashboard
 * users are about to land on. Respects `prefers-reduced-motion` on the step
 * dot entrance.
 */

const STEPS = [
  { label: 'Clinic details',  path: '/onboarding/clinic-details' },
  { label: 'Opening hours',   path: '/onboarding/hours'          },
  { label: 'Call handling',   path: '/onboarding/call-handling'  },
  { label: 'Urgent rules',    path: '/onboarding/urgent-rules'   },
]

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isComplete = pathname === '/onboarding/complete'
  const currentIndex = STEPS.findIndex((s) => pathname === s.path)
  // When landing on an unknown step (e.g. entry path) fall through to "no
  // progress" rather than the broken -1 counter the old shell had.
  const stepNumber = currentIndex >= 0 ? currentIndex + 1 : null

  return (
    <div className="cf-onb">
      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <header className="cf-onb-nav">
        <div className="cf-onb-logo">
          <div className="cf-onb-logo-mark" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" fill="currentColor" opacity="0.9" />
              <path d="M10 10V2L3 6l7 4z" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <span className="cf-onb-logo-text">ClinicForce</span>
        </div>

        {!isComplete && stepNumber !== null && (
          <span className="cf-onb-step-meta">
            Step <b>{stepNumber}</b> of {STEPS.length}
          </span>
        )}
      </header>

      {/* ── Progress bar ────────────────────────────────────────────── */}
      {!isComplete && (
        <div className="cf-onb-progress">
          <ol className="cf-onb-progress-track" aria-label="Setup progress">
            {STEPS.map((step, i) => {
              const isDone = i < currentIndex
              const isCurrent = i === currentIndex
              const state = isDone ? 'done' : isCurrent ? 'current' : 'todo'
              return (
                <li key={step.path} className={`cf-onb-step cf-onb-step-${state}`}>
                  {i < STEPS.length - 1 && (
                    <span className="cf-onb-connector" aria-hidden />
                  )}
                  <span className="cf-onb-dot" aria-hidden>
                    {isDone ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="cf-onb-dot-num">{i + 1}</span>
                    )}
                  </span>
                  <span className="cf-onb-step-label">{step.label}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* ── Page content ────────────────────────────────────────────── */}
      <main className="cf-onb-main">{children}</main>

      {/* ── Scoped styles ───────────────────────────────────────────── */}
      <style>{`
        .cf-onb {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
          color: var(--text-primary);
        }
        .cf-onb-nav {
          height: 60px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
        }
        .cf-onb-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .cf-onb-logo-mark {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--brand);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cf-onb-logo-text {
          font-family: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        .cf-onb-step-meta {
          font-size: 12.5px;
          color: var(--text-tertiary);
          font-variant-numeric: tabular-nums;
        }
        .cf-onb-step-meta b {
          color: var(--text-primary);
          font-weight: 700;
        }

        .cf-onb-progress {
          flex-shrink: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
        }
        .cf-onb-progress-track {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          list-style: none;
          padding: 14px 0 12px;
          gap: 0;
        }
        .cf-onb-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 0 4px;
          position: relative;
        }
        .cf-onb-connector {
          position: absolute;
          top: 11px;
          left: calc(50% + 12px);
          right: calc(-50% + 12px);
          height: 2px;
          background: var(--border);
          z-index: 0;
          border-radius: 2px;
          transition: background-color 260ms ease;
        }
        .cf-onb-step-done .cf-onb-connector {
          background: var(--brand);
        }
        .cf-onb-dot {
          position: relative;
          z-index: 1;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--border);
          color: var(--text-tertiary);
          transition: background-color 260ms ease, box-shadow 260ms ease, color 260ms ease;
        }
        .cf-onb-step-done .cf-onb-dot,
        .cf-onb-step-current .cf-onb-dot {
          background: var(--brand);
          color: white;
        }
        .cf-onb-step-current .cf-onb-dot {
          box-shadow: 0 0 0 4px rgba(0, 214, 143, 0.15);
        }
        .cf-onb-dot-num {
          font-size: 10.5px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .cf-onb-step-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-tertiary);
          white-space: nowrap;
          transition: color 260ms ease;
        }
        .cf-onb-step-done .cf-onb-step-label,
        .cf-onb-step-current .cf-onb-step-label {
          color: var(--text-primary);
        }
        .cf-onb-step-current .cf-onb-step-label {
          font-weight: 600;
        }

        .cf-onb-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 24px 64px;
          overflow-y: auto;
        }

        @media (max-width: 640px) {
          .cf-onb-step-label {
            display: none;
          }
          .cf-onb-main {
            padding: 24px 16px 48px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cf-onb-connector,
          .cf-onb-dot,
          .cf-onb-step-label {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
