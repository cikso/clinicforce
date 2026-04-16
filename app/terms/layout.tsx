import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | ClinicForce',
  description:
    'ClinicForce terms of service for veterinary clinics — plan terms, acceptable use, data ownership, and cancellation policy.',
  alternates: { canonical: 'https://www.clinicforce.io/terms' },
  openGraph: {
    url: 'https://www.clinicforce.io/terms',
    siteName: 'ClinicForce',
    title: 'Terms of Service | ClinicForce',
    description:
      'Plan terms, acceptable use, data ownership, and cancellation policy for ClinicForce.',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | ClinicForce',
    description:
      'Plan terms, acceptable use, data ownership, and cancellation policy for ClinicForce.',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
