'use client'

import { useState } from 'react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import DemoModal from '@/components/landing/DemoModal'

export default function PrivacyPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={() => setDemoOpen(true)} />

      <article className="mx-auto max-w-[760px] px-6 py-16 sm:py-20">
        <header className="mb-10 border-b border-[#E5E7EB] pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[#536171]">Effective 14 April 2026</p>
        </header>

        <div className="space-y-10 text-[15px] leading-7 text-[#374151]">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">1. Who we are</h2>
            <p>
              ClinicForce is an AI front-desk platform for healthcare clinics, operated by
              ClinicForce Pty Ltd, Australia.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">2. What data we collect</h2>
            <p>
              Through our service we collect caller name, phone number, reason for call, any
              pet or patient details captured during AI calls, and clinic configuration data
              provided by account administrators.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">3. How we use it</h2>
            <p>
              We use this information to deliver the AI front-desk service, generate call
              summaries, notify clinic staff of urgent matters, and to improve the service
              over time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">4. Who we share it with</h2>
            <p>
              We share data only with the infrastructure providers required to run the
              service: Supabase (data storage), ElevenLabs (voice AI processing), Twilio
              (telephony), and Resend (transactional email). We never sell personal data to
              third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">5. Data retention</h2>
            <p>
              Call records are retained for 90 days by default. Clinic settings are retained
              while your subscription is active. On request following account cancellation,
              your data is deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">
              6. Your rights under the Australian Privacy Act 1988
            </h2>
            <p>
              Under the Australian Privacy Principles (APPs), you have the right to access
              the personal information we hold about you, request corrections, and request
              deletion. Contact us to exercise any of these rights.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">7. Contact</h2>
            <p>
              For privacy enquiries or to exercise your rights, email{' '}
              <a
                href="mailto:privacy@clinicforce.io"
                className="text-[#00D68F] underline decoration-[#00D68F]/40 underline-offset-2 hover:decoration-[#00D68F]"
              >
                privacy@clinicforce.io
              </a>
              .
            </p>
          </section>
        </div>
      </article>

      <LandingFooter />
    </main>
  )
}
