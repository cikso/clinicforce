import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.clinicforce.io'),
  title: 'ClinicForce — AI Front Desk for Veterinary Clinics',
  description: 'ClinicForce intelligently handles your calls, captures patient details, and triages urgency 24/7.',
  openGraph: {
    url: 'https://www.clinicforce.io',
    siteName: 'ClinicForce',
    title: 'ClinicForce — AI Front Desk for Veterinary Clinics',
    description: 'ClinicForce intelligently handles your calls, captures patient details, and triages urgency 24/7.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicForce — AI Front Desk for Veterinary Clinics',
    description: 'ClinicForce intelligently handles your calls, captures patient details, and triages urgency 24/7.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
