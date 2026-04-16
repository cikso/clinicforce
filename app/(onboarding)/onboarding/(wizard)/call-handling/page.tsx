'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, Input, Select, SubmitButton, ErrorBanner, BackButton,
  Toggle, stepHeading, stepSubheading,
} from '../../_components'

const VERTICALS = [
  { value: 'vet',          label: 'Veterinary' },
  { value: 'dental',       label: 'Dental' },
  { value: 'gp',           label: 'General Practice' },
  { value: 'chiro',        label: 'Chiropractic' },
  { value: 'allied_health',label: 'Allied Health' },
  { value: 'specialist',   label: 'Specialist' },
]

export default function CallHandlingPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [hasEmergencyPartner, setHasEmergencyPartner] = useState(false)

  const [form, setForm] = useState({
    vertical: 'vet',
    after_hours_partner: '',
    after_hours_phone: '',
    emergency_partner_address: '',
    services: '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Only validate emergency fields if the toggle is on
    if (hasEmergencyPartner) {
      if (!form.after_hours_partner.trim()) {
        setError('Please enter the emergency partner clinic name.')
        return
      }
      if (!form.after_hours_phone.trim()) {
        setError('Please enter the emergency partner phone number.')
        return
      }
    }

    startTransition(async () => {
      const payload = {
        vertical: form.vertical,
        services: form.services,
        // Only send emergency fields if toggle is on
        ...(hasEmergencyPartner && {
          after_hours_partner: form.after_hours_partner,
          after_hours_phone: form.after_hours_phone,
          emergency_partner_address: form.emergency_partner_address,
        }),
      }

      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'call-handling', data: payload, complete: true }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save.'); return }
      router.push('/onboarding/complete')
    })
  }

  return (
    <StepCard>
      <BackButton href="/onboarding/hours" />
      <p style={stepSubheading}>Step 3 of 3</p>
      <h1 style={stepHeading}>Call handling setup</h1>
      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.925rem', color: '#6B6B6B', marginBottom: '2rem', lineHeight: 1.5 }}>
        Configure how your AI receptionist handles calls and what type of clinic you run.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Clinic type */}
        <Field label="Clinic type *" hint="Used to tailor your AI receptionist's language and triage logic.">
          <Select value={form.vertical} onChange={set('vertical')}>
            {VERTICALS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </Select>
        </Field>

        {/* Emergency partner section */}
        <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: '1.25rem' }}>

          {/* Toggle row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: hasEmergencyPartner ? '1.25rem' : 0 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.25rem' }}>
                Emergency &amp; After-Hours Partner
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: '#9B9B9B', lineHeight: 1.5 }}>
                If applicable — some clinics (e.g. dental, allied health) don&apos;t operate a 24/7 emergency referral pathway.
              </p>
            </div>
            <div style={{ flexShrink: 0, paddingTop: '0.1rem' }}>
              <Toggle
                checked={hasEmergencyPartner}
                onChange={setHasEmergencyPartner}
                label={hasEmergencyPartner ? 'Yes' : 'No'}
              />
            </div>
          </div>

          {/* Partner fields — only shown when toggled on */}
          {hasEmergencyPartner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <Field
                label="Partner clinic name *"
                hint="The emergency or after-hours clinic callers are directed to."
              >
                <Input
                  value={form.after_hours_partner}
                  onChange={set('after_hours_partner')}
                  placeholder="Sydney Animal Hospitals"
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Partner phone number *">
                  <Input
                    value={form.after_hours_phone}
                    onChange={set('after_hours_phone')}
                    placeholder="+61 2 9000 0000"
                    type="tel"
                  />
                </Field>
                <Field label="Partner address">
                  <Input
                    value={form.emergency_partner_address}
                    onChange={set('emergency_partner_address')}
                    placeholder="1 Shirley St, North Ryde"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Not applicable notice */}
          {!hasEmergencyPartner && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#F9F8F6',
              border: '1px solid #EDE9E3',
              borderRadius: 10,
              marginTop: '1rem',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.825rem', color: '#9B9B9B', lineHeight: 1.4 }}>
                No emergency partner will be configured. Your AI receptionist will advise callers to contact emergency services or visit the nearest emergency clinic.
              </p>
            </div>
          )}
        </div>

        {/* Clinic services */}
        <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: '1.25rem' }}>
          <Field
            label="Clinic services"
            hint="Brief summary of what your clinic offers. Used by your AI receptionist to answer caller questions."
          >
            <textarea
              value={form.services}
              onChange={set('services')}
              placeholder="General consultations, vaccinations, dental care, surgery, X-ray, emergency triage..."
              rows={3}
              style={{
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
                resize: 'vertical',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#00D68F')}
              onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
            />
          </Field>
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} label="Complete Setup" pendingLabel="Saving..." />
      </form>
    </StepCard>
  )
}
