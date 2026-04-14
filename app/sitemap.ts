import type { MetadataRoute } from 'next'
import { CITIES } from '@/lib/seo/cities'
import { listPosts } from '@/lib/blog/posts'

const BASE_URL = 'https://www.clinicforce.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const cityEntries: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${BASE_URL}/veterinary-clinics/${c.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = listPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: 'monthly',
    priority: 0.6,
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
      url: `${BASE_URL}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
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
