import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | ClinicForce',
  description:
    'How ClinicForce collects, uses, and protects clinic and pet owner data. Aligned with the Australian Privacy Principles under the Privacy Act 1988.',
  alternates: { canonical: 'https://www.clinicforce.io/privacy' },
  openGraph: {
    url: 'https://www.clinicforce.io/privacy',
    siteName: 'ClinicForce',
    title: 'Privacy Policy | ClinicForce',
    description:
      'How ClinicForce collects, uses, and protects clinic and pet owner data.',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | ClinicForce',
    description:
      'How ClinicForce collects, uses, and protects clinic and pet owner data.',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
