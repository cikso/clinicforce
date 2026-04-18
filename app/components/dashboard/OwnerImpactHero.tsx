'use client'

import { useEffect, useState } from 'react'

/**
 * Reframes 30-day operational data as an owner-facing impact statement:
 * "ClinicForce answered X calls and recovered $Y for you — about Z hours
 * your team got back."
 *
 * Rendered above the Command Centre for clinic_owner + platform_owner roles.
 * Clinic admins and staff see the standard KPI grid without this hero.
 */
export interface OwnerImpactHeroProps {
  firstName: string
  periodLabel?: string        // e.g. "last 30 days"
  callsHandled: number
  bookingsCaptured: number
  revenueRecovered: number    // AUD
  hoursSaved: number          // computed server-side from total call duration
  /**
   * True if the underlying numbers are a first-day view (no prior period to
   * compare against) — tightens the copy so we don't claim non-existent gains.
   */
  sparse?: boolean
}

export default function OwnerImpactHero({
  firstName,
  periodLabel = 'last 30 days',
  callsHandled,
  bookingsCaptured,
  revenueRecovered,
  hoursSaved,
  sparse = false,
}: OwnerImpactHeroProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 20)
    return () => window.clearTimeout(t)
  }, [])

  const currency = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(revenueRecovered)

  const headline = sparse
    ? `Welcome, ${firstName}. Here\u2019s what\u2019s happening today.`
    : `${firstName}, ClinicForce handled ${callsHandled.toLocaleString()} calls for you in the ${periodLabel}.`

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] mb-5"
      style={{
        backgroundImage:
          'radial-gradient(120% 80% at 100% 0%, rgba(0,214,143,0.08) 0%, rgba(0,214,143,0) 60%),' +
          ' linear-gradient(180deg, #ffffff 0%, #F8FBFA 100%)',
      }}
    >
      <div
        className={[
          'px-6 py-5 sm:px-8 sm:py-6 transition-all duration-500 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        ].join(' ')}
      >
        <p className="eyebrow text-[var(--brand-dark)]">Your impact · {periodLabel}</p>
        <h2 className="mt-2 text-[22px] sm:text-[26px] leading-tight font-heading font-extrabold text-[var(--text-primary)]">
          {headline}
        </h2>

        {!sparse && (
          <p className="mt-1.5 text-[14px] text-[var(--text-secondary)] max-w-[620px]">
            That&rsquo;s about{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {hoursSaved.toLocaleString()} hours
            </span>{' '}
            your team got back, and an estimated{' '}
            <span className="font-semibold text-[var(--brand-dark)]">{currency}</span>{' '}
            recovered from{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {bookingsCaptured.toLocaleString()} bookings
            </span>{' '}
            captured automatically.
          </p>
        )}

        <div
          className={[
            'mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3',
            'transition-all duration-500 ease-out delay-100',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          ].join(' ')}
        >
          <StatCell label="Calls handled" value={callsHandled.toLocaleString()} />
          <StatCell label="Bookings captured" value={bookingsCaptured.toLocaleString()} />
          <StatCell label="Revenue recovered" value={currency} accent />
          <StatCell label="Hours saved" value={hoursSaved.toLocaleString()} />
        </div>
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white/60 backdrop-blur-sm px-4 py-3">
      <p className="eyebrow text-[var(--text-tertiary)]">{label}</p>
      <p
        className={[
          'mt-1 font-heading font-extrabold tabular-nums leading-none',
          'text-[22px] tracking-[-0.01em]',
          accent ? 'text-[var(--brand-dark)]' : 'text-[var(--text-primary)]',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}
