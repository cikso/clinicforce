import type { Metadata } from 'next'
import Link from 'next/link'
import {
  LogIn,
  Power,
  Inbox,
  ListChecks,
  AlertTriangle,
  Mail,
  Printer,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'

const BASE_URL = 'https://www.clinicforce.io'
const URL = `${BASE_URL}/quickstart`
const TITLE = 'Quick Start Guide | ClinicForce'
const DESCRIPTION =
  'Everything a clinic needs to start using ClinicForce — how to log in, turn Stella on or off, review calls, and action follow-ups. One page. Print-friendly.'

export const metadata: Metadata = {
  title:       TITLE,
  description: DESCRIPTION,
  alternates:  { canonical: URL },
  openGraph:   { url: URL, siteName: 'ClinicForce', title: TITLE, description: DESCRIPTION },
  twitter:     { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export const dynamic  = 'force-static'
export const revalidate = 3600

export default function QuickstartPage() {
  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <div className="print:hidden">
        <MarketingNavbar />
      </div>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20 print:py-6">
        {/* Title block */}
        <header className="mb-10 border-b border-[#E5E7EB] pb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00B578]">
                Quick start guide
              </p>
              <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
                Welcome to ClinicForce.
              </h1>
              <p className="mt-4 text-base leading-7 text-[#536171]">
                Stella is your AI receptionist — she answers the calls you can&apos;t. This page tells you
                the five things you need to know to use her safely. Keep it near reception for the
                first two weeks.
              </p>
            </div>
          </div>

          <a
            href="javascript:window.print()"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A] transition hover:bg-[#F9FAFB] print:hidden"
          >
            <Printer className="h-4 w-4" />
            Print this page
          </a>
        </header>

        {/* Section 1 */}
        <Section
          num={1}
          icon={<LogIn className="h-5 w-5" />}
          title="How to log in"
        >
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[#374151]">
            <li>
              Go to{' '}
              <a
                href="https://app.clinicforce.io"
                className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A]"
              >
                app.clinicforce.io
              </a>
            </li>
            <li>Use the email you were invited on + the password you set.</li>
            <li>
              Forgot password? Click <em>Forgot password</em> on the login screen — reset link arrives
              within 30 seconds.
            </li>
            <li>
              Five failed attempts locks your account for 15 minutes. If you get stuck, email us
              instead of retrying.
            </li>
          </ul>
        </Section>

        {/* Section 2 */}
        <Section
          num={2}
          icon={<Power className="h-5 w-5" />}
          title="How to turn Stella off (do this first if anything seems wrong)"
        >
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">
            On the <strong>Command Centre</strong> page (the first screen after login), there&apos;s a
            <strong> Coverage</strong> toggle near the top with three settings:
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F9FAFB] text-[#536171]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Setting</th>
                  <th className="px-4 py-2.5 font-semibold">What happens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                <tr>
                  <td className="px-4 py-2.5 font-medium">AI off</td>
                  <td className="px-4 py-2.5 text-[#374151]">All calls go straight to reception. Stella is silent.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">Business hours</td>
                  <td className="px-4 py-2.5 text-[#374151]">Stella answers during your opening hours.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">After hours</td>
                  <td className="px-4 py-2.5 text-[#374151]">Stella only answers outside opening hours.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-[14px] leading-6 text-[#7C2D12]">
            <strong>If Stella ever says something wrong, switch to &ldquo;AI off&rdquo; immediately.</strong>{' '}
            All further calls go back to your reception line. Then email us.
          </div>
        </Section>

        {/* Section 3 */}
        <Section
          num={3}
          icon={<Inbox className="h-5 w-5" />}
          title="Where calls land"
        >
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">
            <strong>Call Inbox</strong> (left sidebar) — every call Stella answered appears here within
            about two minutes.
          </p>
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">
            Each call shows the caller&apos;s name, phone, pet details, and an urgency badge:
          </p>
          <ul className="mt-3 space-y-2 text-[15px] leading-7 text-[#374151]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#DC2626]" />
              <span><strong className="text-[#DC2626]">EMERGENCY</strong> — call the owner back within 30 minutes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#EA580C]" />
              <span><strong className="text-[#EA580C]">URGENT</strong> — call back within 4 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#00B578]" />
              <span><strong className="text-[#00A06A]">ROUTINE</strong> — action by end of shift.</span>
            </li>
          </ul>
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">
            Click any call to see the full transcript, AI summary, and what the caller asked for.
          </p>
        </Section>

        {/* Section 4 */}
        <Section
          num={4}
          icon={<ListChecks className="h-5 w-5" />}
          title="How to action a follow-up"
        >
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">
            <strong>Action Queue</strong> (left sidebar, with a red number badge) — every call that
            needs a follow-up lands here automatically.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-[#374151]">
            <li>Click the item. Read the summary and what the caller asked for.</li>
            <li>Call the owner back.</li>
            <li>Click <strong>Mark Actioned</strong> when you&apos;re done.</li>
          </ol>
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">
            Aim for zero in the queue by end of shift.
          </p>
        </Section>

        {/* Section 5 */}
        <Section
          num={5}
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="What Stella can and can't do"
        >
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#047857]">
                <CheckCircle2 className="h-4 w-4" /> She can
              </p>
              <ul className="mt-2 space-y-1.5 text-[14px] leading-6 text-[#065F46]">
                <li>— Take appointment requests and callback details</li>
                <li>— Answer clinic hours, address, and service questions</li>
                <li>— Flag emergencies and direct them to your after-hours partner</li>
                <li>— Capture caller name, pet name, species, and symptoms</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#9A3412]">
                <XCircle className="h-4 w-4" /> She won&apos;t (yet)
              </p>
              <ul className="mt-2 space-y-1.5 text-[14px] leading-6 text-[#7C2D12]">
                <li>— Book appointments directly into your PMS</li>
                <li>— Give medical advice or diagnose anything</li>
                <li>— Send SMS reminders or surveys</li>
                <li>— Take card payments</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Red flags */}
        <section className="mt-12 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-[#991B1B]">
            <AlertTriangle className="h-5 w-5" /> Red flags — email us if you see
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-7 text-[#7F1D1D]">
            <li>A call where Stella seems confused or says something factually wrong about the clinic.</li>
            <li>A call marked EMERGENCY that isn&apos;t — or a real emergency marked ROUTINE.</li>
            <li>A call that rang in but never appeared in the Inbox within 5 minutes.</li>
            <li>Any data from another clinic showing up on your screen (shouldn&apos;t happen — tell us at once if it does).</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="mt-12 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-[#1A1A1A]">
            <Mail className="h-5 w-5" /> Contact
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-[#374151]">
            Email{' '}
            <a
              href="mailto:admin@clinicforce.io"
              className="font-medium text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A]"
            >
              admin@clinicforce.io
            </a>{' '}
            — the founder reads every message.
          </p>
          <p className="mt-2 text-[14px] leading-7 text-[#536171]">
            For the first 72 hours of your trial, the founder has given you a mobile for urgent
            after-hours issues. After that, email during business hours — mobile for urgent only.
          </p>
          <p className="mt-2 text-[14px] leading-7 text-[#536171]">
            Day 7 we&apos;ll do a review call: what worked, what didn&apos;t, what&apos;s next.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-[12px] text-[#9CA3AF]">
          <p>
            Version 1.0 · Updated April 2026 ·{' '}
            <Link href="/" className="hover:text-[#374151]">clinicforce.io</Link>
          </p>
        </footer>
      </article>
    </main>
  )
}

function Section({
  num,
  icon,
  title,
  children,
}: {
  num:      number
  icon:     React.ReactNode
  title:    string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 break-inside-avoid">
      <h2 className="flex items-center gap-3 font-heading text-xl font-semibold text-[#1A1A1A]">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00D68F] text-[12px] font-bold text-white">
          {num}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="text-[#00B578]">{icon}</span>
          {title}
        </span>
      </h2>
      <div className="mt-2 pl-10">{children}</div>
    </section>
  )
}
