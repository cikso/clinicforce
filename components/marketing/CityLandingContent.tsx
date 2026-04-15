'use client'

import { useState } from 'react'
import { ArrowRight, Check, Clock, PhoneIncoming, Siren } from 'lucide-react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import DemoModal from '@/components/landing/DemoModal'
import type { City } from '@/lib/seo/cities'

export default function CityLandingContent({ city, canonicalUrl }: { city: City; canonicalUrl: string }) {
  const [demoOpen, setDemoOpen] = useState(false)
  const openDemo = () => setDemoOpen(true)

  const features: [string, string, React.ComponentType<{ className?: string }>][] = [
    [
      `Built for ${city.name} vet clinics`,
      `Tuned for the way ${city.name} pet owners call — appointments, repeat scripts, after-hours emergencies. Every call answered in seconds.`,
      PhoneIncoming,
    ],
    [
      'Around-the-clock cover',
      `Evenings, weekends, public holidays in ${city.state}. Stella picks up while your team focuses on the patient in front of them.`,
      Clock,
    ],
    [
      'Triage that protects pets',
      `Urgency is detected on the call. Critical cases are escalated to your on-call vet or your ${city.name} emergency partner — never lost in voicemail.`,
      Siren,
    ],
  ]

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={openDemo} />

      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(23,196,190,0.10) 0%, rgba(23,196,190,0.03) 35%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:px-8 sm:py-28 lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#E6FBF2] px-3.5 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00D68F]">
              {city.name}, {city.state}
            </span>
          </div>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#1A1A1A] sm:text-5xl lg:text-6xl">
            AI receptionist for vet clinics in {city.name}.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#536171]">
            ClinicForce answers every pet owner call 24/7 — books appointments, triages
            urgency, and sends your {city.name} team structured handover notes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openDemo}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00D68F] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] transition hover:bg-[#00B578]"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[`Live in 1–2 business days`, `Built for Australian vet practices`, `No lock-in contracts`].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#00D68F]" />
                <span className="text-xs font-medium text-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-12">
        <section className="px-1 py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
              Why {city.name} clinics choose ClinicForce
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
              Every call answered. Every pet accounted for.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map(([title, body, Icon]) => (
              <article
                key={title}
                className="rounded-3xl border border-[#d9e2ea] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-[#E6FBF2] p-3 text-[#00D68F]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6f7e]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-1 py-20 sm:py-24">
          <div className="rounded-[36px] border border-[#E5E7EB] bg-[#E6FBF2] px-6 py-14 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[#1A1A1A] sm:text-5xl">
                Run a calmer {city.name} clinic.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#556475]">
                See how ClinicForce handles a real call from a {city.name} pet owner — book a 20-minute demo.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={openDemo}
                className="inline-flex items-center justify-center rounded-2xl bg-[#00D68F] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] transition hover:bg-[#00B578]"
              >
                Book a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <a
                href={canonicalUrl}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              >
                Canonical
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
