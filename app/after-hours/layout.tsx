import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 3600 // 1h ISR — safe for marketing copy

export const metadata: Metadata = {
  title: 'After Hours Vet Phone Answering | ClinicForce',
  description:
    'Your clinic never sleeps. ClinicForce AI handles after-hours calls, captures emergencies, and routes urgent cases to your emergency partner automatically.',
  alternates: { canonical: 'https://www.clinicforce.io/after-hours' },
  openGraph: {
    url: 'https://www.clinicforce.io/after-hours',
    siteName: 'ClinicForce',
    title: 'After Hours Vet Phone Answering | ClinicForce',
    description:
      'Your clinic never sleeps. ClinicForce AI handles after-hours calls, captures emergencies, and routes urgent cases to your emergency partner automatically.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'After Hours Vet Phone Answering | ClinicForce',
    description:
      'Your clinic never sleeps. ClinicForce AI handles after-hours calls, captures emergencies, and routes urgent cases to your emergency partner automatically.',
  },
}

// ── JSON-LD rendered server-side so Googlebot sees it. FAQPage schema makes
//    us eligible for "People Also Ask" rich results; SoftwareApplication
//    schema powers app-listing rich results.
const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What hours does ClinicForce cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Stella answers calls 24/7 — evenings, weekends, and public holidays. You choose when calls forward to Stella using conditional call forwarding on your existing clinic number. No number change required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Stella book appointments after hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Stella reads your live calendar and books into available slots in real time — correct appointment type, right duration, even at 10 PM on a Sunday.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if a caller needs urgent help?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Stella recognises when a call needs a human. It can transfer the call to an on-call number, send an urgent notification, or direct the caller to an emergency partner — based on how your clinic is configured.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from a traditional answering service?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Traditional answering services take messages. Stella takes action — books appointments, answers clinic-specific questions, and updates your calendar in real time. No callback list. No Monday morning backlog.',
      },
    },
  ],
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ClinicForce',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '15', priceCurrency: 'AUD' },
  audience: { '@type': 'MedicalOrganization' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '1',
  },
}

export default function AfterHoursLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {children}
    </>
  )
}
