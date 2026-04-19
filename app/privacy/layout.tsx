import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | ClinicForce' },
  description:
    'How ClinicForce handles personal information under the Australian Privacy Act 1988 and APPs.',
  alternates: { canonical: 'https://www.clinicforce.io/privacy' },
  openGraph: {
    url: 'https://www.clinicforce.io/privacy',
    siteName: 'ClinicForce',
    title: 'Privacy Policy | ClinicForce',
    description:
      'How ClinicForce handles personal information under the Australian Privacy Act 1988 and APPs.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | ClinicForce',
    description:
      'How ClinicForce handles personal information under the Australian Privacy Act 1988 and APPs.',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
