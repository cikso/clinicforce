'use client'

import { useState } from 'react'
import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import DemoModal from '@/components/landing/DemoModal'

const LAST_UPDATED = '19 April 2026'

export default function PrivacyPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={() => setDemoOpen(true)} />

      <article className="mx-auto max-w-[65ch] px-6 py-16 sm:py-20">
        <header className="mb-12 border-b border-[#E5E7EB] pb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-[#6B7280]">Last updated {LAST_UPDATED}</p>
          <p className="mt-6 text-[16px] leading-[1.75] text-[#374151]">
            ClinicForce Pty Ltd (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
            committed to protecting your personal information in accordance with the
            Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). This
            policy explains what we collect, how we use it, and your rights.
          </p>
        </header>

        <div className="space-y-12 text-[16px] leading-[1.75] text-[#374151]">
          <section aria-labelledby="who-we-are">
            <h2
              id="who-we-are"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              1. Who we are
            </h2>
            <p>
              ClinicForce Pty Ltd is an Australian company providing AI front desk
              services to healthcare clinics.
            </p>
            <p className="mt-3">
              Registered address:{' '}
              <span className="text-[#6B7280]">[to be confirmed]</span>
            </p>
          </section>

          <section aria-labelledby="what-we-collect">
            <h2
              id="what-we-collect"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              2. What information we collect
            </h2>
            <p className="mb-4">
              <strong className="font-semibold text-[#1A1A1A]">From clinics (our customers):</strong>{' '}
              business name, contact details, billing information, clinic configuration,
              and staff account details.
            </p>
            <p>
              <strong className="font-semibold text-[#1A1A1A]">
                From callers (our customers&apos; clients):
              </strong>{' '}
              name, phone number, reason for call, call audio, transcripts, and structured
              summaries generated during the call. For veterinary clinics this may include
              pet name, species, breed, and symptoms. For other verticals, limited clinical
              context relevant to triage.
            </p>
          </section>

          <section aria-labelledby="how-we-use">
            <h2
              id="how-we-use"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              3. How we use your information
            </h2>
            <ul className="mb-4 list-disc space-y-2 pl-6 marker:text-[#9CA3AF]">
              <li>To answer calls on behalf of our customer clinics</li>
              <li>To generate summaries and handover notes</li>
              <li>To provide dashboards, reporting, and analytics to our clinic customers</li>
              <li>To send service-related communications</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>
              We do not sell your information. We do not use your data to train public AI
              models.
            </p>
          </section>

          <section aria-labelledby="who-we-share">
            <h2
              id="who-we-share"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              4. Who we share it with
            </h2>
            <p className="mb-4">
              We share information with a small set of named sub-processors. See our{' '}
              <Link
                href="/trust"
                className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A] hover:decoration-[#00B578]"
              >
                Trust page
              </Link>{' '}
              for the current list.
            </p>
            <p className="mb-4">
              Our sub-processors are bound by written agreements requiring APP-equivalent
              protection.
            </p>
            <p>We do not disclose personal information to advertisers or data brokers.</p>
          </section>

          <section aria-labelledby="cross-border">
            <h2
              id="cross-border"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              5. Cross-border disclosure
            </h2>
            <p>
              Some sub-processors are located outside Australia (primarily the United
              States). We take reasonable steps under APP 8 to ensure overseas recipients
              handle personal information consistent with the APPs.
            </p>
          </section>

          <section aria-labelledby="how-we-protect">
            <h2
              id="how-we-protect"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              6. How we protect your information
            </h2>
            <ul className="list-disc space-y-2 pl-6 marker:text-[#9CA3AF]">
              <li>TLS 1.2+ in transit, AES-256 at rest</li>
              <li>Row-level security at the database layer</li>
              <li>Two-factor authentication on staff accounts</li>
              <li>Access logging and review</li>
              <li>
                Hosted on SOC 2 Type 2 certified infrastructure (AWS Sydney, via Supabase)
              </li>
            </ul>
          </section>

          <section aria-labelledby="retention">
            <h2
              id="retention"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              7. How long we keep your information
            </h2>
            <p className="mb-4">
              We retain your information for as long as you&apos;re a customer, plus 30
              days after cancellation for deletion (backups overwritten within a further
              90 days).
            </p>
            <p>Certain records may be retained longer where required by law.</p>
          </section>

          <section aria-labelledby="your-rights">
            <h2
              id="your-rights"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              8. Your rights under the APPs
            </h2>
            <ul className="mb-4 list-disc space-y-2 pl-6 marker:text-[#9CA3AF]">
              <li>
                <strong className="font-semibold text-[#1A1A1A]">Access:</strong> you may
                request access to personal information we hold about you.
              </li>
              <li>
                <strong className="font-semibold text-[#1A1A1A]">Correction:</strong> you
                may request correction of inaccurate information.
              </li>
              <li>
                <strong className="font-semibold text-[#1A1A1A]">Deletion:</strong> you may
                request deletion of your information (subject to legal retention
                requirements).
              </li>
              <li>
                <strong className="font-semibold text-[#1A1A1A]">Complaints:</strong> you
                may complain to us, and if unresolved, to the Office of the Australian
                Information Commissioner (OAIC).
              </li>
            </ul>
            <p>
              To exercise any of these rights, email{' '}
              <a
                href="mailto:privacy@clinicforce.io"
                className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A] hover:decoration-[#00B578]"
              >
                privacy@clinicforce.io
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="ndb">
            <h2
              id="ndb"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              9. Notifiable Data Breaches
            </h2>
            <p>
              We comply with the Notifiable Data Breaches (NDB) scheme under Part IIIC of
              the Privacy Act 1988. In the event of an eligible data breach, we will
              notify affected individuals and the OAIC as required by law.
            </p>
          </section>

          <section aria-labelledby="changes">
            <h2
              id="changes"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              10. Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. Material changes will be
              communicated to customers. Continued use of ClinicForce after changes
              constitutes acceptance.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2
              id="contact"
              className="mb-4 font-heading text-2xl font-semibold tracking-tight text-[#1A1A1A]"
            >
              11. Contact us
            </h2>
            <ul className="list-disc space-y-2 pl-6 marker:text-[#9CA3AF]">
              <li>
                <a
                  href="mailto:privacy@clinicforce.io"
                  className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A] hover:decoration-[#00B578]"
                >
                  privacy@clinicforce.io
                </a>{' '}
                for privacy matters
              </li>
              <li>
                OAIC:{' '}
                <a
                  href="https://www.oaic.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A] hover:decoration-[#00B578]"
                >
                  oaic.gov.au
                </a>
              </li>
            </ul>
          </section>
        </div>
      </article>

      <LandingFooter />
      {/* Privacy Policy — review annually and after any material change to data handling. Last reviewed 19 April 2026. */}
    </main>
  )
}
