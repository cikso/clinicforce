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
      <div className="rounded-xl shadow-[var(--shadow-card)] border border-[var(--border-default)] bg-[var(--bg-primary)] p-10 max-w-md w-full text-center space-y-5">
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
            <circle cx="24" cy="24" r="22" stroke="var(--error)" strokeWidth="2.5" fill="var(--error-light)" />
            <line x1="24" y1="14" x2="24" y2="28" stroke="var(--error)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="34" r="1.5" fill="var(--error)" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Something went wrong
        </h2>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {error.message || 'An unexpected error occurred'}
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--brand)' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-dark)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand)')}
          >
            Try again
          </button>
          <Link
            href="/overview"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Go to Overview
          </Link>
        </div>
      </div>
    </div>
  )
}
