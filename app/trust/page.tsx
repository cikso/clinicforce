'use client'

import { useState } from 'react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import DemoModal from '@/components/landing/DemoModal'
import {
  Shield,
  Lock,
  MapPin,
  Database,
  KeyRound,
  FileCheck2,
  Server,
  Phone,
  Mic2,
  CreditCard,
  Cloud,
  Scale,
  Mail,
} from 'lucide-react'

const LAST_UPDATED = '19 April 2026'

type Feature = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  description: string
}

const PROTECTION_FEATURES: Feature[] = [
  {
    icon: Lock,
    title: 'Encrypted everywhere',
    description:
      'TLS 1.2+ in transit and AES-256 at rest, on by default across every service.',
  },
  {
    icon: Database,
    title: 'Row-level isolation',
    description:
      "Row-level security at the database layer — one clinic's data is architecturally isolated from another's.",
  },
  {
    icon: KeyRound,
    title: 'Two-factor authentication',
    description:
      'Available on every staff account, with enforcement options for clinic administrators.',
  },
  {
    icon: FileCheck2,
    title: 'Logged and reviewed',
    description:
      'Access to sensitive data is logged and reviewed, with anomaly alerts on our internal systems.',
  },
]

type SubProcessor = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  provider: string
  purpose: string
  certification: string
}

const SUBPROCESSORS: SubProcessor[] = [
  {
    icon: Database,
    provider: 'Data centre',
    purpose: 'Database and file storage (AWS Sydney)',
    certification: 'SOC 2 Type 2',
  },
  {
    icon: Phone,
    provider: 'Telephony',
    purpose: 'Phone & SMS',
    certification: 'ISO 27001, SOC 2 Type 2',
  },
  {
    icon: Mic2,
    provider: 'Voice AI',
    purpose: 'Real-time speech synthesis and transcription',
    certification: 'SOC 2 Type 2',
  },
  {
    icon: CreditCard,
    provider: 'Payments',
    purpose: 'Subscription billing',
    certification: 'PCI-DSS Level 1, ISO 27001',
  },
  {
    icon: Cloud,
    provider: 'Hosting',
    purpose: 'Web application hosting',
    certification: 'SOC 2 Type 2, ISO 27001',
  },
]

export default function TrustPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={() => setDemoOpen(true)} />

      <article className="mx-auto max-w-[880px] px-6 py-16 sm:py-20">
        <header className="mb-14 border-b border-[#E5E7EB] pb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFB] px-3 py-1 text-xs font-medium text-[#374151]">
            <Shield className="h-3.5 w-3.5 text-[#00B578]" strokeWidth={2.25} />
            Trust &amp; Security
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
            Your data, protected.
          </h1>
          <p className="mt-4 max-w-[640px] text-lg leading-7 text-[#374151]">
            We&apos;re built for Australian clinics and take the protection of your
            clinic&apos;s data seriously. Here&apos;s exactly what we do.
          </p>
          <p className="mt-4 text-sm text-[#6B7280]">Last updated {LAST_UPDATED}</p>
        </header>

        <div className="space-y-16 text-[15px] leading-7 text-[#374151]">
          {/* 2. Where your data lives */}
          <section aria-labelledby="where-your-data-lives">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#00B578]" strokeWidth={2.25} />
              <h2
                id="where-your-data-lives"
                className="font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
              >
                Where your data lives
              </h2>
            </div>
            <p>
              Your clinic&apos;s data is stored in Australia — specifically AWS Sydney —
              on SOC 2 Type 2 certified infrastructure used by thousands of businesses
              worldwide. It never leaves Australian infrastructure at rest.
            </p>
          </section>

          {/* 3. How it's protected */}
          <section aria-labelledby="how-its-protected">
            <div className="mb-5 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#00B578]" strokeWidth={2.25} />
              <h2
                id="how-its-protected"
                className="font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
              >
                How it&apos;s protected
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PROTECTION_FEATURES.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#D1D5DB]"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FBF2]">
                    <Icon className="h-4 w-4 text-[#00B578]" strokeWidth={2.25} />
                  </div>
                  <h3 className="mb-1.5 font-heading text-base font-semibold text-[#1A1A1A]">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-6 text-[#536171]">{description}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Who processes your data */}
          <section aria-labelledby="who-processes-your-data">
            <div className="mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-[#00B578]" strokeWidth={2.25} />
              <h2
                id="who-processes-your-data"
                className="font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
              >
                Who processes your data
              </h2>
            </div>
            <p className="mb-6">
              We use a small number of specialist infrastructure providers, each certified
              and contracted. We never sell, share with advertisers, or hand data to brokers.
            </p>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#E5E7EB] sm:block">
              <table className="w-full border-collapse text-left text-[14px]">
                <thead>
                  <tr className="bg-[#F8FAFB] text-[12px] font-semibold uppercase tracking-wide text-[#536171]">
                    <th scope="col" className="px-5 py-3">
                      Provider
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Purpose
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Certification
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map(
                    ({ icon: Icon, provider, purpose, certification }, i) => (
                      <tr
                        key={provider}
                        className={
                          i === SUBPROCESSORS.length - 1
                            ? ''
                            : 'border-b border-[#E5E7EB]'
                        }
                      >
                        <td className="px-5 py-4 font-medium text-[#1A1A1A]">
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className="h-4 w-4 text-[#536171]"
                              strokeWidth={2.25}
                            />
                            {provider}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#374151]">{purpose}</td>
                        <td className="px-5 py-4 text-[#374151]">{certification}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <ul className="space-y-3 sm:hidden">
              {SUBPROCESSORS.map(({ icon: Icon, provider, purpose, certification }) => (
                <li
                  key={provider}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#536171]" strokeWidth={2.25} />
                    <p className="font-heading text-base font-semibold text-[#1A1A1A]">
                      {provider}
                    </p>
                  </div>
                  <dl className="space-y-1.5 text-[13px]">
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-[#6B7280]">Purpose</dt>
                      <dd className="text-[#374151]">{purpose}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-[#6B7280]">Certification</dt>
                      <dd className="text-[#374151]">{certification}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. AI and your calls */}
          <section aria-labelledby="ai-and-your-calls">
            <div className="mb-4 flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-[#00B578]" strokeWidth={2.25} />
              <h2
                id="ai-and-your-calls"
                className="font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
              >
                AI and your calls
              </h2>
            </div>
            <p>
              The AI models powering our conversations are contractually prohibited from
              training on your data. This is guaranteed by our voice provider&apos;s
              agreements with the underlying model providers. We configure call data
              retention to the minimum needed for your clinic to operate, and we can delete
              transcripts and recordings on request.
            </p>
          </section>

          {/* 6. Australian privacy law */}
          <section aria-labelledby="australian-privacy-law">
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#00B578]" strokeWidth={2.25} />
              <h2
                id="australian-privacy-law"
                className="font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
              >
                Australian privacy law
              </h2>
            </div>
            <p className="mb-5">
              We&apos;re built around the Australian Privacy Principles (APPs) under the
              Privacy Act 1988 (Cth) — not retrofitted from an overseas system.
            </p>
            <ul className="space-y-2.5">
              {[
                'Breach notification under the Notifiable Data Breaches (NDB) scheme (72-hour clock)',
                'Data export and deletion on request',
                'Transparent cross-border disclosure for sub-processors outside Australia',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00B578]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 8. Contact */}
          <section
            aria-labelledby="contact"
            className="border-t border-[#E5E7EB] pt-10 text-center"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E6FBF2]">
              <Mail className="h-4.5 w-4.5 text-[#00B578]" strokeWidth={2.25} />
            </div>
            <h2
              id="contact"
              className="mb-2 font-heading text-xl font-semibold text-[#1A1A1A]"
            >
              Questions?
            </h2>
            <p>
              Email{' '}
              <a
                href="mailto:admin@clinicforce.io"
                className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A] hover:decoration-[#00B578]"
              >
                admin@clinicforce.io
              </a>{' '}
              — the founder reads every message.
            </p>
          </section>
        </div>
      </article>

      <LandingFooter />
    </main>
  )
}
