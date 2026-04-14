import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostContent from '@/components/marketing/BlogPostContent'
import { POSTS, getPost } from '@/lib/blog/posts'
import { renderMarkdown } from '@/lib/blog/markdown'

const BASE_URL = 'https://www.clinicforce.io'

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = false

type Params = { slug: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  const url = `${BASE_URL}/blog/${post.slug}`
  const title = `${post.title} | ClinicForce`

  return {
    title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      url,
      type: 'article',
      siteName: 'ClinicForce',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `${BASE_URL}/blog/${post.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'en-AU',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'ClinicForce', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'ClinicForce', url: BASE_URL },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostContent post={post} body={renderMarkdown(post.content)} />
    </>
  )
}
