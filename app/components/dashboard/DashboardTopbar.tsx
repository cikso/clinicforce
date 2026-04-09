'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const ROUTE_TITLES: Record<string, string> = {
  '/overview':      'Command Centre',
  '/conversations': 'Conversations',
  '/actions':       'Action Queue',
  '/bookings':      'Bookings',
  '/insights':      'Insights',
  '/knowledge':     'Knowledge Base',
  '/sms':           'SMS Hub',
  '/settings':      'Settings',
}

interface DashboardTopbarProps {
  userName: string
}

export default function DashboardTopbar({ userName }: DashboardTopbarProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  const title = Object.entries(ROUTE_TITLES).find(([route]) =>
    pathname === route || pathname.startsWith(route + '/')
  )?.[1] ?? 'Dashboard'

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-6 bg-[var(--bg-primary)] border-b border-[var(--border)]">
      {/* Left spacer for mobile hamburger */}
      <div className="w-10 md:hidden" />

      {/* Page title */}
      <h1 className="text-[17px] font-bold text-[var(--text-primary)] font-heading whitespace-nowrap">
        {title}
      </h1>

      <div className="flex-1" />

      {/* Search bar (hidden on mobile, toggled via icon) */}
      <div className={cn(
        'hidden sm:flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-1.5 border border-[var(--border-subtle)] w-[260px]',
      )}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] shrink-0">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search calls, patients..."
          className="bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full outline-none"
        />
      </div>

      {/* Mobile search toggle */}
      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="sm:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        aria-label="Search"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 6.5a4.5 4.5 0 1 0-9 0c0 5-2 6.5-2 6.5h13s-2-1.5-2-6.5" />
          <path d="M10.3 15a1.5 1.5 0 0 1-2.6 0" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full" />
      </button>

      {/* User avatar */}
      <div className="w-[34px] h-[34px] rounded-full bg-[var(--brand)] flex items-center justify-center shrink-0 text-white text-[11px] font-bold cursor-default">
        {initials}
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 sm:hidden bg-[var(--bg-primary)] border-b border-[var(--border)] px-4 py-3 z-30">
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)] shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search calls, patients..."
              className="bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
