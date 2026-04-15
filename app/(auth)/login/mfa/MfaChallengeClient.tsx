'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'

export default function MfaChallengeClient() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/overview'
  const supabase = createClient()

  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Confirm there is an AAL gap and grab the enrolled TOTP factor.
      const { data: factorsData, error: listErr } = await supabase.auth.mfa.listFactors()
      if (listErr) {
        setError(listErr.message)
        return
      }
      const totp = (factorsData?.all ?? []).find(
        f => f.factor_type === 'totp' && f.status === 'verified',
      )
      if (!totp) {
        // No enrolled factor — nothing to challenge.
        router.replace(next)
        return
      }
      if (cancelled) return
      setFactorId(totp.id)

      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      })
      if (chErr || !challenge) {
        setError(chErr?.message ?? 'Could not start the MFA challenge.')
        return
      }
      setChallengeId(challenge.id)
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, router, next])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId || !challengeId) return
    setError(null)
    setBusy(true)
    try {
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: code.trim(),
      })
      if (verifyErr) {
        setError(verifyErr.message)
        return
      }
      await fetch('/api/auth/mfa-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'verified', factor_id: factorId }),
      }).catch(() => {})
      router.replace(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-[420px] w-full" header={{ title: 'Two-factor authentication', subtitle: 'Enter the 6-digit code from your authenticator app' }}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="code" className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="block w-full mt-1 h-11 px-3 rounded-md border border-[var(--border)] bg-white font-mono-data tracking-[0.5em] text-center text-[20px]"
              placeholder="000000"
            />
          </div>
          {error && <p className="text-[12px] text-[var(--error)]">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={busy || code.length !== 6}>
            {busy ? 'Verifying…' : 'Verify'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
