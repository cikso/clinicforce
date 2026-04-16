'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import LiveCallPulse from './LiveCallPulse'
import { CommandPaletteTrigger, OPEN_COMMAND_PALETTE_EVENT } from './CommandPalette'

const ROUTE_TITLES: Record<string, string> = {
  '/overview':      'Command Centre',
  '/conversations': 'Conversations',
  '/actions':       'Action Queue',
  '/bookings':      'Bookings',
  '/calls':         'Call Inbox',
  '/care-queue':    'Care Queue',
  '/referrals':     'Referrals',
  '/insights':      'Insights',
  '/knowledge':     'Knowledge Base',
  '/sms':           'SMS Hub',
  '/settings':      'Settings',
  '/users':         'Users',
  '/admin':         'Admin',
}

interface DashboardTopbarProps {
  userName: string
}

export default function DashboardTopbar({ userName }: DashboardTopbarProps) {
  const pathname = usePathname()

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

      {/* Live call pulse — signature moment, only visible when Stella is on a call */}
      <Suspense fallback={null}>
        <LiveCallPulse />
      </Suspense>

      <div className="flex-1" />

      {/* Command palette trigger (sm+). Mobile uses the icon button below. */}
      <CommandPaletteTrigger />

      {/* Mobile: button opens the full-screen command palette */}
      <button
        onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
        className="sm:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        aria-label="Open command palette"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]" aria-label="Notifications">
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

    </header>
  )
}
