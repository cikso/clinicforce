'use client'

import { usePathname } from 'next/navigation'

const STEPS = [
  { label: 'Clinic Details', path: '/onboarding/clinic-details' },
  { label: 'Opening Hours', path: '/onboarding/hours' },
  { label: 'Call Handling', path: '/onboarding/call-handling' },
]

export default function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isComplete = pathname === '/onboarding/complete'

  const currentIndex = STEPS.findIndex((s) => pathname === s.path)

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F4',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top nav ── */}
      <header
        style={{
          height: 60,
          borderBottom: '1px solid #E8E4DE',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1B6B4A',
            letterSpacing: '-0.01em',
          }}
        >
          ClinicForce
        </span>

        {!isComplete && (
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.82rem',
              color: '#9B9B9B',
            }}
          >
            Step {currentIndex + 1} of {STEPS.length}
          </span>
        )}
      </header>

      {/* ── Progress bar ── */}
      {!isComplete && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #E8E4DE',
            padding: '0 2rem',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: '0 auto',
              display: 'flex',
              gap: 0,
              position: 'relative',
            }}
          >
            {STEPS.map((step, i) => {
              const isDone = i < currentIndex
              const isCurrent = i === currentIndex
              return (
                <div
                  key={step.path}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.875rem 0.5rem',
                    gap: '0.4rem',
                    position: 'relative',
                  }}
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1.35rem',
                        left: '60%',
                        right: '-40%',
                        height: 2,
                        backgroundColor: isDone ? '#1B6B4A' : '#E8E4DE',
                        zIndex: 0,
                        transition: 'background-color 0.3s',
                      }}
                    />
                  )}

                  {/* Step dot */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: isDone
                        ? '#1B6B4A'
                        : isCurrent
                        ? '#1B6B4A'
                        : '#E8E4DE',
                      border: isCurrent ? '2px solid #1B6B4A' : '2px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      flexShrink: 0,
                      transition: 'all 0.3s',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(27,107,74,0.12)' : 'none',
                    }}
                  >
                    {isDone ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: isCurrent ? '#ffffff' : '#B0B0B0',
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.72rem',
                      fontWeight: isCurrent ? 600 : 400,
                      color: isDone || isCurrent ? '#1A1A1A' : '#B0B0B0',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.3s',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2.5rem 1.5rem 4rem',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
