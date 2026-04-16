import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.clinicforce.io'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/login',
          '/onboarding',
          '/overview',
          '/conversations',
          '/calls',
          '/care-queue',
          '/bookings',
          '/referrals',
          '/actions',
          '/insights',
          '/knowledge',
          '/sms',
          '/settings',
          '/users',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
