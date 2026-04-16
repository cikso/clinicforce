'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LinkExpiredPage() {
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    // Supabase sends errors as hash fragments, e.g. #error_code=otp_expired
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const code = params.get('error_code')
    if (code) setReason(code)
  }, [])

  const isExpired = reason === 'otp_expired'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"DM Sans", sans-serif',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '24px',
        }}>
          ⏱
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#1A1A1A',
          margin: '0 0 12px',
        }}>
          {isExpired ? 'This link has expired' : 'Invalid link'}
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#6B7280',
          lineHeight: '1.6',
          margin: '0 0 32px',
        }}>
          {isExpired
            ? 'Password reset links expire after 1 hour for security. Request a new one and use it straight away.'
            : 'This link is no longer valid. Please request a new password reset.'}
        </p>

        <Link
          href="/forgot-password"
          style={{
            display: 'block',
            background: '#00D68F',
            color: '#fff',
            borderRadius: '10px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            marginBottom: '12px',
          }}
        >
          Request new reset link
        </Link>

        <Link
          href="/login"
          style={{
            display: 'block',
            color: '#6B7280',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
