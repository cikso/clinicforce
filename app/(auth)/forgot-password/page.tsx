'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback?type=recovery`,
        }
      )

      if (resetError) {
        console.error('[forgot-password] Supabase error:', resetError)
        // Translate internal SMTP/config errors into a user-friendly message
        const msg = resetError.message?.toLowerCase() ?? ''
        if (msg.includes('sending') || msg.includes('smtp') || msg.includes('email')) {
          setError('We couldn\'t send the email right now. Please try again in a moment or contact support.')
        } else {
          setError(resetError.message ?? 'Something went wrong. Please try again.')
        }
        return
      }

      setSent(true)
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
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Back link */}
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#6B6B6B',
            textDecoration: 'none',
            marginBottom: '2rem',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1B6B4A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B6B')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to sign in
        </Link>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E8E4DE',
            borderRadius: 16,
            padding: '2.5rem',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(27,107,74,0.08)',
              border: '1px solid rgba(27,107,74,0.2)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1B6B4A"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          {!sent ? (
            <>
              <h1
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: '1.875rem',
                  fontWeight: 400,
                  color: '#1A1A1A',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}
              >
                Reset your password
              </h1>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.925rem',
                  color: '#6B6B6B',
                  lineHeight: 1.5,
                  marginBottom: '1.75rem',
                }}
              >
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: isPending ? '#4a8a6a' : '#1B6B4A',
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
                  }}
                  onMouseDown={(e) => { if (!isPending) e.currentTarget.style.transform = 'scale(0.98)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
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
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: 'rgba(27,107,74,0.08)',
                  border: '1px solid rgba(27,107,74,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1B6B4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: '1.625rem',
                  fontWeight: 400,
                  color: '#1A1A1A',
                  marginBottom: '0.75rem',
                }}
              >
                Check your inbox
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.925rem',
                  color: '#6B6B6B',
                  lineHeight: 1.6,
                }}
              >
                We&apos;ve sent a reset link to{' '}
                <strong style={{ color: '#1A1A1A' }}>{email}</strong>.
                <br />
                Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  marginTop: '1.75rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.875rem',
                  color: '#1B6B4A',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Back to sign in
              </Link>
            </div>
          )}
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
