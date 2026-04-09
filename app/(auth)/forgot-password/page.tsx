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
        },
      )

      if (resetError) {
        const msg = resetError.message?.toLowerCase() ?? ''
        if (msg.includes('sending') || msg.includes('smtp') || msg.includes('email')) {
          setError("We couldn't send the email right now. Please try again in a moment or contact support.")
        } else {
          setError(resetError.message ?? 'Something went wrong. Please try again.')
        }
        return
      }

      setSent(true)
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#0176D3] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" fill="white" opacity="0.9" />
              <path d="M10 10V2L3 6l7 4z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span className="text-[18px] font-heading font-bold text-[#111827]">ClinicForce</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#0176D3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="18" height="14" rx="2" />
                  <path d="M2 6l8.5 5.4a1.5 1.5 0 0 0 1.6 0L20 6" />
                </svg>
              </div>

              <h1 className="text-[22px] font-heading font-bold text-[#111827] mb-1.5">
                Reset your password
              </h1>
              <p className="text-[15px] text-[#6B7280] mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-[13px] font-semibold text-[#111827] mb-1.5">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@clinic.com.au"
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#0176D3] focus:ring-2 focus:ring-[#0176D3]/20 transition-all outline-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/15">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
                      <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.01" />
                    </svg>
                    <span className="text-[13px] text-[#DC2626] font-medium">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#0176D3] text-white text-[15px] font-semibold hover:bg-[#014486] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {isPending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="text-[13px] font-medium text-[#0176D3] hover:text-[#014486] transition-colors">
                  Back to sign in
                </Link>
              </div>
            </>
          ) : (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-[20px] font-heading font-bold text-[#111827] mb-2">
                Check your email
              </h2>
              <p className="text-[14px] text-[#6B7280] leading-relaxed mb-1">
                We&apos;ve sent a reset link to
              </p>
              <p className="text-[14px] font-semibold text-[#111827] mb-1">
                {email}
              </p>
              <p className="text-[13px] text-[#9CA3AF] mb-6">
                It may take a few minutes. Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0176D3] hover:text-[#014486] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M10 2L4 7l6 5" />
                </svg>
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
