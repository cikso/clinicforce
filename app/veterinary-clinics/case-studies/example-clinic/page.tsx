import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'

export const dynamic = 'force-static'
export const revalidate = 3600

// ─── CASE STUDY TEMPLATE ──────────────────────────────────────────────────
// Duplicate this directory to add a new case study:
//   app/veterinary-clinics/case-studies/[slug]/page.tsx
// Replace every TODO(content) marker with the real clinic's data. Keep the
// structure — the JSON-LD schema + heading hierarchy is what wins the SERP
// rich result.

const BASE_URL = 'https://www.clinicforce.io'
const SLUG = 'example-clinic'
const URL = `${BASE_URL}/veterinary-clinics/case-studies/${SLUG}`

// TODO(content): replace all fields below with real clinic data
const CASE = {
  clinic:       'Example Vet Clinic',      // TODO
  suburb:       'Chatswood',               // TODO
  city:         'Sydney',                  // TODO
  state:        'NSW',                     // TODO
  teamSize:     '6 vets, 12 support staff',// TODO
  goLiveDate:   'TODO: Month Year',
  heroStat:     '+58%',                    // TODO
  heroLabel:    'after-hours bookings',
  intro:        'TODO(content): one-paragraph hook — who they are, what was broken, what Stella fixed.',
  beforeBullets: [
    'TODO: missed 14 calls per week after 5pm',
    'TODO: reception working until 7pm most nights',
    'TODO: no visibility into what callers wanted',
  ],
  afterBullets: [
    'TODO: zero missed calls after-hours',
    'TODO: 58% more bookings arriving overnight',
    'TODO: reception off the phone by 5:30pm',
  ],
  metrics: [
    { value: '+58%', label: 'after-hours bookings' },
    { value: '0',    label: 'missed calls / week' },
    { value: '90m',  label: 'reception time saved / day' },
    { value: '$4.2k',label: 'revenue recovered / month' },
  ],
  pullQuote:    '"TODO: real quote from the clinic principal — keep it concrete and specific, not a generic testimonial."',
  quoteAuthor:  'TODO: Dr Name, Principal',
}

const TITLE = `${CASE.clinic} case study — ${CASE.heroStat} ${CASE.heroLabel} | ClinicForce`
const DESCRIPTION = `${CASE.clinic} in ${CASE.suburb}, ${CASE.city} captured ${CASE.heroStat} more ${CASE.heroLabel} after switching to Stella. Here's what changed.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { url: URL, siteName: 'ClinicForce', title: TITLE, description: DESCRIPTION, type: 'article' },
  twitter:  { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  author: { '@type': 'Organization', name: 'ClinicForce' },
  publisher: {
    '@type': 'Organization',
    name: 'ClinicForce',
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/og/logo.png` },
  },
  mainEntityOfPage: URL,
  about: {
    '@type': 'VeterinaryCare',
    name: CASE.clinic,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CASE.suburb,
      addressRegion: CASE.state,
      addressCountry: 'AU',
    },
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',                 item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Veterinary Clinics',   item: `${BASE_URL}/veterinary-clinics` },
    { '@type': 'ListItem', position: 3, name: 'Case Studies',         item: `${BASE_URL}/veterinary-clinics/case-studies` },
    { '@type': 'ListItem', position: 4, name: CASE.clinic,            item: URL },
  ],
}

export default function CaseStudyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <MarketingNavbar />

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Breadcrumb */}
        <nav className="mb-8 text-caption text-[var(--text-tertiary)]">
          <Link href="/" className="hover:text-[var(--text-primary)]">Home</Link>
          {' / '}
          <Link href="/veterinary-clinics/case-studies" className="hover:text-[var(--text-primary)]">Case Studies</Link>
          {' / '}
          <span className="text-[var(--text-primary)]">{CASE.clinic}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <p className="eyebrow text-[var(--brand-dark)] mb-4">
            {CASE.suburb}, {CASE.city} · {CASE.state}
          </p>
          <h1 className="heading-1 font-heading text-[var(--text-primary)] mb-6 leading-[1.08]">
            {CASE.clinic}: <span className="text-[var(--brand)]">{CASE.heroStat}</span> {CASE.heroLabel}
          </h1>
          <p className="text-lead text-[var(--text-secondary)] leading-relaxed">
            {CASE.intro}
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-small text-[var(--text-secondary)]">
            <div>
              <dt className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-semibold">Team</dt>
              <dd className="font-semibold text-[var(--text-primary)]">{CASE.teamSize}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-semibold">Live since</dt>
              <dd className="font-semibold text-[var(--text-primary)]">{CASE.goLiveDate}</dd>
            </div>
          </dl>
        </header>

        {/* Metrics grid */}
        <section className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CASE.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="heading-3 font-heading text-[var(--brand)] leading-none">{m.value}</p>
              <p className="text-caption text-[var(--text-tertiary)] mt-2 uppercase tracking-wider">
                {m.label}
              </p>
            </div>
          ))}
        </section>

        {/* Before / after */}
        <section className="mb-14 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="eyebrow text-[var(--text-tertiary)] mb-3">Before ClinicForce</p>
            <ul className="space-y-2.5 text-body text-[var(--text-secondary)] leading-relaxed">
              {CASE.beforeBullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-[var(--text-tertiary)]">—</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-light)] p-6">
            <p className="eyebrow text-[var(--brand-dark)] mb-3">After ClinicForce</p>
            <ul className="space-y-2.5 text-body text-[var(--text-primary)] leading-relaxed">
              {CASE.afterBullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-[var(--brand)]">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pull quote */}
        <blockquote className="mb-16 border-l-4 border-[var(--brand)] pl-6 py-2">
          <p className="heading-4 font-heading font-medium text-[var(--text-primary)] leading-snug italic">
            {CASE.pullQuote}
          </p>
          <cite className="mt-3 block not-italic text-small text-[var(--text-tertiary)]">
            — {CASE.quoteAuthor}, {CASE.clinic}
          </cite>
        </blockquote>

        {/* CTA */}
        <section className="rounded-2xl bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-title font-heading font-semibold text-[var(--text-primary)] mb-2">
            Ready to be the next story?
          </p>
          <p className="text-body text-[var(--text-secondary)] mb-5">
            Stella is live in 48 hours. No new phone number. No lock-in.
          </p>
          <Link
            href="/#cta"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-body font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
          >
            Book a demo
          </Link>
        </section>
      </article>
    </>
  )
}
