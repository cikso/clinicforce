'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import DemoModal from '@/components/landing/DemoModal'
import type { BlogPost } from '@/lib/blog/posts'
import type { ReactNode } from 'react'

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPostContent({
  post,
  body,
}: {
  post: BlogPost
  body: ReactNode
}) {
  const [demoOpen, setDemoOpen] = useState(false)
  const openDemo = () => setDemoOpen(true)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={openDemo} />

      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#536171] transition hover:text-[#17C4BE]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#17C4BE]">
            ClinicForce blog
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-[#1A1A1A] sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm font-medium text-[#536171]">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
        </header>

        <div className="mt-10">{body}</div>

        <div className="mt-16 rounded-3xl border border-[#E5E7EB] bg-[#E5F9F8] p-8">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1A1A1A]">
            See ClinicForce on a real call
          </h2>
          <p className="mt-3 text-base leading-7 text-[#536171]">
            Hear how the AI receptionist handles a real call from an Australian pet owner — book a 20-minute demo.
          </p>
          <button
            onClick={openDemo}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17C4BE] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] transition hover:bg-[#13ADA8]"
          >
            Book a demo
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>
    </main>
  )
}
