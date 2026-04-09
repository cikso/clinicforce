import type { Metadata } from 'next'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.clinicforce.io'),
  title: 'ClinicForce — Phone and Front-Desk Assistant for Veterinary Clinics',
  description:
    'ClinicForce helps veterinary clinics answer calls, handle overflow, support after-hours, capture bookings, and route urgent enquiries with more control.',
  openGraph: {
    url: 'https://www.clinicforce.io',
    siteName: 'ClinicForce',
    title: 'ClinicForce — Phone and Front-Desk Assistant for Veterinary Clinics',
    description:
      'ClinicForce helps veterinary clinics answer calls, handle overflow, support after-hours, capture bookings, and route urgent enquiries with more control.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicForce — Phone and Front-Desk Assistant for Veterinary Clinics',
    description:
      'ClinicForce helps veterinary clinics answer calls, handle overflow, support after-hours, capture bookings, and route urgent enquiries with more control.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
