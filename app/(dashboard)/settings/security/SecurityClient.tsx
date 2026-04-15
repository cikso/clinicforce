'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Badge from '@/app/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'

type Factor = {
  id: string
  friendly_name?: string | null
  factor_type: string
  status: string
  created_at: string
}

type EnrollState =
  | { phase: 'idle' }
  | { phase: 'enrolling' }
  | { phase: 'verifying'; factorId: string; qrDataUrl: string; secret: string }
  | { phase: 'success' }

export default function SecurityClient({
  initialFactors,
}: {
  initialFactors: Factor[]
}) {
  const supabase = createClient()
  const [factors, setFactors] = useState<Factor[]>(initialFactors)
  const [state, setState] = useState<EnrollState>({ phase: 'idle' })
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const hasVerifiedTotp = factors.some(
    f => f.factor_type === 'totp' && f.status === 'verified',
  )

  async function refreshFactors() {
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors(((data?.all as Factor[] | undefined) ?? []).filter(f => f.factor_type === 'totp'))
  }

  async function beginEnrollment() {
    setError(null)
    setBusy(true)
    setState({ phase: 'enrolling' })
    try {
      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `ClinicForce (${new Date().toLocaleDateString()})`,
      })
      if (enrollErr || !data) {
        setError(enrollErr?.message ?? 'Could not start enrollment')
        setState({ phase: 'idle' })
        return
      }
      const qrDataUrl = await QRCode.toDataURL(data.totp.uri, { margin: 1, width: 220 })
      setState({
        phase: 'verifying',
        factorId: data.id,
        qrDataUrl,
        secret: data.totp.secret,
      })
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode() {
    if (state.phase !== 'verifying') return
    setError(null)
    setBusy(true)
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: state.factorId })
      if (challenge.error || !challenge.data) {
        setError(challenge.error?.message ?? 'Could not create challenge')
        return
      }
      const verify = await supabase.auth.mfa.verify({
        factorId: state.factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      })
      if (verify.error) {
        setError(verify.error.message)
        return
      }
      await fetch('/api/auth/mfa-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'enrolled', factor_id: state.factorId }),
      }).catch(() => {})
      setState({ phase: 'success' })
      setCode('')
      await refreshFactors()
    } finally {
      setBusy(false)
    }
  }

  async function removeFactor(factorId: string) {
    if (!confirm('Remove this authenticator? You will no longer be asked for a code at sign-in.')) return
    setBusy(true)
    setError(null)
    try {
      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId })
      if (unenrollErr) {
        setError(unenrollErr.message)
        return
      }
      await fetch('/api/auth/mfa-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'removed', factor_id: factorId }),
      }).catch(() => {})
      await refreshFactors()
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (state.phase === 'success') {
      const t = setTimeout(() => setState({ phase: 'idle' }), 3000)
      return () => clearTimeout(t)
    }
  }, [state])

  return (
    <div className="space-y-5 max-w-[680px]">
      <Card header={{ title: 'Two-factor authentication', subtitle: 'Protect your account with an authenticator app' }}>
        <div className="space-y-4">
          {hasVerifiedTotp ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--success-light)]/40 border border-[var(--success)]/20">
              <div className="flex items-center gap-2.5">
                <Badge variant="routine">Enabled</Badge>
                <p className="text-[13px] text-[var(--text-primary)]">
                  Your account is protected by an authenticator app.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-secondary)]">
              Two-factor authentication adds a second step to sign-in. When enabled, we
              will ask for a six-digit code from your authenticator app every time you
              log in on a new device.
            </p>
          )}

          {state.phase === 'idle' && !hasVerifiedTotp && (
            <Button variant="primary" onClick={beginEnrollment} disabled={busy}>
              Enable 2FA
            </Button>
          )}

          {state.phase === 'enrolling' && (
            <p className="text-[13px] text-[var(--text-secondary)]">Generating QR code…</p>
          )}

          {state.phase === 'verifying' && (
            <div className="space-y-3">
              <p className="text-[13px] text-[var(--text-secondary)]">
                Scan this QR code with your authenticator app (1Password, Authy, Google
                Authenticator, etc.), then enter the six-digit code to confirm.
              </p>
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.qrDataUrl} alt="TOTP QR code" width={220} height={220} className="rounded-md border border-[var(--border-subtle)]" />
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold mb-1">
                      Or enter this secret manually
                    </p>
                    <code className="block text-[12px] font-mono-data bg-[var(--bg-secondary)] p-2 rounded break-all">
                      {state.secret}
                    </code>
                  </div>
                  <div className="pt-2">
                    <label htmlFor="mfa-code" className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold">
                      Verification code
                    </label>
                    <input
                      id="mfa-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="block w-full mt-1 h-9 px-3 rounded-md border border-[var(--border)] bg-white font-mono-data tracking-widest text-center text-[15px]"
                      placeholder="123456"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={verifyCode}
                    disabled={busy || code.length !== 6}
                  >
                    {busy ? 'Verifying…' : 'Verify & enable'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.phase === 'success' && (
            <div className="p-3 rounded-lg bg-[var(--success-light)]/40 border border-[var(--success)]/20">
              <p className="text-[13px] text-[var(--success)] font-medium">
                Two-factor authentication is enabled. You&apos;ll be asked for a code next time you sign in.
              </p>
            </div>
          )}

          {error && (
            <p className="text-[12px] text-[var(--error)]">{error}</p>
          )}
        </div>
      </Card>

      {factors.length > 0 && (
        <Card header={{ title: 'Active authenticators' }}>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {factors.map(f => (
              <li key={f.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[var(--text-primary)]">
                    {f.friendly_name ?? 'Authenticator'}
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Added {new Date(f.created_at).toLocaleDateString()} · {f.status}
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => removeFactor(f.id)} disabled={busy}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
