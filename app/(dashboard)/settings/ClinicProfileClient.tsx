'use client'

import { useState, useCallback } from 'react'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Toggle from '@/app/components/ui/Toggle'
import { cn } from '@/lib/utils'

/* ── Types ──────────────────────────────────────────────────────────────────── */

type DayKey = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
type DayHours = { open: boolean; start: string; end: string }
type BusinessHours = Record<DayKey, DayHours>

interface Clinic {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  suburb: string | null
  website: string | null
  vertical: string | null
  subject_label: string | null
  professional_title: string | null
  timezone: string | null
  business_hours: BusinessHours | null
  industry_config: Record<string, unknown> | null
}

const DAYS: DayKey[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_HOURS: BusinessHours = {
  Monday:    { open: true,  start: '08:00', end: '18:00' },
  Tuesday:   { open: true,  start: '08:00', end: '18:00' },
  Wednesday: { open: true,  start: '08:00', end: '18:00' },
  Thursday:  { open: true,  start: '08:00', end: '18:00' },
  Friday:    { open: true,  start: '08:00', end: '18:00' },
  Saturday:  { open: true,  start: '09:00', end: '12:00' },
  Sunday:    { open: false, start: '09:00', end: '12:00' },
}

const VERTICALS = [
  { value: 'vet',        label: 'Veterinary' },
  { value: 'dental',     label: 'Dental' },
  { value: 'gp',         label: 'GP' },
  { value: 'chiro',      label: 'Chiropractic' },
  { value: 'allied',     label: 'Allied Health' },
  { value: 'specialist', label: 'Specialist' },
]

const SUBJECT_LABELS = ['Pet', 'Patient', 'Client']

const TIMEZONES = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Darwin',
  'Australia/Hobart',
]

const INDUSTRY_PRESETS: Record<string, Record<string, unknown>> = {
  vet: {
    extra_fields: ['pet_name', 'pet_species'],
    triage_keywords: ['bleeding', 'seizure', 'breathing', 'poisoning', 'vomiting', 'collapse', 'hit by car', 'snake bite', 'tick'],
  },
  dental: {
    extra_fields: [],
    triage_keywords: ['severe pain', 'swelling', 'bleeding', 'knocked out tooth', 'broken tooth', 'abscess', 'jaw injury'],
  },
  gp: {
    extra_fields: [],
    triage_keywords: ['chest pain', 'breathing difficulty', 'bleeding', 'allergic reaction', 'seizure', 'unconscious', 'stroke symptoms'],
  },
  chiro: {
    extra_fields: [],
    triage_keywords: ['severe pain', 'numbness', 'loss of movement', 'accident', 'fall'],
  },
  allied: {
    extra_fields: [],
    triage_keywords: ['severe pain', 'post-operative concern', 'fall', 'acute injury'],
  },
  specialist: {
    extra_fields: [],
    triage_keywords: ['severe pain', 'emergency', 'post-operative complication'],
  },
}

/* ── Form field helper ──────────────────────────────────────────────────────── */

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
        {label}
      </label>
      {children}
      {note && <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{note}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors outline-none'
const selectCls = cn(inputCls, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8')

/* ── Toast ──────────────────────────────────────────────────────────────────── */

function Toast({ message, variant, onDismiss }: { message: string; variant: 'success' | 'error'; onDismiss: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-[var(--shadow-md)] border',
        variant === 'success'
          ? 'bg-[var(--success-light)] border-[var(--success)]/20 text-[var(--success)]'
          : 'bg-[var(--error-light)] border-[var(--error)]/20 text-[var(--error)]',
      )}>
        {variant === 'success' ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 7.5L6 10l4.5-6" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.01" /></svg>
        )}
        <span className="text-[13px] font-medium">{message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function ClinicProfileClient({ clinic }: { clinic: Clinic }) {
  // Profile form
  const [form, setForm] = useState({
    name: clinic.name ?? '',
    vertical: clinic.vertical ?? 'vet',
    subject_label: clinic.subject_label ?? 'Pet',
    professional_title: clinic.professional_title ?? '',
    phone: clinic.phone ?? '',
    email: clinic.email ?? '',
    address: clinic.address ?? '',
    suburb: clinic.suburb ?? '',
    website: clinic.website ?? '',
    timezone: clinic.timezone ?? 'Australia/Sydney',
  })

  // Business hours
  const [hours, setHours] = useState<BusinessHours>(
    (clinic.business_hours as BusinessHours) ?? DEFAULT_HOURS,
  )

  const [saving, setSaving] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setDay(day: DayKey, patch: Partial<DayHours>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }))
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const industryConfig = INDUSTRY_PRESETS[form.vertical] ?? INDUSTRY_PRESETS.vet
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'clinics',
          data: {
            name: form.name.trim(),
            vertical: form.vertical,
            subject_label: form.subject_label,
            professional_title: form.professional_title.trim() || null,
            phone: form.phone.trim() || null,
            email: form.email.trim() || null,
            address: form.address.trim() || null,
            suburb: form.suburb.trim() || null,
            website: form.website.trim() || null,
            timezone: form.timezone,
            industry_config: industryConfig,
          },
        }),
      })
      showToast(res.ok ? 'Profile saved successfully' : 'Failed to save profile', res.ok ? 'success' : 'error')
    } catch {
      showToast('Failed to save profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleHoursSave(e: React.FormEvent) {
    e.preventDefault()
    setSavingHours(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'clinics',
          data: { business_hours: hours },
        }),
      })
      showToast(res.ok ? 'Business hours saved' : 'Failed to save hours', res.ok ? 'success' : 'error')
    } catch {
      showToast('Failed to save hours', 'error')
    } finally {
      setSavingHours(false)
    }
  }

  return (
    <div className="space-y-5 max-w-[680px]">
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Clinic Details Card */}
      <Card header={{ title: 'Clinic Details', subtitle: 'Basic information about your clinic' }}>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Clinic Name *">
              <input
                required
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
                placeholder="e.g. Paws & Claws Vet"
              />
            </Field>
            <Field label="Industry / Vertical" note="Controls how Sarah handles calls and what fields appear in call records">
              <select
                value={form.vertical}
                onChange={(e) => setField('vertical', e.target.value)}
                className={selectCls}
              >
                {VERTICALS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Subject Label">
              <select
                value={form.subject_label}
                onChange={(e) => setField('subject_label', e.target.value)}
                className={selectCls}
              >
                {SUBJECT_LABELS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Professional Title">
              <input
                value={form.professional_title}
                onChange={(e) => setField('professional_title', e.target.value)}
                className={inputCls}
                placeholder="e.g. Veterinarian, Dentist"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className={inputCls}
                placeholder="+61 2 9000 0000"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className={inputCls}
                placeholder="info@clinic.com.au"
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className={inputCls}
                placeholder="123 Main St"
              />
            </Field>
            <Field label="Suburb">
              <input
                value={form.suburb}
                onChange={(e) => setField('suburb', e.target.value)}
                className={inputCls}
                placeholder="Sydney"
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
                className={inputCls}
                placeholder="https://yourclinic.com.au"
              />
            </Field>
            <Field label="Timezone">
              <select
                value={form.timezone}
                onChange={(e) => setField('timezone', e.target.value)}
                className={selectCls}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace('Australia/', '')}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Business Hours Card */}
      <Card header={{ title: 'Business Hours', subtitle: 'Set your clinic opening and closing times' }}>
        <form onSubmit={handleHoursSave} className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_50px_1fr_1fr] gap-3 px-1">
            <span className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold">Day</span>
            <span className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold text-center">Open</span>
            <span className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold">Opens at</span>
            <span className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold">Closes at</span>
          </div>

          {DAYS.map((day) => {
            const d = hours[day]
            return (
              <div
                key={day}
                className={cn(
                  'grid grid-cols-[1fr_50px_1fr_1fr] gap-3 items-center px-3 py-2.5 rounded-lg border transition-colors',
                  d.open
                    ? 'bg-white border-[var(--border)]'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]',
                )}
              >
                <span className={cn('text-[13px] font-medium', d.open ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]')}>
                  {day}
                </span>
                <div className="flex justify-center">
                  <Toggle checked={d.open} onChange={(v) => setDay(day, { open: v })} />
                </div>
                <input
                  type="time"
                  value={d.start}
                  disabled={!d.open}
                  onChange={(e) => setDay(day, { start: e.target.value })}
                  className={cn(inputCls, 'text-[13px] py-2 disabled:opacity-40 disabled:cursor-not-allowed')}
                />
                <input
                  type="time"
                  value={d.end}
                  disabled={!d.open}
                  onChange={(e) => setDay(day, { end: e.target.value })}
                  className={cn(inputCls, 'text-[13px] py-2 disabled:opacity-40 disabled:cursor-not-allowed')}
                />
              </div>
            )
          })}

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" loading={savingHours}>
              Save Hours
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
