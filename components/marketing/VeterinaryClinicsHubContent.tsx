'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import DemoModal from '@/components/landing/DemoModal'
import type { City } from '@/lib/seo/cities'

export default function VeterinaryClinicsHubContent({
  cities,
  canonicalUrl,
}: {
  cities: City[]
  canonicalUrl: string
}) {
  const [demoOpen, setDemoOpen] = useState(false)
  const openDemo = () => setDemoOpen(true)

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
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#E5F9F8] px-3.5 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17C4BE]">
              Australia-wide
            </span>
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#1A1A1A] sm:text-5xl lg:text-6xl">
            AI receptionist for veterinary clinics in Australia.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#536171]">
            ClinicForce answers every pet owner call 24/7 across Australian vet clinics —
            books appointments, triages urgency, and hands clean notes back to your team.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openDemo}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17C4BE] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] transition hover:bg-[#13ADA8]"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-12">
        <section className="px-1 py-20 sm:py-24">
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#17C4BE]">
              By city
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
              Find ClinicForce in your city.
            </h2>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/veterinary-clinics/${city.slug}`}
                  className="group flex items-center justify-between rounded-3xl border border-[#d9e2ea] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#17C4BE]"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-2xl bg-[#E5F9F8] p-3 text-[#17C4BE]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tracking-[-0.02em] text-[#1A1A1A]">
                        {city.name}
                      </p>
                      <p className="text-xs font-medium text-[#536171]">{city.state}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#9CA3AF] transition group-hover:text-[#17C4BE]" />
                </Link>
              </li>
            ))}
          </ul>

          <a href={canonicalUrl} className="hidden" aria-hidden="true" tabIndex={-1}>
            Canonical
          </a>
        </section>
      </div>
    </main>
  )
}
