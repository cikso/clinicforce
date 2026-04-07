'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Inbox,
  BarChart3, ListChecks, Settings, Users, LogOut, Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const PRIMARY_NAV = [
  { label: 'Overview',     href: '/overview',  icon: LayoutDashboard },
  { label: 'Call Inbox',   href: '/calls',      icon: Inbox },
  { label: 'Action Queue', href: '/referrals',  icon: ListChecks },
  { label: 'Insights',     href: '/insights',   icon: BarChart3 },
]

const ADMIN_NAV = [
  { label: 'Team',     href: '/users',    icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

// Roles that can see Team + Settings
const ADMIN_ROLES = ['platform_owner', 'clinic_admin', 'admin']

// Platform-owner-only nav
const PLATFORM_NAV = [
  { label: 'Platform Admin', href: '/admin', icon: Building2 },
]

interface SidebarProps {
  clinicName?: string
  userName?:   string
  userRole?:   string
}

export default function Sidebar({
  clinicName = '',
  userName   = 'Staff',
  userRole   = 'receptionist',
}: SidebarProps) {
  const isAdmin  = ADMIN_ROLES.includes(userRole)
  const pathname = usePathname()
  const router   = useRouter()
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const roleFmt  = userRole === 'platform_owner'
    ? 'Owner'
    : userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen bg-[#001f3f] border-r border-white/5 overflow-y-auto">

      {/* -- Primary Nav --------------------------------------- */}
      <nav className="flex-1 px-2 pt-6 pb-2">
        <p className="px-3 mb-2 text-[9px] font-bold text-[#557199] uppercase tracking-widest select-none">
          Workspace
        </p>
        <div className="space-y-0.5">
          {PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'mx-2 group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                  active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-[#adb5bd] font-medium hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  active ? 'text-white' : 'text-[#adb5bd] group-hover:text-white'
                )} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* -- Admin Nav + Profile -------------------------------- */}
      <div className="px-2 py-4 border-t border-white/5">

        {/* Platform-owner-only section */}
        {userRole === 'platform_owner' && (
          <>
            <p className="px-3 mb-2 text-[9px] font-bold text-[#557199] uppercase tracking-widest select-none">
              Platform
            </p>
            <div className="space-y-0.5 mb-4">
              {PLATFORM_NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'mx-2 group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                      active
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#adb5bd] font-medium hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      active ? 'text-white' : 'text-[#adb5bd] group-hover:text-white'
                    )} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Clinic admin section */}
        {isAdmin && (
          <>
            <p className="px-3 mb-2 text-[9px] font-bold text-[#557199] uppercase tracking-widest select-none">
              Admin
            </p>
            <div className="space-y-0.5 mb-4">
              {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'mx-2 group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                      active
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#adb5bd] font-medium hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      active ? 'text-white' : 'text-[#adb5bd] group-hover:text-white'
                    )} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* User card */}
        <div className="mx-2 px-3 py-2.5 bg-white/5 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#007bff]/20 flex items-center justify-center shrink-0 text-[#60a5fa] text-[11px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{userName}</p>
            <p className="text-[9px] font-semibold text-[#557199] uppercase tracking-wider mt-px">{roleFmt}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 p-1.5 rounded-lg text-[#557199] hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
