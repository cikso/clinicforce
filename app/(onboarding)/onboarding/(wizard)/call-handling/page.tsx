'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, Input, Select, Textarea, SubmitButton, ErrorBanner, BackButton,
  Toggle, stepHeading, stepSubheading, StepDescription,
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

      // Step 3 saves + advances to urgent-rules. Completion flag is set by
      // urgent-rules (the actual final step) — firing it here would flip
      // `onboarding_completed` true before the urgent rules are saved, which
      // is the behaviour this edit fixes.
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'call-handling', data: payload }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save.'); return }
      router.push('/onboarding/urgent-rules')
    })
  }

  return (
    <StepCard>
      <BackButton href="/onboarding/hours" />
      <p style={stepSubheading}>Step 3 of 4</p>
      <h1 style={stepHeading}>Call handling setup</h1>
      <StepDescription>
        Configure how your AI receptionist handles calls and what type of clinic you run.
      </StepDescription>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Clinic type */}
        <Field label="Clinic type *" hint="Used to tailor your AI receptionist's language and triage logic.">
          <Select value={form.vertical} onChange={set('vertical')}>
            {VERTICALS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </Select>
        </Field>

        {/* Emergency partner section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>

          {/* Toggle row */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: hasEmergencyPartner ? '18px' : 0,
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px',
                marginTop: 0,
              }}>
                Emergency &amp; after-hours partner
              </p>
              <p style={{
                fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                If applicable — some clinics (e.g. dental, allied health) don&apos;t operate a 24/7 emergency referral pathway.
              </p>
            </div>
            <div style={{ flexShrink: 0, paddingTop: '2px' }}>
              <Toggle
                checked={hasEmergencyPartner}
                onChange={setHasEmergencyPartner}
                label={hasEmergencyPartner ? 'Yes' : 'No'}
              />
            </div>
          </div>

          {/* Partner fields — only shown when toggled on */}
          {hasEmergencyPartner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              marginTop: '16px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{
                fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                margin: 0,
              }}>
                No emergency partner will be configured. Your AI receptionist will advise callers to contact emergency services or visit the nearest emergency clinic.
              </p>
            </div>
          )}
        </div>

        {/* Clinic services */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <Field
            label="Clinic services"
            hint="Brief summary of what your clinic offers. Used by your AI receptionist to answer caller questions."
          >
            <Textarea
              value={form.services}
              onChange={set('services')}
              placeholder="General consultations, vaccinations, dental care, surgery, X-ray, emergency triage..."
              rows={3}
            />
          </Field>
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} label="Continue" pendingLabel="Saving..." />
      </form>
    </StepCard>
  )
}
