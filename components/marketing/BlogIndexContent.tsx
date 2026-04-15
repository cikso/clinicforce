'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import DemoModal from '@/components/landing/DemoModal'
import type { BlogPost } from '@/lib/blog/posts'

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogIndexContent({ posts }: { posts: BlogPost[] }) {
  const [demoOpen, setDemoOpen] = useState(false)
  const openDemo = () => setDemoOpen(true)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={openDemo} />

      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(23,196,190,0.10) 0%, rgba(23,196,190,0.03) 35%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:px-8 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#E6FBF2] px-3.5 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00D68F]">
              ClinicForce blog
            </span>
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#1A1A1A] sm:text-5xl">
            The veterinary clinic AI receptionist blog.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#536171]">
            Practical guides for Australian vet practice managers — missed calls, after-hours coverage, AI vs human reception, and the operational details behind a clinic that always answers.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-8">
        <ul className="divide-y divide-[#eef1f4] border-t border-b border-[#eef1f4]">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 py-8 transition sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#1A1A1A] transition group-hover:text-[#00D68F] sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#536171] sm:text-base sm:leading-7">
                    {post.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-[#9CA3AF] transition group-hover:text-[#00D68F] sm:mt-2" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
