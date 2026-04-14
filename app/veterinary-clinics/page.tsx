import type { Metadata } from 'next'
import VeterinaryClinicsHubContent from '@/components/marketing/VeterinaryClinicsHubContent'
import { CITIES } from '@/lib/seo/cities'

const BASE_URL = 'https://www.clinicforce.io'
const URL = `${BASE_URL}/veterinary-clinics`
const TITLE = 'AI Receptionist for Veterinary Clinics Australia | ClinicForce'
const DESCRIPTION =
  'ClinicForce is the AI receptionist for veterinary clinics across Australia. ' +
  'Answer every pet owner call 24/7, triage urgency, and send your team structured handover notes. ' +
  'Available in Sydney, Melbourne, Brisbane, and beyond.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { url: URL, siteName: 'ClinicForce', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ClinicForce',
  url: BASE_URL,
  description:
    'AI receptionist for veterinary clinics across Australia. Answers calls 24/7, triages urgency, and delivers structured handover notes.',
  areaServed: 'Australia',
}

export default function VeterinaryClinicsHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <VeterinaryClinicsHubContent cities={CITIES} canonicalUrl={URL} />
    </>
  )
}
