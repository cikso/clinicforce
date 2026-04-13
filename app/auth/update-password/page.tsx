'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message ?? 'Failed to update password. Please try again.')
        return
      }

      router.push('/overview')
    })
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F4',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontFamily: "'DM Sans'", fontWeight: 700, fontSize: '1.1rem', color: '#17C4BE', letterSpacing: '-0.01em' }}>
              ClinicForce
            </span>
          </div>

          {/* Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E4DE', borderRadius: 16, padding: '2.5rem' }}>

            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 52, height: 52,
                backgroundColor: 'rgba(23,196,190,0.08)',
                border: '1px solid rgba(23,196,190,0.2)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17C4BE" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.875rem', fontWeight: 400, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              Set a new password
            </h1>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', color: '#6B6B6B', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.5 }}>
              Choose a strong password for your ClinicForce account.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* New password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>
                  New password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem',
                      backgroundColor: '#ffffff', border: '1px solid #E8E4DE',
                      borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.95rem',
                      color: '#1A1A1A', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#17C4BE')}
                    onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9B9B9B', display: 'flex', alignItems: 'center', padding: 0 }}>
                    {showPassword
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                <p style={{ fontFamily: "'DM Sans'", fontSize: '0.78rem', color: '#9B9B9B' }}>Minimum 8 characters</p>
              </div>

              {/* Confirm password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>
                  Confirm password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    backgroundColor: '#ffffff', border: '1px solid #E8E4DE',
                    borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.95rem',
                    color: '#1A1A1A', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#17C4BE')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                style={{
                  width: '100%', padding: '0.875rem',
                  backgroundColor: isPending ? '#45c5bf' : '#17C4BE',
                  color: '#ffffff', border: 'none', borderRadius: 10,
                  fontFamily: "'DM Sans'", fontSize: '0.95rem', fontWeight: 600,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background-color 0.15s, transform 0.1s', marginTop: '0.25rem',
                }}
                onMouseDown={(e) => { if (!isPending) e.currentTarget.style.transform = 'scale(0.98)' }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {isPending ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Updating password...
                  </>
                ) : 'Update password'}
              </button>
            </form>
          </div>
        </div>

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </>
  )
}
