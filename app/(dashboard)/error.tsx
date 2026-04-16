'use client'

import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-xl shadow-[var(--shadow-card,0_1px_3px_rgba(15,23,42,0.04))] border border-[var(--border,#E5EAF0)] bg-[var(--bg-primary,#FFFFFF)] p-10 max-w-md w-full text-center space-y-5">
        {/* Alert icon */}
        <div className="flex justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" stroke="var(--error,#DC2626)" strokeWidth="2.5" fill="var(--error-light,#FEF2F2)" />
            <line x1="24" y1="14" x2="24" y2="28" stroke="var(--error,#DC2626)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="34" r="1.5" fill="var(--error,#DC2626)" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-[var(--text-primary,#0D0E12)]">
          Something went wrong
        </h2>

        <p className="text-sm text-[var(--text-secondary,#566275)] leading-relaxed">
          {error.message || 'An unexpected error occurred'}
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors bg-[var(--brand,#00D68F)] hover:bg-[var(--brand-hover,#00B578)]"
          >
            Try again
          </button>
          <Link
            href="/overview"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--text-secondary,#566275)] border border-[var(--border,#E5EAF0)] hover:bg-[var(--bg-hover,#F3F4F6)] transition-colors"
          >
            Go to Overview
          </Link>
        </div>
      </div>
    </div>
  )
}
