'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all outline-none'
const labelClass = 'block text-[13px] font-semibold text-[var(--text-primary)] mb-1.5'

const VERTICALS = [
  { value: 'vet', label: 'Veterinary' },
  { value: 'dental', label: 'Dental' },
  { value: 'gp', label: 'General Practice' },
  { value: 'chiro', label: 'Chiropractic' },
  { value: 'allied_health', label: 'Allied Health' },
  { value: 'specialist', label: 'Specialist' },
]

interface ClinicData {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  suburb?: string | null
  postcode?: string | null
  vertical?: string | null
  services?: string | null
  timezone?: string | null
  reception_number?: string | null
  after_hours_partner?: string | null
  after_hours_phone?: string | null
  emergency_partner_address?: string | null
  voice_phone?: string | null
}

export default function EditClinic({ clinic }: { clinic: ClinicData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: clinic.name ?? '',
    phone: clinic.phone ?? '',
    email: clinic.email ?? '',
    website: clinic.website ?? '',
    address: clinic.address ?? '',
    suburb: clinic.suburb ?? '',
    postcode: clinic.postcode ?? '',
    vertical: clinic.vertical ?? 'vet',
    services: clinic.services ?? '',
    timezone: clinic.timezone ?? '',
    reception_number: clinic.reception_number ?? '',
    after_hours_partner: clinic.after_hours_partner ?? '',
    after_hours_phone: clinic.after_hours_phone ?? '',
    emergency_partner_address: clinic.emergency_partner_address ?? '',
    twilio_phone: clinic.voice_phone ?? '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setSuccess(false)
    }
  }

  function handleCancel() {
    setForm({
      name: clinic.name ?? '',
      phone: clinic.phone ?? '',
      email: clinic.email ?? '',
      website: clinic.website ?? '',
      address: clinic.address ?? '',
      suburb: clinic.suburb ?? '',
      postcode: clinic.postcode ?? '',
      vertical: clinic.vertical ?? 'vet',
      services: clinic.services ?? '',
      timezone: clinic.timezone ?? '',
      reception_number: clinic.reception_number ?? '',
      after_hours_partner: clinic.after_hours_partner ?? '',
      after_hours_phone: clinic.after_hours_phone ?? '',
      emergency_partner_address: clinic.emergency_partner_address ?? '',
      twilio_phone: clinic.voice_phone ?? '',
    })
    setEditing(false)
    setError('')
    setSuccess(false)
  }

  async function handleSave() {
    setError('')
    if (!form.name.trim()) {
      setError('Clinic name is required.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/clinics/${clinic.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          setError((json as { error?: string }).error ?? 'Failed to update.')
          return
        }
        setSuccess(true)
        setEditing(false)
        router.refresh()
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  if (!editing) {
    return (
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)] mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
            Clinic details
          </p>
          <button
            onClick={() => { setEditing(true); setSuccess(false) }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 1.5l2 2-7 7H2.5v-2z" />
              <path d="M8 3l2 2" />
            </svg>
            Edit
          </button>
        </div>

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--success-light)] mb-4"
            style={{ border: '1px solid rgba(var(--success-rgb), 0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5.5" /><path d="M5 7l1.5 1.5L9 5.5" />
            </svg>
            <span className="text-[13px] text-[var(--success)] font-medium">Clinic details updated successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-5">
          <DetailRow label="Phone" value={clinic.phone} />
          <DetailRow label="Email" value={clinic.email} />
          <DetailRow label="Website" value={clinic.website} />
          <DetailRow label="Address" value={clinic.address} />
          <DetailRow label="Suburb" value={clinic.suburb} />
          <DetailRow label="Timezone" value={clinic.timezone} />
          <DetailRow label="Emergency partner" value={clinic.after_hours_partner} />
          <DetailRow label="Emergency phone" value={clinic.after_hours_phone} />
          <DetailRow label="Emergency address" value={clinic.emergency_partner_address} />
          <DetailRow label="Reception number" value={clinic.reception_number} />
          <DetailRow label="Twilio number" value={clinic.voice_phone} />
          <DetailRow label="Services" value={clinic.services} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)] mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-4">
        Edit clinic details
      </p>

      <div className="space-y-5">
        {/* Name & Vertical */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Clinic name *</label>
            <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Clinic name" />
          </div>
          <div>
            <label className={labelClass}>Industry</label>
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

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Clinic phone</label>
            <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="02 9000 0000" type="tel" />
          </div>
          <div>
            <label className={labelClass}>Clinic email</label>
            <input className={inputClass} value={form.email} onChange={set('email')} placeholder="hello@clinic.com.au" type="email" />
          </div>
        </div>

        {/* Website & Reception Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Website</label>
            <input className={inputClass} value={form.website} onChange={set('website')} placeholder="www.clinic.com.au" />
          </div>
          <div>
            <label className={labelClass}>Reception number</label>
            <input className={inputClass} value={form.reception_number} onChange={set('reception_number')} placeholder="+61 4XX XXX XXX" type="tel" />
            <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
              Transfer destination when AI is off. Falls back to clinic phone if empty.
            </p>
          </div>
        </div>

        {/* Address & Suburb */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Street address</label>
            <input className={inputClass} value={form.address} onChange={set('address')} placeholder="123 Main St" />
          </div>
          <div>
            <label className={labelClass}>Suburb</label>
            <input className={inputClass} value={form.suburb} onChange={set('suburb')} placeholder="Baulkham Hills" />
          </div>
        </div>

        {/* Postcode & Twilio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Postcode</label>
            <input className={inputClass} value={form.postcode} onChange={set('postcode')} placeholder="2153" />
          </div>
          <div>
            <label className={labelClass}>Twilio phone number</label>
            <input className={inputClass} value={form.twilio_phone} onChange={set('twilio_phone')} placeholder="+61 2 XXXX XXXX" type="tel" />
            <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
              The Twilio number callers dial to reach this clinic&apos;s AI agent.
            </p>
          </div>
        </div>

        {/* Services */}
        <div>
          <label className={labelClass}>Services offered</label>
          <textarea
            className={`${inputClass} resize-none`}
            value={form.services}
            onChange={set('services')}
            placeholder="e.g. wellness consultations, vaccinations, microchipping"
            rows={3}
          />
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
            Stella will use this to answer questions about what the clinic offers.
          </p>
        </div>

        {/* Emergency partner section */}
        <div className="p-4 rounded-lg border border-[var(--border)] space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-1">
              After-Hours Emergency Partner
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)]">
              If a caller has an emergency, Stella will direct them here.
            </p>
          </div>
          <div>
            <label className={labelClass}>Emergency clinic name</label>
            <input className={inputClass} value={form.after_hours_partner} onChange={set('after_hours_partner')} placeholder="e.g. Animal Referral Hospital" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Emergency phone</label>
              <input className={inputClass} value={form.after_hours_phone} onChange={set('after_hours_phone')} placeholder="e.g. 02 9639 7744" type="tel" />
            </div>
            <div>
              <label className={labelClass}>Emergency address</label>
              <input className={inputClass} value={form.emergency_partner_address} onChange={set('emergency_partner_address')} placeholder="e.g. 19 Old Northern Road" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--error-light)]"
            style={{ border: '1px solid rgba(var(--error-rgb), 0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
              <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.01" />
            </svg>
            <span className="text-[13px] text-[var(--error)] font-medium">{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="h-10 px-4 rounded-lg border border-[var(--border)] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className={`text-[14px] ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}
