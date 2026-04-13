'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsPending(true)

    try {
      const redirectPath = next.startsWith('/') ? next : '/overview'
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        setError((payload as { error?: string } | null)?.error ?? 'Invalid email or password. Please try again.')
        return
      }

      // Check role for platform_owner redirect
      try {
        const checkRes = await fetch('/api/debug/me', { credentials: 'include' })
        if (checkRes.ok) {
          const me = await checkRes.json()
          if ((me as { role?: string })?.role === 'platform_owner') {
            window.location.assign('/admin')
            return
          }
        }
      } catch {
        // Fall through to default redirect
      }

      window.location.assign(redirectPath)
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Column — Brand Panel ── */}
      <div
        className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #17C4BE 0%, #0F9995 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" fill="white" opacity="0.9" />
              <path d="M10 10V2L3 6l7 4z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span className="text-[18px] font-heading font-bold text-white tracking-[-0.01em]">ClinicForce</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 max-w-[480px]">
          <h1 className="text-[36px] font-heading font-extrabold text-white leading-[1.15] mb-5">
            Manage your clinic&apos;s calls with confidence.
          </h1>
          <p className="text-[16px] text-white/70 leading-relaxed mb-10 max-w-[420px]">
            AI-powered phone handling, appointment capture, and front-desk support — all in one platform.
          </p>

          <div className="space-y-4">
            {[
              {
                text: 'Every call answered, even after hours',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M14.5 11c-.8 0-1.5-.15-2.2-.4a.5.5 0 0 0-.5.13l-1 1.3A8.4 8.4 0 0 1 3.9 5.2l1-1a.5.5 0 0 0 .13-.5C4.8 3 4.6 2.3 4.6 1.5a.5.5 0 0 0-.5-.5H2a.5.5 0 0 0-.5.5C1.5 8.5 7.5 14.5 15 14.5a.5.5 0 0 0 .5-.5v-2.1a.5.5 0 0 0-.5-.5c-.2 0-.3 0-.5-.4z" />
                  </svg>
                ),
              },
              {
                text: 'Smart triage for urgent cases',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4L8 1.5z" />
                    <path d="M6 8l1.5 1.5L10 6.5" />
                  </svg>
                ),
              },
              {
                text: 'Bookings captured automatically',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-[14px] text-white/85 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-[13px] text-white/45 relative z-10">
          Trusted by veterinary, dental, and GP clinics across Australia
        </p>

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full bg-white/[0.04]" />
        <div className="absolute -left-16 -bottom-32 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
      </div>

      {/* ── Right Column — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-12 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-[#17C4BE] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" fill="white" opacity="0.9" />
                <path d="M10 10V2L3 6l7 4z" fill="white" opacity="0.6" />
              </svg>
            </div>
            <span className="text-[18px] font-heading font-bold text-[#111827]">ClinicForce</span>
          </div>

          <h2 className="text-[24px] font-heading font-bold text-[#111827] mb-1">
            Welcome back
          </h2>
          <p className="text-[15px] text-[#6B7280] mb-8">
            Sign in to your clinic dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-semibold text-[#111827] mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com.au"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#17C4BE] focus:ring-2 focus:ring-[#17C4BE]/20 transition-all outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-[13px] font-semibold text-[#111827]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-medium text-[#17C4BE] hover:text-[#0F9995] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#17C4BE] focus:ring-2 focus:ring-[#17C4BE]/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                      <path d="M2.5 2.5l13 13" />
                      <path d="M7.6 7.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M4 4.2C2.6 5.4 1.5 7 1.5 9s3.4 6 7.5 6c1.7 0 3.2-.6 4.5-1.6" />
                      <path d="M14.2 12.5c.8-.9 1.5-2 2.3-3.5C14.8 5.5 12.2 3 9 3c-.7 0-1.3.1-1.9.3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                      <path d="M1.5 9s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6S1.5 9 1.5 9z" />
                      <circle cx="9" cy="9" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/15">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
                  <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.01" />
                </svg>
                <span className="text-[13px] text-[#DC2626] font-medium">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#17C4BE] text-white text-[15px] font-semibold hover:bg-[#0F9995] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Bottom text */}
          <p className="mt-8 text-center text-[13px] text-[#9CA3AF]">
            Need access? Contact your ClinicForce administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
