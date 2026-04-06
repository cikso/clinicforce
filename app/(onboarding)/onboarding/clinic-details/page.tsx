'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, Input, SubmitButton, ErrorBanner,
  stepHeading, stepSubheading,
} from '../_components'

export default function ClinicDetailsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    suburb: '',
    email: '',
    website: '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
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
          <Field label="Website">
            <Input value={form.website} onChange={set('website')} placeholder="www.yourclinic.com.au" />
          </Field>
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} />
      </form>
    </StepCard>
  )
}
