'use client'

import { useState } from 'react'
import type { VoiceAgent } from '@/lib/types'

// ── Types ──────────────────────────────────────────────────────────────────
type DayKey = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
type DayHours = { open: boolean; start: string; end: string }
type BusinessHours = Record<DayKey, DayHours>

interface Clinic {
  id: string
  name: string
  slug: string
  phone: string | null
  email: string | null
  address: string | null
  suburb: string | null
  website: string | null
  vertical: string | null
  business_hours: BusinessHours | null
  after_hours_partner: string | null
  after_hours_phone: string | null
  emergency_partner_address: string | null
  services: string | null
}

const DAYS: DayKey[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_HOURS: BusinessHours = {
  Monday:    { open: true,  start: '08:00', end: '18:00' },
  Tuesday:   { open: true,  start: '08:00', end: '18:00' },
  Wednesday: { open: true,  start: '08:00', end: '18:00' },
  Thursday:  { open: true,  start: '08:00', end: '18:00' },
  Friday:    { open: true,  start: '08:00', end: '18:00' },
  Saturday:  { open: true,  start: '09:00', end: '13:00' },
  Sunday:    { open: false, start: '09:00', end: '13:00' },
}

const VERTICALS = [
  { value: 'vet',         label: 'Veterinary' },
  { value: 'dental',      label: 'Dental' },
  { value: 'gp',          label: 'General Practice' },
  { value: 'chiro',       label: 'Chiropractic' },
  { value: 'allied',      label: 'Allied Health' },
  { value: 'specialist',  label: 'Specialist' },
]

type Tab = 'clinic' | 'hours' | 'calling' | 'voice_agent'

// ── Shared UI primitives ──────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #E5E7EB',
        borderRadius: 10,
        fontSize: 14,
        color: '#111827',
        background: '#fff',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = '#0D9488'; props.onFocus?.(e) }}
      onBlur={e =>  { e.target.style.borderColor = '#E5E7EB'; props.onBlur?.(e) }}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #E5E7EB',
        borderRadius: 10,
        fontSize: 14,
        color: '#111827',
        background: '#fff',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        minHeight: 90,
        transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = '#0D9488'; props.onFocus?.(e) }}
      onBlur={e =>  { e.target.style.borderColor = '#E5E7EB'; props.onBlur?.(e) }}
    />
  )
}

function SaveButton({ saving, label = 'Save changes' }: { saving: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      style={{
        padding: '10px 24px',
        background: saving ? '#6EE7B7' : '#0D9488',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: saving ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {saving ? 'Saving…' : label}
    </button>
  )
}

function StatusBanner({ status }: { status: 'success' | 'error' | null }) {
  if (!status) return null
  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 500,
      background: status === 'success' ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${status === 'success' ? '#BBF7D0' : '#FECACA'}`,
      color: status === 'success' ? '#15803D' : '#DC2626',
    }}>
      {status === 'success' ? '✓ Changes saved successfully.' : '✗ Failed to save. Please try again.'}
    </div>
  )
}

// ── Clinic Details Tab ────────────────────────────────────────────────────
function ClinicDetailsTab({ clinic }: { clinic: Clinic }) {
  const [form, setForm] = useState({
    name:    clinic.name ?? '',
    phone:   clinic.phone ?? '',
    email:   clinic.email ?? '',
    address: clinic.address ?? '',
    suburb:  clinic.suburb ?? '',
    website: clinic.website ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'success' | 'error' | null>(null)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setStatus(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'clinic-details', data: form }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Clinic name *">
          <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Paws & Claws Vet" />
        </Field>
        <Field label="Phone number">
          <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+61 2 9000 0000" />
        </Field>
        <Field label="Email address">
          <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@clinic.com.au" />
        </Field>
        <Field label="Website">
          <Input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourclinic.com.au" />
        </Field>
        <Field label="Street address">
          <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
        </Field>
        <Field label="Suburb / City">
          <Input value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Sydney" />
        </Field>
      </div>
      <StatusBanner status={status} />
      <div>
        <SaveButton saving={saving} />
      </div>
    </form>
  )
}

// ── Opening Hours Tab ─────────────────────────────────────────────────────
function OpeningHoursTab({ clinic }: { clinic: Clinic }) {
  const [hours, setHours] = useState<BusinessHours>(
    (clinic.business_hours as BusinessHours) ?? DEFAULT_HOURS
  )
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'success' | 'error' | null>(null)

  function setDay(day: DayKey, patch: Partial<DayHours>) {
    setHours(h => ({ ...h, [day]: { ...h[day], ...patch } }))
    setStatus(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'hours', data: { business_hours: hours } }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 60px 1fr 1fr',
          gap: 12,
          padding: '8px 12px',
          background: '#F9FAFB',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 700,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Day</span>
          <span>Open</span>
          <span>Opens at</span>
          <span>Closes at</span>
        </div>

        {DAYS.map(day => {
          const d = hours[day]
          return (
            <div
              key={day}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 60px 1fr 1fr',
                gap: 12,
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 10,
                background: d.open ? '#fff' : '#F9FAFB',
                border: '1px solid',
                borderColor: d.open ? '#E5E7EB' : '#F3F4F6',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: d.open ? '#111827' : '#9CA3AF' }}>
                {day}
              </span>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => setDay(day, { open: !d.open })}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  border: 'none',
                  background: d.open ? '#0D9488' : '#D1D5DB',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 3,
                  left: d.open ? 21 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>

              {/* Time pickers */}
              <input
                type="time"
                value={d.start}
                disabled={!d.open}
                onChange={e => setDay(day, { start: e.target.value })}
                style={{
                  padding: '8px 10px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 13,
                  color: d.open ? '#111827' : '#9CA3AF',
                  background: d.open ? '#fff' : '#F9FAFB',
                  cursor: d.open ? 'pointer' : 'not-allowed',
                  outline: 'none',
                }}
              />
              <input
                type="time"
                value={d.end}
                disabled={!d.open}
                onChange={e => setDay(day, { end: e.target.value })}
                style={{
                  padding: '8px 10px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 13,
                  color: d.open ? '#111827' : '#9CA3AF',
                  background: d.open ? '#fff' : '#F9FAFB',
                  cursor: d.open ? 'pointer' : 'not-allowed',
                  outline: 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      <StatusBanner status={status} />
      <div>
        <SaveButton saving={saving} />
      </div>
    </form>
  )
}

// ── Call Handling Tab ─────────────────────────────────────────────────────
function CallHandlingTab({ clinic }: { clinic: Clinic }) {
  const [vertical, setVertical] = useState(clinic.vertical ?? 'vet')
  const [hasPartner, setHasPartner] = useState(
    !!(clinic.after_hours_partner || clinic.after_hours_phone)
  )
  const [partner, setPartner] = useState(clinic.after_hours_partner ?? '')
  const [partnerPhone, setPartnerPhone] = useState(clinic.after_hours_phone ?? '')
  const [partnerAddress, setPartnerAddress] = useState(clinic.emergency_partner_address ?? '')
  const [services, setServices] = useState(clinic.services ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'success' | 'error' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasPartner && (!partner.trim() || !partnerPhone.trim())) return
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'call-handling',
          data: {
            vertical,
            services,
            after_hours_partner:       hasPartner ? partner : '',
            after_hours_phone:         hasPartner ? partnerPhone : '',
            emergency_partner_address: hasPartner ? partnerAddress : '',
          },
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Clinic type */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Clinic type</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {VERTICALS.map(v => (
            <button
              key={v.value}
              type="button"
              onClick={() => { setVertical(v.value); setStatus(null) }}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '2px solid',
                borderColor: vertical === v.value ? '#0D9488' : '#E5E7EB',
                background: vertical === v.value ? '#F0FDFA' : '#fff',
                color: vertical === v.value ? '#0D9488' : '#374151',
                fontSize: 13,
                fontWeight: vertical === v.value ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'center',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <Field label="Services offered">
        <Textarea
          value={services}
          onChange={e => { setServices(e.target.value); setStatus(null) }}
          placeholder="e.g. consultations, vaccinations, surgery, dental, emergency care…"
          rows={3}
        />
      </Field>

      {/* Emergency partner toggle */}
      <div style={{
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#F9FAFB',
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
              Emergency partner
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
              Surfaced to callers for urgent after-hours referrals
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setHasPartner(p => !p); setStatus(null) }}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              background: hasPartner ? '#0D9488' : '#D1D5DB',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: 4,
              left: hasPartner ? 23 : 4,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {hasPartner ? (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Emergency partner name *">
                <Input
                  required={hasPartner}
                  value={partner}
                  onChange={e => { setPartner(e.target.value); setStatus(null) }}
                  placeholder="e.g. City Emergency Vet"
                />
              </Field>
              <Field label="Emergency partner phone *">
                <Input
                  required={hasPartner}
                  type="tel"
                  value={partnerPhone}
                  onChange={e => { setPartnerPhone(e.target.value); setStatus(null) }}
                  placeholder="+61 2 9000 1111"
                />
              </Field>
            </div>
            <Field label="Emergency partner address">
              <Input
                value={partnerAddress}
                onChange={e => { setPartnerAddress(e.target.value); setStatus(null) }}
                placeholder="456 Emergency Rd, Sydney"
              />
            </Field>
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            background: '#FFFBEB',
            borderTop: '1px solid #FEF3C7',
            fontSize: 13,
            color: '#92400E',
          }}>
            Not applicable for this clinic type — callers will be advised to contact emergency services if urgent.
          </div>
        )}
      </div>

      <StatusBanner status={status} />
      <div>
        <SaveButton saving={saving} />
      </div>
    </form>
  )
}

// ── Voice Agent Tab ───────────────────────────────────────────────────────
function VoiceAgentTab({ voiceAgent }: { voiceAgent: VoiceAgent | null }) {
  if (!voiceAgent) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
        background: '#F9FAFB',
        borderRadius: 10,
        border: '1px dashed #E5E7EB',
      }}>
        No voice agent is configured for this clinic yet.
      </div>
    )
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Agent ID',     value: voiceAgent.elevenlabs_agent_id || '—' },
    { label: 'Phone number', value: voiceAgent.twilio_phone_number  || '—' },
    {
      label: 'Status',
      value: (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: voiceAgent.is_active ? '#15803D' : '#9CA3AF',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: voiceAgent.is_active ? '#22C55E' : '#D1D5DB',
            display: 'inline-block',
          }} />
          {voiceAgent.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { label: 'Mode', value: voiceAgent.mode || '—' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 16,
            padding: '14px 18px',
            background: i % 2 === 0 ? '#fff' : '#F9FAFB',
            borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{row.label}</span>
          <span style={{ fontSize: 14, color: '#111827', fontFamily: typeof row.value === 'string' ? 'monospace' : 'inherit' }}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main settings page ────────────────────────────────────────────────────
export default function SettingsClient({ clinic, voiceAgent }: { clinic: Clinic; voiceAgent: VoiceAgent | null }) {
  const [tab, setTab] = useState<Tab>('clinic')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'clinic',       label: 'Clinic Details' },
    { id: 'hours',        label: 'Opening Hours' },
    { id: 'calling',      label: 'Call Handling' },
    { id: 'voice_agent',  label: 'Voice Agent' },
  ]

  return (
    <div style={{
      maxWidth: 760,
      margin: '0 auto',
      padding: '40px 24px',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
          Clinic Settings
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          Manage your clinic details, opening hours and call handling preferences.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '2px solid #F3F4F6',
        marginBottom: 32,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #0D9488' : '2px solid transparent',
              marginBottom: -2,
              fontSize: 14,
              fontWeight: tab === t.id ? 600 : 500,
              color: tab === t.id ? '#0D9488' : '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {tab === 'clinic'       && <ClinicDetailsTab  clinic={clinic} />}
        {tab === 'hours'        && <OpeningHoursTab   clinic={clinic} />}
        {tab === 'calling'      && <CallHandlingTab   clinic={clinic} />}
        {tab === 'voice_agent'  && <VoiceAgentTab     voiceAgent={voiceAgent} />}
      </div>
    </div>
  )
}
