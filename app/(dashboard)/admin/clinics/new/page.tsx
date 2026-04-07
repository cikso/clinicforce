'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const VERTICALS = [
  { value: 'vet',          label: 'Veterinary' },
  { value: 'dental',       label: 'Dental' },
  { value: 'gp',           label: 'General Practice' },
  { value: 'chiro',        label: 'Chiropractic' },
  { value: 'allied_health',label: 'Allied Health' },
  { value: 'specialist',   label: 'Specialist' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: '#ffffff',
  border: '1px solid #E8E4DE',
  borderRadius: 10,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.95rem',
  color: '#1A1A1A',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#1A1A1A',
  display: 'block',
  marginBottom: '0.375rem',
}

export default function NewClinicPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    phone: '',
    email: '',
    address: '',
    suburb: '',
    website: '',
    vertical: 'vet',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value
      setForm((f) => {
        const next = { ...f, [key]: value }
        // Auto-generate slug from name
        if (key === 'name') {
          next.slug = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 40)
        }
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Clinic name is required.'); return }
    if (!form.slug.trim()) { setError('Slug is required.'); return }

    startTransition(async () => {
      const res = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, invite_email: inviteEmail.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to create clinic.'); return }
      router.push(`/admin/clinics/${json.clinic_id}`)
    })
  }

  return (
    <div style={{ maxWidth: 620 }}>
      {/* Back */}
      <Link
        href="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontFamily: "'DM Sans'",
          fontSize: '0.875rem',
          color: '#6B6B6B',
          textDecoration: 'none',
          marginBottom: '1.75rem',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        All Clinics
      </Link>

      <h1
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '1.875rem',
          fontWeight: 400,
          color: '#1A1A1A',
          marginBottom: '0.375rem',
        }}
      >
        Create new clinic
      </h1>
      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', color: '#6B6B6B', marginBottom: '2rem' }}>
        Set up the clinic account. Optionally send an admin invite immediately.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Section: Clinic Info */}
        <Section title="Clinic details">
          <Row>
            <Field label="Clinic name *">
              <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Hills Pet Clinic" required
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
            <Field label="URL slug *" hint="Used in your clinic's unique URL">
              <input style={inputStyle} value={form.slug} onChange={set('slug')} placeholder="hills-pet-clinic" required
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
          </Row>
          <Row>
            <Field label="Clinic type *">
              <select
                value={form.vertical}
                onChange={set('vertical')}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239B9B9B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2.5rem' }}
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
              >
                {VERTICALS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Phone">
              <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="02 9000 0000" type="tel"
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
          </Row>
          <Row>
            <Field label="Email">
              <input style={inputStyle} value={form.email} onChange={set('email')} placeholder="hello@clinic.com.au" type="email"
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
            <Field label="Website">
              <input style={inputStyle} value={form.website} onChange={set('website')} placeholder="www.clinic.com.au"
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
          </Row>
          <Row>
            <Field label="Street address">
              <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="123 Main St"
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
            <Field label="Suburb">
              <input style={inputStyle} value={form.suburb} onChange={set('suburb')} placeholder="Baulkham Hills"
                onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')} />
            </Field>
          </Row>
        </Section>

        {/* Section: First invite */}
        <Section title="Send admin invite (optional)" subtitle="An invite email will be sent to this address. The recipient sets their own password.">
          <Field label="Admin email address">
            <input
              style={inputStyle}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="owner@clinic.com.au"
              type="email"
              onFocus={(e) => (e.target.style.borderColor = '#1B6B4A')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
            />
          </Field>
        </Section>

        {/* Error */}
        {error && (
          <div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '0.875rem',
            backgroundColor: isPending ? '#4a8a6a' : '#1B6B4A',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.15s, transform 0.1s',
          }}
          onMouseDown={(e) => { if (!isPending) e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          {isPending ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'adm-spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Creating clinic...
            </>
          ) : (
            <>Create Clinic</>
          )}
        </button>
      </form>

      <style>{`@keyframes adm-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E8E4DE',
        borderRadius: 14,
        padding: '1.75rem',
        marginBottom: '1.25rem',
      }}
    >
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: subtitle ? '0.25rem' : '1.25rem' }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ fontFamily: "'DM Sans'", fontSize: '0.85rem', color: '#9B9B9B', marginBottom: '1.25rem' }}>
          {subtitle}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>{children}</div>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ fontFamily: "'DM Sans'", fontSize: '0.78rem', color: '#9B9B9B', marginTop: '0.25rem' }}>{hint}</p>}
    </div>
  )
}
