'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import StatusDot from '@/app/components/ui/StatusDot'

/* ─── Inline SVG Icons (18px) ─── */
const icons = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
    </svg>
  ),
  list: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h9M6 9h9M6 14h9" />
      <circle cx="3" cy="4" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="3" cy="9" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="3" cy="14" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.5" width="14" height="12" rx="1.5" />
      <path d="M2 7.5h14M6 2v3M12 2v3" />
    </svg>
  ),
  barChart: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 16V7M9 16V2M3 16v-5" />
    </svg>
  ),
  book: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14.5c1.5-1 3.5-1 5 0V4c-1.5-1-3.5-1-5 0v10.5zM16 14.5c-1.5-1-3.5-1-5 0V4c1.5-1 3.5-1 5 0v10.5z" />
    </svg>
  ),
  message: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h12a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 13H6l-3.5 3V4.5A1.5 1.5 0 0 1 3 3z" />
    </svg>
  ),
  cog: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M14.7 11.1a1.2 1.2 0 0 0 .2 1.3l.1.1a1.4 1.4 0 1 1-2 2l-.1-.1a1.2 1.2 0 0 0-1.3-.2 1.2 1.2 0 0 0-.7 1.1v.2a1.4 1.4 0 1 1-2.8 0v-.1a1.2 1.2 0 0 0-.8-1.1 1.2 1.2 0 0 0-1.3.2l-.1.1a1.4 1.4 0 1 1-2-2l.1-.1a1.2 1.2 0 0 0 .2-1.3 1.2 1.2 0 0 0-1.1-.7h-.2a1.4 1.4 0 1 1 0-2.8h.1a1.2 1.2 0 0 0 1.1-.8 1.2 1.2 0 0 0-.2-1.3l-.1-.1a1.4 1.4 0 1 1 2-2l.1.1a1.2 1.2 0 0 0 1.3.2h.1a1.2 1.2 0 0 0 .7-1.1v-.2a1.4 1.4 0 1 1 2.8 0v.1a1.2 1.2 0 0 0 .7 1.1 1.2 1.2 0 0 0 1.3-.2l.1-.1a1.4 1.4 0 1 1 2 2l-.1.1a1.2 1.2 0 0 0-.2 1.3v.1a1.2 1.2 0 0 0 1.1.7h.2a1.4 1.4 0 1 1 0 2.8h-.1a1.2 1.2 0 0 0-1.1.7z" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 16H4a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 4 2h2.5M12 13l3.5-4L12 5M15.5 9H7" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  ),
}

const NAV_ITEMS: { label: string; icon: React.ReactNode; href: string; hasBadge?: boolean }[] = [
  { label: 'Command Centre', icon: icons.grid,     href: '/overview' },
  { label: 'Conversations',  icon: icons.phone,    href: '/conversations' },
  { label: 'Action Queue',   icon: icons.list,     href: '/actions', hasBadge: true },
  { label: 'Bookings',       icon: icons.calendar, href: '/bookings' },
  { label: 'Insights',       icon: icons.barChart, href: '/insights' },
  { label: 'Knowledge Base', icon: icons.book,     href: '/knowledge' },
  { label: 'SMS Hub',        icon: icons.message,  href: '/sms' },
  { label: 'Settings',       icon: icons.cog,      href: '/settings' },
]

interface DashboardSidebarProps {
  clinicName: string
  userName: string
  pendingTaskCount: number
  sarahStatus: { isActive: boolean; mode: string } | null
}

export default function DashboardSidebar({
  clinicName,
  userName,
  pendingTaskCount,
  sarahStatus,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center shrink-0">
          <span className="text-white text-[12px] font-bold font-heading">CF</span>
        </div>
        <div className="min-w-0 sidebar-expanded-content">
          <h1 className="font-bold text-[15px] text-[var(--text-primary)] leading-snug tracking-tight font-heading">
            ClinicForce
          </h1>
          {clinicName && (
            <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-px">{clinicName}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ label, icon, href, hasBadge }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors duration-100 relative',
                  active
                    ? 'bg-[var(--brand-light)] text-[var(--brand)] border-l-[3px] border-l-[var(--brand)] pl-[9px]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                )}
              >
                <span className={cn('shrink-0', active ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)]')}>
                  {icon}
                </span>
                <span className="sidebar-expanded-content truncate">{label}</span>
                {hasBadge && pendingTaskCount > 0 && (
                  <span className="sidebar-expanded-content ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--error)] text-white text-[10px] font-bold leading-none">
                    {pendingTaskCount > 99 ? '99+' : pendingTaskCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer: Sarah AI Status */}
      <div className="px-3 pb-3 mt-auto space-y-2">
        {sarahStatus && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--info-light)] border border-[var(--border-subtle)]">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--info)] flex items-center justify-center">
                <span className="text-white text-[12px] font-bold">S</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5">
                <StatusDot variant={sarahStatus.isActive ? 'active' : 'standby'} />
              </span>
            </div>
            <div className="min-w-0 sidebar-expanded-content">
              <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">Sarah (AI Agent)</p>
              <p className={cn(
                'text-[11px] mt-0.5 leading-tight',
                sarahStatus.isActive ? 'text-[var(--success)]' : 'text-[var(--warning)]',
              )}>
                {sarahStatus.isActive ? `Active \u2014 ${sarahStatus.mode}` : 'Standby'}
              </p>
            </div>
          </div>
        )}

        {/* User card + sign out */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
          <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0 sidebar-expanded-content">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate leading-tight">
              {userName}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="sidebar-expanded-content shrink-0 p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-white transition-colors"
          >
            {icons.logout}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-[var(--border)] shadow-sm md:hidden"
        aria-label="Open menu"
      >
        {icons.menu}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[240px] bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col',
          'transform transition-transform duration-200 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          aria-label="Close menu"
        >
          {icons.close}
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-hidden sidebar-desktop transition-all duration-200">
        {sidebarContent}
      </aside>

      <style>{`
        /* Desktop: full sidebar at >= 1024px, collapsed at 768-1023px */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar-desktop {
            width: 64px;
          }
          .sidebar-desktop .sidebar-expanded-content {
            display: none;
          }
        }
        @media (min-width: 1024px) {
          .sidebar-desktop {
            width: 240px;
          }
        }
      `}</style>
    </>
  )
}
