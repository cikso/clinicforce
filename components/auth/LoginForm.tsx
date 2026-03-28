'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type Step = 'signin' | 'clinic' | 'account'

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('signin')

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Clinic fields (step 1 of signup)
  const [clinicName, setClinicName] = useState('')
  const [clinicPhone, setClinicPhone] = useState('')
  const [clinicEmail, setClinicEmail] = useState('')

  // Account fields (step 2 of signup)
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function clearError() { setError(null) }

  // ── Sign in ───────────────────────────────────────────────
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    })
    if (err) { setError(err.message); setLoading(false); return }
    window.location.href = '/overview'
  }

  // ── Create account + clinic ───────────────────────────────
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    setLoading(true)

    const supabase = createClient()

    // 1. Create auth account
    const { error: signUpErr } = await supabase.auth.signUp({
      email: ownerEmail,
      password: ownerPassword,
      options: {
        data: { full_name: ownerName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    // 2. Sign in immediately (works if email confirmation is disabled in Supabase)
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: ownerEmail,
      password: ownerPassword,
    })
    if (signInErr) {
      // Email confirmation required — show message and pre-fill sign in
      setError('Account created! Please check your email to confirm, then sign in.')
      setLoading(false)
      setStep('signin')
      setSignInEmail(ownerEmail)
      return
    }

    // 3. Create clinic via server route
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicName,
        phone: clinicPhone,
        email: clinicEmail,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to create clinic'); setLoading(false); return }

    // Hard redirect so session cookie is fully loaded
    window.location.href = '/overview'
  }

  // ─────────────────────────────────────────────────────────
  // SIGN IN screen
  // ─────────────────────────────────────────────────────────
  if (step === 'signin') {
    return (
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-[#0f2744] mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500 mb-8">Sign in to your VetDesk dashboard</p>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)}
              placeholder="jane@vetclinic.com.au" required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={signInPassword} onChange={e => setSignInPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all pr-10" />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center mb-4">New to VetDesk?</p>
          <button onClick={() => { setStep('clinic'); clearError() }}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#0f5b8a] text-[#0f5b8a] text-sm font-bold rounded-xl hover:bg-[#f0f6ff] transition-colors">
            Set up your clinic <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">← Back to home</Link>
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // STEP 1 — Clinic details
  // ─────────────────────────────────────────────────────────
  if (step === 'clinic') {
    return (
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white text-xs font-bold flex items-center justify-center">1</div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center">2</div>
          <span className="text-xs text-slate-400 ml-1">Step 1 of 2</span>
        </div>

        <h2 className="text-2xl font-bold text-[#0f2744] mb-1">Your clinic</h2>
        <p className="text-sm text-slate-500 mb-8">Tell us about the clinic you want to cover.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Name *</label>
            <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)}
              placeholder="Baulkham Hills Pet Clinic" autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Phone *</label>
            <input type="tel" value={clinicPhone} onChange={e => setClinicPhone(e.target.value)}
              placeholder="02 9000 0000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Email</label>
            <input type="email" value={clinicEmail} onChange={e => setClinicEmail(e.target.value)}
              placeholder="hello@clinic.com.au"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={() => { setStep('signin'); clearError() }}
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => { if (clinicName && clinicPhone) { clearError(); setStep('account') } else setError('Clinic name and phone are required') }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {error && <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // STEP 2 — Create account
  // ─────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div className="h-0.5 w-8 bg-[#0ea5e9]" />
        <div className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white text-xs font-bold flex items-center justify-center">2</div>
        <span className="text-xs text-slate-400 ml-1">Step 2 of 2</span>
      </div>

      <h2 className="text-2xl font-bold text-[#0f2744] mb-1">Create your account</h2>
      <p className="text-sm text-slate-500 mb-8">
        This is the owner account for <span className="font-semibold text-slate-700">{clinicName}</span>.
        You can add staff from the dashboard.
      </p>

      <form onSubmit={handleCreateAccount} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Your Name *</label>
          <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
            placeholder="Tommy Smith" required autoFocus
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Your Email *</label>
          <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
            placeholder="tommy@clinic.com.au" required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Password *</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)}
              placeholder="••••••••" required minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all pr-10" />
            <button type="button" onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => { setStep('clinic'); clearError() }}
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Setting up...' : 'Enter Dashboard →'}
          </button>
        </div>
      </form>
    </div>
  )
}
