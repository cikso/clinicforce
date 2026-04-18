'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SettingsTab {
  label: string
  href: string
  icon: React.ReactNode
  /** Shown under the page title — one sentence. */
  subtitle?: string
  adminOnly?: boolean
}

const TABS: SettingsTab[] = [
  {
    label: 'AI Agent',
    href: '/settings/ai',
    subtitle: 'Voice, tone, and how Stella handles inbound calls.',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M8 1v2M4.5 3.5l1 1.5M11.5 3.5l-1 1.5" /><rect x="4" y="6" width="8" height="7" rx="2" /><circle cx="6.5" cy="9.5" r="0.8" fill="currentColor" stroke="none" /><circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" stroke="none" /></svg>,
    adminOnly: true,
  },
  {
    label: 'Coverage',
    href: '/settings/coverage',
    subtitle: 'When Stella answers, which hours your team takes, and closure days.',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></svg>,
    adminOnly: true,
  },
  {
    label: 'Team',
    href: '/settings/team',
    subtitle: 'Add or remove teammates and set their access level.',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="6" cy="5.5" r="2" /><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" /><circle cx="11.5" cy="5" r="1.5" /><path d="M14 12.5c0-1.7-1.1-3-2.5-3" /></svg>,
    adminOnly: true,
  },
  {
    label: 'Notifications',
    href: '/settings/notifications',
    subtitle: 'Where urgent calls, callback alerts, and daily summaries go.',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 6a4 4 0 0 1 8 0c0 4 2 5 2 5H2s2-1 2-5M6.5 13.5a1.5 1.5 0 0 0 3 0" /></svg>,
  },
  {
    label: 'Billing',
    href: '/settings/billing',
    subtitle: 'Plan, usage, and invoices.',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" /><path d="M1.5 7h13" /></svg>,
    adminOnly: true,
  },
]

interface SettingsShellProps {
  children: React.ReactNode
  userRole: string
}

export default function SettingsShell({ children, userRole }: SettingsShellProps) {
  const pathname = usePathname()

  const isPlatformOwner = userRole === 'platform_owner'
  const isClinicOwner = userRole === 'clinic_owner'
  const isAdmin = ['clinic_admin', 'platform_owner'].includes(userRole)

  // platform_owner: hide per-clinic tabs (managed via /admin per-clinic);
  //   keep Team / Notifications / Billing for platform-level admin.
  // clinic_owner: zero settings — all admin (including team) lives in /admin.
  // clinic_admin: only Team. Staff: only non-admin tabs.
  const PLATFORM_OWNER_HIDDEN = ['/settings/ai', '/settings/coverage']
  const visibleTabs = isClinicOwner
    ? []
    : isPlatformOwner
      ? TABS.filter((t) => !PLATFORM_OWNER_HIDDEN.includes(t.href))
      : isAdmin
        ? TABS.filter((t) => t.href === '/settings/team')
        : TABS.filter((t) => !t.adminOnly)

  // Resolve the active tab for the per-page header from the full TABS list —
  // some roles can reach a settings page directly (e.g. clinic_admin hitting
  // /settings/billing) even when the tab is hidden from their rail. Uses
  // exact match first, then longest-prefix match for future nested routes.
  const activeTab =
    TABS.find((t) => t.href === pathname) ??
    [...TABS].sort((a, b) => b.href.length - a.href.length).find((t) => pathname.startsWith(t.href)) ??
    null

  return (
    <div className="flex gap-5 flex-col lg:flex-row">
      {/* Left sidebar tabs */}
      <nav className="w-full lg:w-[220px] shrink-0">
        <p className="eyebrow text-[var(--text-tertiary)] mb-2 hidden lg:block">Settings</p>
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {visibleTabs.map((tab) => {
            const isActive = activeTab?.href === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                )}
              >
                <span className={isActive ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)]'}>{tab.icon}</span>
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Per-page header — breadcrumb + title + subtitle. Replaces the old
            global "Settings" H1 so each surface has its own identity while the
            left rail keeps the user oriented. */}
        {activeTab && (
          <header className="mb-5 cf-enter">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] mb-1.5">
              <Link href="/overview" className="hover:text-[var(--text-primary)] transition-colors">
                Dashboard
              </Link>
              <span aria-hidden>/</span>
              <span className="text-[var(--text-secondary)]">Settings</span>
              <span aria-hidden>/</span>
              <span className="text-[var(--text-primary)] font-medium">{activeTab.label}</span>
            </nav>
            <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)] tracking-[-0.01em]">
              {activeTab.label}
            </h1>
            {activeTab.subtitle && (
              <p className="mt-1 text-[14px] text-[var(--text-secondary)] max-w-[640px]">
                {activeTab.subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  )
}
