'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const VERTICALS = [
  { value: 'vet', label: 'Veterinary' },
  { value: 'dental', label: 'Dental' },
  { value: 'gp', label: 'General Practice' },
  { value: 'chiro', label: 'Chiropractic' },
  { value: 'allied_health', label: 'Allied Health' },
  { value: 'specialist', label: 'Specialist' },
]

const INVITE_ROLES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Vet', label: 'Vet' },
  { value: 'Nurse', label: 'Nurse' },
  { value: 'Receptionist', label: 'Receptionist' },
]

const STEPS = [
  { num: 1, label: 'Clinic Details' },
  { num: 2, label: 'AI Agent Setup' },
  { num: 3, label: 'Invite Users' },
]

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all outline-none'
const labelClass = 'block text-[13px] font-semibold text-[var(--text-primary)] mb-1.5'

export default function NewClinicPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  // Step 1: Clinic Details
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    suburb: '',
    postcode: '',
    website: '',
    vertical: 'vet',
    services: '',
    after_hours_partner: '',
    after_hours_phone: '',
    emergency_partner_address: '',
  })

  // Step 2: AI Agent Setup
  const [agentEnabled] = useState(true)
  const [agentGreeting, setAgentGreeting] = useState('')
  const [twilioPhone, setTwilioPhone] = useState('')

  // Step 3: Invite Users
  const [invites, setInvites] = useState<Array<{ email: string; role: string }>>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Receptionist')

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }
  }

  function nextStep() {
    setError('')
    if (step === 1) {
      if (!form.name.trim()) { setError('Clinic name is required.'); return }
    }
    setStep((s) => Math.min(s + 1, 3))
  }

  function prevStep() {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  function addInvite() {
    const email = inviteEmail.trim()
    if (!email) return
    if (invites.some((i) => i.email.toLowerCase() === email.toLowerCase())) {
      setError('This email has already been added.')
      return
    }
    setInvites((prev) => [...prev, { email, role: inviteRole }])
    setInviteEmail('')
    setInviteRole('Receptionist')
    setError('')
  }

  function removeInvite(index: number) {
    setInvites((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setError('')

    startTransition(async () => {
      const res = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          invites: invites.length > 0 ? invites : null,
          agent_enabled: agentEnabled,
          agent_greeting: agentGreeting.trim() || null,
          twilio_phone: twilioPhone.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError((json as { error?: string }).error ?? 'Failed to create clinic.')
        return
      }
      router.push(`/admin/clinics/${(json as { clinic_id: string }).clinic_id}`)
    })
  }

  return (
    <div className="max-w-[640px]">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 2L4 7l6 5" />
        </svg>
        All Clinics
      </Link>

      <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)] mb-1">
        Create new clinic
      </h1>
      <p className="text-[14px] text-[var(--text-secondary)] mb-6">
        Set up a clinic account in three quick steps.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                  step > s.num
                    ? 'bg-[#059669] text-white'
                    : step === s.num
                      ? 'bg-[var(--brand)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border)]'
                }`}
              >
                {step > s.num ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <span
                className={`text-[13px] font-medium hidden sm:inline ${
                  step === s.num ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-[2px] rounded-full ${
                  step > s.num ? 'bg-[#059669]' : 'bg-[var(--border)]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)]">
        {/* ── Step 1: Clinic Details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-4">
                Clinic Details
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Clinic name *</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Hills Pet Clinic"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Industry *</label>
                <select
                  value={form.vertical}
                  onChange={set('vertical')}
                  className={`${inputClass} appearance-none cursor-pointer pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                  }}
                >
                  {VERTICALS.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Clinic Phone</label>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="02 9000 0000"
                  type="tel"
                />
              </div>
              <div>
                <label className={labelClass}>Clinic Email</label>
                <input
                  className={inputClass}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="hello@clinic.com.au"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Website</label>
                <input
                  className={inputClass}
                  value={form.website}
                  onChange={set('website')}
                  placeholder="www.clinic.com.au"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Street address</label>
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={set('address')}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className={labelClass}>Suburb</label>
                <input
                  className={inputClass}
                  value={form.suburb}
                  onChange={set('suburb')}
                  placeholder="Baulkham Hills"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Postcode</label>
                <input
                  className={inputClass}
                  value={form.postcode}
                  onChange={set('postcode')}
                  placeholder="2153"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Services Offered</label>
              <textarea
                className={`${inputClass} resize-none`}
                value={form.services}
                onChange={set('services')}
                placeholder="e.g. wellness consultations, vaccinations, microchipping, desexing, dental care"
                rows={3}
              />
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Stella will use this to answer questions about what you offer
              </p>
            </div>

            {/* After-hours emergency partner */}
            <div className="p-4 rounded-lg border border-[var(--border)] space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-1">
                  After-Hours Emergency Partner
                </p>
                <p className="text-[12px] text-[var(--text-tertiary)]">
                  If a caller has an emergency outside your hours, Stella will direct them here
                </p>
              </div>

              <div>
                <label className={labelClass}>Emergency Clinic Name</label>
                <input
                  className={inputClass}
                  value={form.after_hours_partner}
                  onChange={set('after_hours_partner')}
                  placeholder="e.g. Animal Referral Hospital"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Emergency Phone</label>
                  <input
                    className={inputClass}
                    value={form.after_hours_phone}
                    onChange={set('after_hours_phone')}
                    placeholder="e.g. 02 9639 7744"
                    type="tel"
                  />
                </div>
                <div>
                  <label className={labelClass}>Emergency Address</label>
                  <input
                    className={inputClass}
                    value={form.emergency_partner_address}
                    onChange={set('emergency_partner_address')}
                    placeholder="e.g. 19 Old Northern Road, Baulkham Hills"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Step 2: AI Agent Setup ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-4">
                AI Agent Setup
              </p>
            </div>

            {/* Twilio Phone Number */}
            <div>
              <label className={labelClass}>Twilio Phone Number</label>
              <input
                className={inputClass}
                value={twilioPhone}
                onChange={(e) => setTwilioPhone(e.target.value)}
                placeholder="+61 2 XXXX XXXX"
                type="tel"
              />
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Optional. The Twilio number assigned to this clinic&apos;s AI agent.
              </p>
              {twilioPhone.trim() && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--warning-light,#FFFBEB)] border border-[var(--warning,#D97706)]/25">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)] mb-1.5">
                    Twilio Console setup required
                  </p>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    In Twilio, open this number&apos;s Voice &amp; Fax settings and set:
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-[12px] text-[var(--text-secondary)] leading-relaxed font-mono">
                    <li>• <span className="font-semibold not-italic font-sans">Incoming call webhook:</span> <code>https://app.clinicforce.io/api/twilio/incoming</code></li>
                    <li>• <span className="font-semibold not-italic font-sans">Status callback URL:</span> <code>https://app.clinicforce.io/api/twilio/status</code></li>
                    <li>• <span className="font-semibold not-italic font-sans">Events:</span> completed</li>
                  </ul>
                  <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed mt-1.5">
                    Without the status callback, call durations will be missing in the dashboard.
                  </p>
                </div>
              )}
            </div>

            {/* Greeting */}
            <div>
              <label className={labelClass}>Custom greeting (optional)</label>
              <textarea
                value={agentGreeting}
                onChange={(e) => setAgentGreeting(e.target.value)}
                placeholder="Thank you for calling Hills Pet Clinic, this is Stella speaking. How can I help you today?"
                rows={3}
                className={`${inputClass} resize-none`}
              />
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Leave empty to use the default greeting.
              </p>
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-4 rounded-lg bg-[var(--brand-light)] border border-[var(--brand)]/15">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5">
                <circle cx="9" cy="9" r="7" />
                <path d="M9 12V9M9 6h.01" />
              </svg>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Additional AI configuration (voice, ElevenLabs API key) can be set after the clinic is created from the clinic&apos;s AI Agent settings page.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: Invite Users ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-4">
                Invite Users
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--brand-light)] flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="14" height="10" rx="1.5" />
                    <path d="M1 4.5l6.5 4a1.5 1.5 0 0 0 1.6 0L15 4.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    Invite team members
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Each person will receive an email to set their password and log in. This step is optional.
                  </p>
                </div>
              </div>
            </div>

            {/* Add invite row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <label className={labelClass}>Email address</label>
                <input
                  className={inputClass}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInvite() } }}
                  placeholder="jane@clinic.com.au"
                  type="email"
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                  }}
                >
                  {INVITE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addInvite}
                className="h-[46px] px-4 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all"
              >
                Add
              </button>
            </div>

            {/* Invited users list */}
            {invites.length > 0 && (
              <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
                    {invites.length} {invites.length === 1 ? 'invite' : 'invites'} to send
                  </p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {invites.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-[var(--text-tertiary)] uppercase">
                            {inv.email.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{inv.email}</p>
                          <p className="text-[12px] text-[var(--text-tertiary)]">{inv.role}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInvite(i)}
                        className="text-[var(--text-tertiary)] hover:text-[#DC2626] transition-colors p-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M3 3l8 8M11 3l-8 8" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
                  Summary
                </p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <SummaryRow label="Clinic" value={form.name || '—'} />
                <SummaryRow label="Industry" value={VERTICALS.find((v) => v.value === form.vertical)?.label ?? form.vertical} />
                {twilioPhone.trim() && <SummaryRow label="Twilio Number" value={twilioPhone} />}
                <SummaryRow label="Users" value={invites.length > 0 ? `${invites.length} invite${invites.length === 1 ? '' : 's'}` : 'None'} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/15 mt-5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
              <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.01" />
            </svg>
            <span className="text-[13px] text-[#DC2626] font-medium">{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-[var(--border)] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 2L4 7l6 5" />
              </svg>
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all"
            >
              Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 2l6 5-6 5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isPending ? 'Creating...' : 'Create Clinic'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--text-tertiary)]">{label}</span>
      <span className="text-[13px] font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  )
}
