import type { Metadata } from 'next'

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

export default function AfterHoursLayout({ children }: { children: React.ReactNode }) {
  return children
}
