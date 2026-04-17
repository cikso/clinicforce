import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'

export const dynamic = 'force-static'
export const revalidate = 3600

const BASE_URL = 'https://www.clinicforce.io'
const URL = `${BASE_URL}/veterinary-clinics/case-studies`
const TITLE = 'Veterinary Clinic Case Studies | ClinicForce'
const DESCRIPTION =
  'Real Australian veterinary clinics running on ClinicForce. See how they recovered missed calls, freed up reception, and grew bookings.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { url: URL, siteName: 'ClinicForce', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

interface CaseStudyCard {
  slug: string
  clinic: string
  location: string
  summary: string
  headlineStat: string
  statLabel: string
  isDraft?: boolean
}

// TODO(content): replace with real pilot clinics as they go live. Each entry
// becomes its own /veterinary-clinics/case-studies/[slug] page via the
// template at app/veterinary-clinics/case-studies/example-clinic/page.tsx.
const CASE_STUDIES: CaseStudyCard[] = [
  {
    slug:         'example-clinic',
    clinic:       'Example Vet Clinic',
    location:     'Sydney, NSW',
    summary:      'How one Sydney clinic captured 58% more after-hours bookings in 30 days by handing their phones to Stella.',
    headlineStat: '+58%',
    statLabel:    'after-hours bookings',
    isDraft:      true,
  },
]

const listingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: TITLE,
  description: DESCRIPTION,
  url: URL,
  hasPart: CASE_STUDIES.filter(s => !s.isDraft).map((s) => ({
    '@type': 'Article',
    headline: `${s.clinic} — ${s.summary}`,
    url: `${BASE_URL}/veterinary-clinics/case-studies/${s.slug}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',                 item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Veterinary Clinics',   item: `${BASE_URL}/veterinary-clinics` },
    { '@type': 'ListItem', position: 3, name: 'Case Studies',         item: URL },
  ],
}

export default function CaseStudiesHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <MarketingNavbar />

      <main className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <nav className="mb-8 text-caption text-[var(--text-tertiary)]">
          <Link href="/" className="hover:text-[var(--text-primary)]">Home</Link>
          {' / '}
          <Link href="/veterinary-clinics" className="hover:text-[var(--text-primary)]">Veterinary Clinics</Link>
          {' / '}
          <span className="text-[var(--text-primary)]">Case Studies</span>
        </nav>

        <header className="mb-14">
          <p className="eyebrow text-[var(--brand-dark)] mb-4">Case studies</p>
          <h1 className="heading-1 font-heading text-[var(--text-primary)] mb-5">
            Real clinics. Real numbers.
          </h1>
          <p className="text-lead text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {DESCRIPTION}
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {CASE_STUDIES.map((s) => (
            <article
              key={s.slug}
              className="group rounded-2xl border border-[var(--border)] bg-white p-7 transition-all hover:border-[var(--brand)]/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="eyebrow text-[var(--text-tertiary)] mb-2">
                    {s.location}
                  </p>
                  <h2 className="heading-4 font-heading text-[var(--text-primary)] leading-snug">
                    {s.clinic}
                  </h2>
                </div>
                {s.isDraft && (
                  <span className="shrink-0 rounded-full bg-[var(--warning-light)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--warning)]">
                    Draft
                  </span>
                )}
              </div>

              <p className="text-body text-[var(--text-secondary)] leading-relaxed mb-8 min-h-[4.5rem]">
                {s.summary}
              </p>

              <div className="flex items-end justify-between">
                <div>
                  <p className="heading-2 font-heading text-[var(--brand)] leading-none">
                    {s.headlineStat}
                  </p>
                  <p className="text-caption text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">
                    {s.statLabel}
                  </p>
                </div>
                <Link
                  href={`/veterinary-clinics/case-studies/${s.slug}`}
                  className="text-body font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
                >
                  Read the story →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-20 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-title font-heading font-semibold text-[var(--text-primary)] mb-2">
            Want to be the next case study?
          </p>
          <p className="text-body text-[var(--text-secondary)] mb-5">
            Book a demo — we&apos;ll set up Stella for your clinic in 48 hours.
          </p>
          <Link
            href="/#cta"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-body font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
          >
            Book a demo
          </Link>
        </section>
      </main>
    </>
  )
}
