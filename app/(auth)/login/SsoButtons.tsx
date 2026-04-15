'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Provider = 'google' | 'azure'

function ProviderButton({
  provider,
  next,
  busy,
  onClick,
}: {
  provider: Provider
  next: string
  busy: Provider | null
  onClick: (p: Provider) => void
}) {
  const label =
    provider === 'google' ? 'Continue with Google' : 'Continue with Microsoft'
  const icon =
    provider === 'google' ? (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.61z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden>
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
      </svg>
    )

  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      disabled={busy !== null}
      className="w-full h-11 inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] font-medium text-[#111827] hover:bg-[#F9FAFB] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      aria-label={label}
      data-next={next}
    >
      {busy === provider ? (
        <svg className="animate-spin h-4 w-4 text-[#6B7280]" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
        </svg>
      ) : (
        icon
      )}
      {label}
    </button>
  )
}

export default function SsoButtons({ next }: { next: string }) {
  const [busy, setBusy] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signIn(provider: Provider) {
    setError(null)
    setBusy(provider)
    try {
      const supabase = createClient()
      const siteUrl =
        typeof window !== 'undefined' ? window.location.origin : ''
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
        next,
      )}`
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      if (err) {
        setError(err.message)
        setBusy(null)
      }
      // Otherwise the browser is being redirected — no cleanup needed.
    } catch {
      setError('Could not start sign-in. Please try again.')
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      <ProviderButton provider="google" next={next} busy={busy} onClick={signIn} />
      <ProviderButton provider="azure" next={next} busy={busy} onClick={signIn} />
      {error && (
        <p className="text-[12px] text-[#DC2626]">{error}</p>
      )}
    </div>
  )
}
