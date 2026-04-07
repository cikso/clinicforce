import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.clinicforce.io'),
  title: 'VetDesk — Phone and Front-Desk Assistant for Veterinary Clinics',
  description:
    'VetDesk helps veterinary clinics answer calls, handle overflow, support after-hours, capture bookings, and route urgent enquiries with more control.',
  openGraph: {
    url: 'https://www.clinicforce.io',
    siteName: 'VetDesk',
    title: 'VetDesk — Phone and Front-Desk Assistant for Veterinary Clinics',
    description:
      'VetDesk helps veterinary clinics answer calls, handle overflow, support after-hours, capture bookings, and route urgent enquiries with more control.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VetDesk — Phone and Front-Desk Assistant for Veterinary Clinics',
    description:
      'VetDesk helps veterinary clinics answer calls, handle overflow, support after-hours, capture bookings, and route urgent enquiries with more control.',
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
