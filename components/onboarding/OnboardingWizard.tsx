'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, CheckCircle, Copy, Check } from 'lucide-react'

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

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
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please sign in again.'); setLoading(false); return }

    // Insert clinic — only columns we know exist
    const { data: clinic, error: clinicErr } = await supabase
      .from('clinics')
      .insert({ name: clinicName, phone, email, suburb, state })
      .select('id')
      .single()

    if (clinicErr || !clinic) {
      setError(clinicErr?.message ?? 'Could not create clinic. Please try again.')
      setLoading(false)
      return
    }

    // Link user to clinic
    const { error: linkErr } = await supabase
      .from('clinic_users')
      .insert({
        user_id: user.id,
        clinic_id: clinic.id,
        name: user.user_metadata?.full_name ?? user.email,
        role: 'admin',
      })

    if (linkErr) {
      setError(linkErr.message)
      setLoading(false)
      return
    }

    setClinicId(clinic.id)
    setDone(true)
    setLoading(false)
  }

  function copyId() {
    if (!clinicId) return
    navigator.clipboard.writeText(clinicId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Success screen ──────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-lg">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#0f2744] mb-1">
          You&rsquo;re live, {clinicName.split(' ')[0]}!
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Your VetDesk coverage profile is ready. Head to the dashboard to activate your first coverage window.
        </p>

        {/* Clinic ID */}
        <div className="bg-[#f0f6ff] border border-[#c8e0f4] rounded-2xl p-5 mb-6">
          <p className="text-xs font-bold text-[#0f5b8a] uppercase tracking-wide mb-3">Your Clinic ID — for webhook setup</p>
          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#c8e0f4]">
            <code className="text-sm font-mono text-[#0f5b8a] flex-1 truncate">{clinicId}</code>
            <button onClick={copyId} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/overview')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors"
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
      <p className="text-sm text-slate-500 mb-8">This sets up your VetDesk coverage profile.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Name *</label>
          <input
            type="text"
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
            placeholder="Baulkham Hills Pet Clinic"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Clinic Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hello@clinic.com.au"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Suburb</label>
            <input
              type="text"
              value={suburb}
              onChange={e => setSuburb(e.target.value)}
              placeholder="Baulkham Hills"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">State</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
            >
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !clinicName || !phone}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Setting up...' : 'Launch VetDesk →'}
        </button>
      </form>
    </div>
  )
}
