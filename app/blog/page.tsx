import type { Metadata } from 'next'
import BlogIndexContent from '@/components/marketing/BlogIndexContent'
import { listPosts } from '@/lib/blog/posts'

export const dynamic = 'force-static'
export const revalidate = 3600

const BASE_URL = 'https://www.clinicforce.io'
const URL = `${BASE_URL}/blog`
const TITLE = 'Veterinary Clinic AI Receptionist Blog | ClinicForce'
const DESCRIPTION =
  'The ClinicForce blog — practical guides on AI reception, after-hours coverage, missed calls, and revenue for Australian veterinary clinics.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { url: URL, siteName: 'ClinicForce', title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export default function BlogIndexPage() {
  const posts = listPosts()

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ClinicForce Blog',
    url: URL,
    description: DESCRIPTION,
    inLanguage: 'en-AU',
    publisher: {
      '@type': 'Organization',
      name: 'ClinicForce',
      url: BASE_URL,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `${BASE_URL}/blog/${post.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <BlogIndexContent posts={posts} />
    </>
  )
}
