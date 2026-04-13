'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SettingsTab {
  label: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const TABS: SettingsTab[] = [
  {
    label: 'Clinic Profile',
    href: '/settings',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M5.5 6.5h5M5.5 9.5h3" /></svg>,
  },
  {
    label: 'AI Agent',
    href: '/settings/ai',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M8 1v2M4.5 3.5l1 1.5M11.5 3.5l-1 1.5" /><rect x="4" y="6" width="8" height="7" rx="2" /><circle cx="6.5" cy="9.5" r="0.8" fill="currentColor" stroke="none" /><circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" stroke="none" /></svg>,
    adminOnly: true,
  },
  {
    label: 'Coverage',
    href: '/settings/coverage',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></svg>,
    adminOnly: true,
  },
  {
    label: 'Team',
    href: '/settings/team',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="6" cy="5.5" r="2" /><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" /><circle cx="11.5" cy="5" r="1.5" /><path d="M14 12.5c0-1.7-1.1-3-2.5-3" /></svg>,
    adminOnly: true,
  },
  {
    label: 'Notifications',
    href: '/settings/notifications',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 6a4 4 0 0 1 8 0c0 4 2 5 2 5H2s2-1 2-5M6.5 13.5a1.5 1.5 0 0 0 3 0" /></svg>,
  },
  {
    label: 'Billing',
    href: '/settings/billing',
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
  const isAdmin = ['clinic_admin', 'platform_owner'].includes(userRole)

  // Platform owners see all tabs. Clinic admins see only Team. Staff see nothing admin.
  const visibleTabs = isPlatformOwner
    ? TABS
    : isAdmin
      ? TABS.filter((t) => t.href === '/settings/team')
      : TABS.filter((t) => !t.adminOnly)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Settings</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          Manage your clinic configuration, team, and preferences.
        </p>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Left sidebar tabs */}
        <nav className="w-full lg:w-[200px] shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href
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
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
