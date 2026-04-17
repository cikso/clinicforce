import type { Metadata } from 'next'
import ClinicForceLandingV2 from '@/components/landing/v2/ClinicForceLandingV2'

export const dynamic = 'force-static'
export const revalidate = 3600

const TITLE = 'AI Front Desk for Clinics | ClinicForce'
const DESCRIPTION =
  'ClinicForce is the AI receptionist for veterinary, dental, GP, and chiropractic clinics. Stella answers every call 24/7, triages urgency, books directly into your clinic software, and hands your team a structured clinical handover.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.clinicforce.io' },
  openGraph: {
    url: 'https://www.clinicforce.io',
    siteName: 'ClinicForce',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

// JSON-LD kept in the server page so crawlers see it without JS.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ClinicForce',
  url: 'https://www.clinicforce.io',
  description:
    'AI receptionist for veterinary, dental, GP, and chiropractic clinics. Answers calls 24/7, triages urgency, and delivers structured clinical handovers.',
  areaServed: 'Australia',
}

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ClinicForce',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '15', priceCurrency: 'AUD' },
  audience: { '@type': 'MedicalOrganization' },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <ClinicForceLandingV2 />
    </>
  )
}
