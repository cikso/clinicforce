import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

const SITE_URL = 'https://www.clinicforce.io'
const SITE_NAME = 'ClinicForce'
const DEFAULT_TITLE = 'ClinicForce — AI Receptionist for Veterinary Clinics'
const DEFAULT_DESCRIPTION =
  'ClinicForce is the AI phone receptionist built for veterinary clinics. Answer every call 24/7, triage urgency, and deliver structured handover notes to your team.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | ClinicForce',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'AI receptionist veterinary clinic',
    'AI phone answering veterinary',
    'after hours vet phone answering',
    'veterinary virtual receptionist',
    'AI front desk veterinary',
    '24/7 vet phone answering Australia',
  ],
  authors: [{ name: 'ClinicForce' }],
  creator: 'ClinicForce',
  publisher: 'ClinicForce',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // TODO(seo-phase-1): replace placeholders with real verification tokens from GSC + Bing
  verification: {
    // google: 'REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN',
    // other: { 'msvalidate.01': 'REPLACE_WITH_BING_WEBMASTER_TOKEN' },
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#00D68F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU" className="antialiased">
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
