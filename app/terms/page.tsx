'use client'

import { useState } from 'react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import DemoModal from '@/components/landing/DemoModal'

export default function TermsPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={() => setDemoOpen(true)} />

      <article className="mx-auto max-w-[760px] px-6 py-16 sm:py-20">
        <header className="mb-10 border-b border-[#E5E7EB] pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-[#536171]">Effective 14 April 2026</p>
        </header>

        <div className="space-y-10 text-[15px] leading-7 text-[#374151]">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">1. Acceptance</h2>
            <p>
              By using ClinicForce, you agree to these Terms of Service. If you do not agree,
              do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">2. Service description</h2>
            <p>
              ClinicForce is an AI-powered phone answering and triage platform for healthcare
              clinics. It is not a medical device and not an emergency service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">3. Clinic responsibilities</h2>
            <p>
              Clinics are responsible for providing accurate clinic configuration, maintaining
              their own emergency and escalation protocols, and ensuring staff review AI call
              summaries in a timely manner.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">4. Subscription and billing</h2>
            <p>
              ClinicForce is billed monthly via Stripe. You may cancel at any time from your
              dashboard. No refunds are issued for partial months.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">5. Limitation of liability</h2>
            <p>
              ClinicForce is a communication and triage assistance tool. It does not provide
              medical advice. Clinics remain solely responsible for all clinical decisions and
              patient care.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">6. Data ownership</h2>
            <p>
              Clinics own their data. ClinicForce processes it only to deliver the service
              described in these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">7. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. Clinic data remains
              available for export for 30 days following cancellation, after which it may be
              deleted.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">8. Governing law</h2>
            <p>
              These terms are governed by the laws of New South Wales, Australia.
            </p>
          </section>
        </div>
      </article>

      <LandingFooter />
    </main>
  )
}
