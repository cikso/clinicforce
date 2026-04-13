'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react'


export default function OnboardingWizard() {
  const router = useRouter()
  const [clinicName, setClinicName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [suburb, setSuburb] = useState('')
  const [state, setState] = useState('NSW')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicName, phone, email, suburb, state }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    }

    setLoading(false)
  }

  // ── Success screen ──────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#0f2744] mb-3">
          Welcome to ClinicForce, {clinicName}!
        </h2>
        <p className="text-sm text-slate-500 mb-3 leading-relaxed">
          Your clinic coverage profile is set up and ready to go.
        </p>
        <p className="text-sm text-slate-500 mb-10 leading-relaxed">
          Head to your dashboard to activate coverage — your AI receptionist Sarah is standing by.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { emoji: '📞', label: 'Answers every call' },
            { emoji: '🏥', label: 'Triages urgency' },
            { emoji: '📋', label: 'Full handover log' },
          ].map(({ emoji, label }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-4">
              <div className="text-2xl mb-2">{emoji}</div>
              <p className="text-xs font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/overview')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#17C4BE] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Setup form ──────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg">
      <h2 className="text-2xl font-bold text-[#0f2744] mb-1">Tell us about your clinic</h2>
      <p className="text-sm text-slate-500 mb-8">This sets up your ClinicForce coverage profile.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Name *</label>
          <input
            type="text"
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
            placeholder="Baulkham Hills Pet Clinic"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17C4BE] focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="02 9000 0000"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17C4BE] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hello@clinic.com.au"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17C4BE] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Suburb & state added later in Settings */}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !clinicName || !phone}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#17C4BE] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Setting up...' : 'Launch ClinicForce →'}
        </button>
      </form>
    </div>
  )
}
