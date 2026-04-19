'use client'

import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export default function MarketingNavbar({ onBookDemo }: { onBookDemo?: () => void }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-center group" aria-label="ClinicForce home">
            <Logo className="h-8 md:h-10 w-auto" />
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-7">
            {([
              ['Product', '/#product-ui'],
              ['After Hours', '/after-hours'],
              ['Pricing', '/#pricing'],
              ['FAQ', '/#faq'],
            ] as [string, string][]).map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm text-slate-500 hover:text-[#1A1A1A] transition-colors duration-150 font-medium"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://app.clinicforce.io"
              className="hidden sm:block text-sm text-slate-500 hover:text-[#1A1A1A] transition-colors duration-150 font-medium px-3 py-2"
            >
              Clinic Login
            </a>
            {onBookDemo ? (
              <button
                onClick={onBookDemo}
                className="text-sm font-semibold text-white bg-[#00D68F] hover:bg-[#00B578] transition-colors duration-150 px-4 py-2 rounded-lg cursor-pointer"
              >
                Book a Demo
              </button>
            ) : (
              <Link
                href="/#cta"
                className="text-sm font-semibold text-white bg-[#00D68F] hover:bg-[#00B578] transition-colors duration-150 px-4 py-2 rounded-lg"
              >
                Book a Demo
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
