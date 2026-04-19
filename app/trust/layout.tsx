import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Trust & Security | ClinicForce' },
  description:
    "How ClinicForce protects your clinic's data. Australian data residency, end-to-end encryption, and transparent sub-processor list.",
  alternates: { canonical: 'https://www.clinicforce.io/trust' },
  openGraph: {
    url: 'https://www.clinicforce.io/trust',
    siteName: 'ClinicForce',
    title: 'Trust & Security | ClinicForce',
    description:
      "How ClinicForce protects your clinic's data. Australian data residency, end-to-end encryption, and transparent sub-processor list.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust & Security | ClinicForce',
    description:
      "How ClinicForce protects your clinic's data. Australian data residency, end-to-end encryption, and transparent sub-processor list.",
  },
}

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return children
}
