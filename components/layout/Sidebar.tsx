'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Inbox,
  BarChart3, ListChecks, Settings, Users, LogOut, Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useClinic } from '@/context/ClinicContext'
import ClinicSwitcher from '@/components/layout/ClinicSwitcher'

const PRIMARY_NAV = [
  { label: 'Overview',     href: '/overview',     icon: LayoutDashboard },
  { label: 'Call Inbox',   href: '/calls',         icon: Inbox },
  { label: 'Action Queue', href: '/referrals',    icon: ListChecks },
  { label: 'Insights',     href: '/insights',     icon: BarChart3 },
]

const ADMIN_NAV = [
  { label: 'Team',     href: '/users',    icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const ADMIN_ROLES = ['platform_owner', 'clinic_admin', 'admin']

const PLATFORM_NAV = [
  { label: 'Platform Admin', href: '/admin', icon: Building2 },
]

interface SidebarProps {
  clinicName?:         string
  userName?:           string
  userRole?:           string
  trialDaysRemaining?: number
}

export default function Sidebar({
  clinicName         = '',
  userName           = 'Staff',
  userRole           = 'receptionist',
  trialDaysRemaining,
}: SidebarProps) {
  const { isPlatformOwner: isOwner } = useClinic()
  const isAdmin  = ADMIN_ROLES.includes(userRole)
  const pathname = usePathname()
  const router   = useRouter()
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const roleFmt  = userRole === 'platform_owner' ? 'Owner' : userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen bg-white border-r border-[#dddbda] overflow-y-auto">

      {/* -- Brand --------------------------------------------- */}
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-[#dddbda]">
        <div className="w-8 h-8 rounded-md bg-[#17C4BE] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M8 16 Q11 10 14 16 Q17 22 20 16 Q23 10 24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-[15px] text-slate-900 leading-snug tracking-tight">ClinicForce</h1>
          {isOwner ? (
            <ClinicSwitcher />
          ) : clinicName ? (
            <p className="text-[11px] text-slate-500 truncate mt-px">{clinicName}</p>
          ) : null}
        </div>
      </div>

      {/* -- Primary Nav --------------------------------------- */}
      <nav className="flex-1 px-3 pt-4 pb-2">
        <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] select-none">
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
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-100',
                  active
                    ? 'bg-[#E5F9F8] text-[#17C4BE] font-semibold'
                    : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    active ? 'text-[#17C4BE]' : 'text-slate-400'
                  )}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* -- Admin Nav + Profile -------------------------------- */}
      <div className="px-3 py-4 border-t border-[#dddbda] space-y-4">

        {/* Platform-owner-only section */}
        {userRole === 'platform_owner' && (
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] select-none">
              Platform
            </p>
            <div className="space-y-0.5">
              {PLATFORM_NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-100',
                      active
                        ? 'bg-[#E5F9F8] text-[#17C4BE] font-semibold'
                        : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-[#17C4BE]' : 'text-slate-400')} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {isAdmin && (
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] select-none">
              Admin
            </p>
            <div className="space-y-0.5">
              {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-100',
                      active
                        ? 'bg-[#E5F9F8] text-[#17C4BE] font-semibold'
                        : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-[#17C4BE]' : 'text-slate-400')} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Trial banner */}
        {trialDaysRemaining !== undefined && (
          <div className="px-3 py-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[12px] font-medium leading-snug">
            <span className="font-semibold">Trial</span>
            {' — '}
            {trialDaysRemaining === 0
              ? 'expires today'
              : `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} remaining`}
          </div>
        )}

        {/* User card */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-slate-50 border border-[#dddbda]">
          <div className="w-8 h-8 rounded-full bg-[#17C4BE] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-px">{roleFmt}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  )
}
