'use client'

import Link from 'next/link'

export default function MarketingNavbar({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-md bg-[#17C4BE] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[11px] font-mono" aria-hidden="true">
                CF
              </span>
            </div>
            <span
              className="text-[#1A1A1A] font-bold text-xl tracking-tight"
              style={{ fontFamily: 'var(--font-geist-sans)' }}
            >
              ClinicForce
            </span>
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
            <button
              onClick={onBookDemo}
              className="text-sm font-semibold text-white bg-[#17C4BE] hover:bg-[#13ADA8] transition-colors duration-150 px-4 py-2 rounded-lg cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
