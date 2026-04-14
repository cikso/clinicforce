import type { Metadata } from 'next'
import { ClinicForceLanding } from '@/components/landing/VetDeskLanding'

export const metadata: Metadata = {
  title: 'AI Receptionist for Veterinary Clinics | ClinicForce',
  description:
    'Never miss a pet owner call again. ClinicForce AI answers every call 24/7, triages urgency, and sends your team structured handover notes. Built for Australian vet clinics.',
  alternates: { canonical: 'https://www.clinicforce.io' },
  openGraph: {
    url: 'https://www.clinicforce.io',
    siteName: 'ClinicForce',
    title: 'AI Receptionist for Veterinary Clinics | ClinicForce',
    description:
      'Never miss a pet owner call again. ClinicForce AI answers every call 24/7, triages urgency, and sends your team structured handover notes. Built for Australian vet clinics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Receptionist for Veterinary Clinics | ClinicForce',
    description:
      'Never miss a pet owner call again. ClinicForce AI answers every call 24/7, triages urgency, and sends your team structured handover notes. Built for Australian vet clinics.',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ClinicForce',
  url: 'https://www.clinicforce.io',
  description:
    'AI receptionist for veterinary clinics. ClinicForce answers every call 24/7, triages urgency, and delivers structured handover notes to clinic teams.',
  areaServed: 'Australia',
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <ClinicForceLanding />
    </>
  )
}
