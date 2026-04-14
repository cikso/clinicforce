'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, Input, Textarea, SubmitButton, ErrorBanner,
  stepHeading, stepSubheading,
} from '../../_components'

export default function ClinicDetailsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    suburb: '',
    postcode: '',
    email: '',
    website: '',
    services: '',
    after_hours_partner: '',
    after_hours_phone: '',
    emergency_partner_address: '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Clinic name is required.'); return }

    startTransition(async () => {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'clinic-details', data: form }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save. Please try again.'); return }
      router.push('/onboarding/hours')
    })
  }

  return (
    <StepCard>
      <p style={stepSubheading}>Step 1 of 3</p>
      <h1 style={stepHeading}>Tell us about your clinic</h1>
      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.925rem', color: '#6B6B6B', marginBottom: '2rem', lineHeight: 1.5 }}>
        This information personalises your AI receptionist and appears in call summaries.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
        <Field label="Clinic name *">
          <Input value={form.name} onChange={set('name')} placeholder="Baulkham Hills Pet Clinic" required />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Phone number">
            <Input value={form.phone} onChange={set('phone')} placeholder="02 9000 0000" type="tel" />
          </Field>
          <Field label="Email address">
            <Input value={form.email} onChange={set('email')} placeholder="hello@clinic.com.au" type="email" />
          </Field>
        </div>

        <Field label="Street address">
          <Input value={form.address} onChange={set('address')} placeholder="123 Main Street" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Suburb / City">
            <Input value={form.suburb} onChange={set('suburb')} placeholder="Baulkham Hills" />
          </Field>
          <Field label="Postcode">
            <Input value={form.postcode} onChange={set('postcode')} placeholder="2153" />
          </Field>
        </div>

        <Field label="Website">
          <Input value={form.website} onChange={set('website')} placeholder="www.yourclinic.com.au" />
        </Field>

        <Field label="Services Offered" hint="Stella will use this to answer questions about what you offer">
          <Textarea
            value={form.services}
            onChange={set('services')}
            placeholder="e.g. wellness consultations, vaccinations, microchipping, desexing, dental care"
            rows={3}
          />
        </Field>

        {/* After-hours emergency partner */}
        <div style={{
          marginTop: '0.5rem',
          border: '1px solid #E8E4DE',
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#9B9B9B',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}>
              After-Hours Emergency Partner
            </p>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '0.78rem', color: '#9B9B9B' }}>
              If a caller has an emergency outside your hours, Stella will direct them here
            </p>
          </div>

          <Field label="Emergency Clinic Name">
            <Input
              value={form.after_hours_partner}
              onChange={set('after_hours_partner')}
              placeholder="e.g. Animal Referral Hospital"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Emergency Phone">
              <Input
                value={form.after_hours_phone}
                onChange={set('after_hours_phone')}
                placeholder="e.g. 02 9639 7744"
                type="tel"
              />
            </Field>
            <Field label="Emergency Address">
              <Input
                value={form.emergency_partner_address}
                onChange={set('emergency_partner_address')}
                placeholder="e.g. 19 Old Northern Road, Baulkham Hills"
              />
            </Field>
          </div>
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} />
      </form>
    </StepCard>
  )
}
