'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface InviteFormProps {
  token: string
  email: string
  clinicName: string
  clinicId: string
  role: string
}

export default function InviteForm({
  token,
  email,
  clinicName,
}: InviteFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function validate(): string | null {
    if (!fullName.trim()) return 'Please enter your full name.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirmPassword) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    startTransition(async () => {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, fullName: fullName.trim(), password }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push('/overview')
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#00D68F',
              letterSpacing: '-0.01em',
            }}
          >
            ClinicForce
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E8E4DE',
            borderRadius: 16,
            padding: '2.5rem',
          }}
        >
          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.3rem 0.875rem',
                backgroundColor: 'rgba(23,196,190,0.08)',
                border: '1px solid rgba(23,196,190,0.2)',
                borderRadius: 999,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#00D68F',
                letterSpacing: '0.02em',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12" />
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2" />
                <path d="M16.72 2a4 4 0 0 1 0 7.75" />
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
              You&apos;ve been invited
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: '1.875rem',
              fontWeight: 400,
              color: '#1A1A1A',
              lineHeight: 1.2,
              textAlign: 'center',
              marginBottom: '0.5rem',
            }}
          >
            Set up your ClinicForce account
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
              color: '#6B6B6B',
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: '2rem',
            }}
          >
            You&apos;ve been invited to join{' '}
            <strong style={{ color: '#1A1A1A' }}>{clinicName}</strong> on
            ClinicForce.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full name */}
            <Field label="Full name">
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#00D68F')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
              />
            </Field>

            {/* Email — pre-filled, read-only */}
            <Field label="Email address">
              <input
                type="email"
                value={email}
                readOnly
                style={{
                  ...inputStyle,
                  backgroundColor: '#F5F5F3',
                  color: '#9B9B9B',
                  cursor: 'not-allowed',
                }}
              />
            </Field>

            {/* Password */}
            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={(e) => (e.target.style.borderColor = '#00D68F')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                />
                <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
              </div>
              <p style={{ fontFamily: "'DM Sans'", fontSize: '0.78rem', color: '#9B9B9B', marginTop: '0.3rem' }}>
                Minimum 8 characters
              </p>
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password">
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={(e) => (e.target.style.borderColor = '#00D68F')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
              </div>
            </Field>

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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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
                backgroundColor: isPending ? '#45c5bf' : '#00D68F',
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
              onMouseDown={(e) => { if (!isPending) e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {isPending ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account & Continue'
              )}
            </button>
          </form>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.78rem',
              color: '#B0B0B0',
              textAlign: 'center',
              marginTop: '1.25rem',
              lineHeight: 1.5,
            }}
          >
            By continuing, you agree to ClinicForce&apos;s{' '}
            <a href="/terms" style={{ color: '#6B6B6B' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: '#6B6B6B' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#1A1A1A',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function EyeToggle({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
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
}
