import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CITIES, getCity } from '@/lib/seo/cities'
import CityLandingContent from '@/components/marketing/CityLandingContent'

const BASE_URL = 'https://www.clinicforce.io'

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export const dynamicParams = false

type Params = { city: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { city: slug } = await params
  const city = getCity(slug)
  if (!city) return {}

  const title = `AI Receptionist for Vet Clinics in ${city.name} | ClinicForce`
  const description =
    `ClinicForce is the AI receptionist for veterinary clinics in ${city.name}, ${city.state}. ` +
    `Answer every pet owner call 24/7, triage urgency, and send your team structured handover notes — built for ${city.name} vet practices.`
  const url = `${BASE_URL}/veterinary-clinics/${city.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { url, siteName: 'ClinicForce', title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params
  const city = getCity(slug)
  if (!city) notFound()

  const url = `${BASE_URL}/veterinary-clinics/${city.slug}`
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `ClinicForce — AI Receptionist for Vet Clinics in ${city.name}`,
    url,
    description:
      `AI phone receptionist for veterinary clinics in ${city.name}, ${city.state}. ` +
      `Answers calls 24/7, books appointments, and triages emergencies.`,
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'AdministrativeArea', name: city.state },
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.name,
        addressRegion: city.state,
        addressCountry: 'AU',
      },
    },
    provider: { '@type': 'Organization', name: 'ClinicForce', url: BASE_URL },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <CityLandingContent city={city} canonicalUrl={url} />
    </>
  )
}
