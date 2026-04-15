'use client'

import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DemoModalProps {
  isOpen:  boolean
  onClose: () => void
}

interface FormState {
  name:        string
  email:       string
  phone:       string
  clinic_name: string
  vertical:    string
  clinic_size: string
  message:     string
}

const EMPTY: FormState = {
  name:        '',
  email:       '',
  phone:       '',
  clinic_name: '',
  vertical:    '',
  clinic_size: '',
  message:     '',
}

// ── Small primitives ──────────────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]"
    >
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A1A] ' +
  'placeholder:text-[#BDBAB5] outline-none transition-colors ' +
  'focus:border-[#00D68F] focus:ring-2 focus:ring-[#00D68F]/10'

const selectCls =
  'w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#1A1A1A] ' +
  'outline-none transition-colors appearance-none cursor-pointer ' +
  'focus:border-[#00D68F] focus:ring-2 focus:ring-[#00D68F]/10'

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00D68F]/10 text-[#00D68F]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#1A1A1A]">
        Request received!
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
        We&apos;ll be in touch within 24 hours to schedule a demo tailored to your clinic.
      </p>
      <button
        onClick={onClose}
        className="mt-8 rounded-xl border border-[#E5E7EB] bg-white px-6 py-2.5 text-sm font-medium text-[#6B6B6B] transition hover:border-[#00D68F] hover:text-[#00D68F]"
      >
        Close
      </button>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [form,     setForm]     = useState<FormState>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  if (!isOpen) return null

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setError(null)
    }
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleClose() {
    onClose()
    setTimeout(() => { setForm(EMPTY); setSuccess(false); setError(null) }, 200)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name.trim(),
          email:       form.email.trim().toLowerCase(),
          phone:       form.phone.trim() || null,
          clinic_name: form.clinic_name.trim(),
          vertical:    form.vertical,
          clinic_size: form.clinic_size,
          message:     form.message.trim() || null,
          source:      'landing_page',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,26,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Book a Demo"
    >
      {/* Modal card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_32px_80px_rgba(0,0,0,0.18)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D68F]">
              <span className="text-[10px] font-bold tracking-wider text-white">CF</span>
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-[-0.03em] text-[#1A1A1A]">
                Book a Demo
              </h2>
              <p className="mt-0.5 text-xs text-[#6B6B6B]">
                We&apos;ll show you how ClinicForce fits your clinic.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6B6B] transition hover:bg-[#E5E7EB] hover:text-[#1A1A1A]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {success ? (
          <SuccessView onClose={handleClose} />
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">

              {/* Name */}
              <div className="sm:col-span-2">
                <Label htmlFor="dm-name">Full name *</Label>
                <input
                  id="dm-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Sarah Redmond"
                  value={form.name}
                  onChange={set('name')}
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="dm-email">Work email *</Label>
                <input
                  id="dm-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="sarah@yourvet.com.au"
                  value={form.email}
                  onChange={set('email')}
                  className={inputCls}
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="dm-phone">Phone (optional)</Label>
                <input
                  id="dm-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="02 9000 0000"
                  value={form.phone}
                  onChange={set('phone')}
                  className={inputCls}
                />
              </div>

              {/* Clinic name */}
              <div className="sm:col-span-2">
                <Label htmlFor="dm-clinic">Clinic name *</Label>
                <input
                  id="dm-clinic"
                  type="text"
                  required
                  placeholder="Baulkham Hills Pet Clinic"
                  value={form.clinic_name}
                  onChange={set('clinic_name')}
                  className={inputCls}
                />
              </div>

              {/* Vertical */}
              <div>
                <Label htmlFor="dm-vertical">Clinic type *</Label>
                <div className="relative">
                  <select
                    id="dm-vertical"
                    required
                    value={form.vertical}
                    onChange={set('vertical')}
                    className={selectCls}
                  >
                    <option value="" disabled>Select type…</option>
                    <option value="veterinary">Veterinary</option>
                    <option value="dental">Dental</option>
                    <option value="gp">General Practice</option>
                    <option value="chiro">Chiropractic</option>
                    <option value="allied_health">Allied Health</option>
                    <option value="specialist">Specialist</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#BDBAB5]"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Clinic size */}
              <div>
                <Label htmlFor="dm-size">Team size *</Label>
                <div className="relative">
                  <select
                    id="dm-size"
                    required
                    value={form.clinic_size}
                    onChange={set('clinic_size')}
                    className={selectCls}
                  >
                    <option value="" disabled>Select size…</option>
                    <option value="solo">Solo</option>
                    <option value="2-5">2–5 staff</option>
                    <option value="6-15">6–15 staff</option>
                    <option value="15+">15+ staff</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#BDBAB5]"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <Label htmlFor="dm-message">Anything you&apos;d like us to know? (optional)</Label>
                <textarea
                  id="dm-message"
                  rows={3}
                  placeholder="e.g. We're a mixed practice — mostly after-hours overflow is the pain point."
                  value={form.message}
                  onChange={set('message')}
                  className={inputCls + ' resize-none'}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <svg className="mt-px shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-xl py-3.5 text-sm font-semibold tracking-[-0.01em] text-white transition active:scale-[0.99]"
              style={{
                background: saving ? '#55DCD7' : '#00D68F',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Sending…' : 'Request a Demo'}
            </button>

            <p className="mt-3 text-center text-xs text-[#BDBAB5]">
              No commitment. We&apos;ll reach out within 24 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
