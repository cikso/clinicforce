import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.clinicforce.io'),
  title: 'ClinicForce — AI Front Desk for Clinics',
  description: 'AI-powered phone receptionist for healthcare clinics',
  openGraph: {
    url: 'https://www.clinicforce.io',
    siteName: 'ClinicForce',
    title: 'ClinicForce — AI Front Desk for Clinics',
    description: 'AI-powered phone receptionist for healthcare clinics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicForce — AI Front Desk for Clinics',
    description: 'AI-powered phone receptionist for healthcare clinics',
  },
}

export const viewport: Viewport = {
  themeColor: '#0F172A',
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
