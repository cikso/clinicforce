import type { MetadataRoute } from 'next'
import { CITIES } from '@/lib/seo/cities'

const BASE_URL = 'https://www.clinicforce.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const cityEntries: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${BASE_URL}/veterinary-clinics/${c.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/after-hours`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/veterinary-clinics`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...cityEntries,
    {
      url: `${BASE_URL}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
