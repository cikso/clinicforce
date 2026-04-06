'use client'

import { Suspense, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/overview'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError || !data.user) {
        setError('Incorrect email or password. Please try again.')
        return
      }

      // Check onboarding status via clinic_users → clinics
      const { data: clinicUser } = await supabase
        .from('clinic_users')
        .select('clinic_id, clinics(onboarding_completed)')
        .eq('user_id', data.user.id)
        .single()

      const onboardingCompleted =
        (clinicUser?.clinics as { onboarding_completed?: boolean } | null)
          ?.onboarding_completed ?? false

      if (!onboardingCompleted) {
        router.push('/onboarding/clinic-details')
      } else {
        router.push(next.startsWith('/') ? next : '/overview')
      }

      router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left brand panel ── */}
      <div
        style={{
          width: '42%',
          backgroundColor: '#1A1A1A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 3.5rem',
          flexShrink: 0,
        }}
        className="hidden lg:flex"
      >
        {/* Logo mark */}
        <div style={{ marginBottom: '3rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#1B6B4A',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 17C6.5 17 4 17 4 14.5C4 12.268 5.948 11.268 7.197 11.108C7.07 10.763 7 10.39 7 10C7 8.343 8.343 7 10 7C10.834 7 11.589 7.339 12.148 7.888C12.621 6.773 13.72 6 15 6C16.657 6 18 7.343 18 9C18 9.099 17.994 9.196 17.983 9.291C19.175 9.753 20 10.898 20 12.25C20 14.045 18.545 15.5 16.75 15.5H16.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13V21M12 13L9.5 15.5M12 13L14.5 15.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ClinicForce
          </div>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '2.75rem',
            lineHeight: 1.15,
            color: '#ffffff',
            fontWeight: 400,
            marginBottom: '1.25rem',
            maxWidth: 380,
          }}
        >
          Welcome back to ClinicForce
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '3rem',
            maxWidth: 360,
          }}
        >
          Manage your clinic&apos;s calls, handovers, and front desk operations
          in one place.
        </p>

        {/* Trust bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            'Built for modern clinics',
            'Secure clinic access',
            'After-hours and overflow coverage',
          ].map((item) => (
            <div
              key={item}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(27,107,74,0.25)',
                  border: '1px solid rgba(27,107,74,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#FAF8F4',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Wordmark */}
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#1B6B4A',
              marginBottom: '2.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            ClinicForce
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: '2rem',
              fontWeight: 400,
              color: '#1A1A1A',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
            }}
          >
            Sign in to your account
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.95rem',
              color: '#6B6B6B',
              marginBottom: '2rem',
            }}
          >
            Enter your credentials below
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label
                htmlFor="email"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1A1A1A',
                }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com.au"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #E8E4DE',
                  borderRadius: 10,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.95rem',
                  color: '#1A1A1A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#1A1A1A',
                  }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8rem',
                    color: '#1B6B4A',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.75rem 0.75rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #E8E4DE',
                    borderRadius: 10,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.95rem',
                    color: '#1A1A1A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#9B9B9B',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 10,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.875rem',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: isPending ? '#4a4a4a' : '#1A1A1A',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.15s, transform 0.1s',
                marginTop: '0.25rem',
              }}
              onMouseEnter={(e) => {
                if (!isPending) (e.currentTarget.style.backgroundColor = '#1B6B4A')
              }}
              onMouseLeave={(e) => {
                if (!isPending) (e.currentTarget.style.backgroundColor = '#1A1A1A')
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isPending ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: 'spin 0.8s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.82rem',
              color: '#9B9B9B',
              textAlign: 'center',
              marginTop: '1.5rem',
            }}
          >
            Need access? Contact your ClinicForce administrator.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .lg\\:flex { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
