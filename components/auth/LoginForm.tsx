'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Mode = 'signin' | 'signup'

export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
      } else {
        router.push('/overview')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-[#0f2744] mb-1">
        {mode === 'signin' ? 'Welcome back' : 'Create your account'}
      </h2>
      <p className="text-sm text-slate-500 mb-8">
        {mode === 'signin'
          ? 'Sign in to your VetDesk dashboard'
          : 'Set up your VetDesk clinic account'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane@vetclinic.com.au"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === 'signin' ? (
          <>
            New clinic?{' '}
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
              className="font-bold text-[#0ea5e9] hover:text-[#0f5b8a] transition-colors"
            >
              Get started →
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              onClick={() => { setMode('signin'); setError(null); setSuccess(null) }}
              className="font-bold text-[#0ea5e9] hover:text-[#0f5b8a] transition-colors"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">← Back to home</Link>
      </p>
    </div>
  )
}
