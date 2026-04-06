'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Inbox,
  BarChart3, ListChecks, Settings, Users, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

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

interface SidebarProps {
  clinicName?: string
  userName?:   string
  userRole?:   string
}

export default function Sidebar({
  clinicName = 'Your Clinic',
  userName   = 'Staff',
  userRole   = 'receptionist',
}: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const roleFmt  = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen bg-slate-900 border-r border-slate-800 overflow-y-auto">

      {/* -- Brand --------------------------------------------- */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0">
          <circle cx="16" cy="16" r="15" fill="#0D9488"/>
          <path d="M8 16 Q11 10 14 16 Q17 22 20 16 Q23 10 24 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
        <div className="min-w-0">
          <h1 className="font-semibold text-lg text-white leading-snug">ClinicForce</h1>
          <p className="text-xs text-slate-400 truncate mt-px">{clinicName}</p>
        </div>
      </div>

      {/* -- Primary Nav --------------------------------------- */}
      <nav className="flex-1 px-2 pt-5 pb-2">
        <p className="px-3 mb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest select-none">
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
                    ? 'bg-teal-600/20 text-teal-300 font-semibold'
                    : 'text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    active ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-400'
                  )}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* -- Admin Nav + Profile -------------------------------- */}
      <div className="px-2 py-4 border-t border-slate-800">
        <p className="px-3 mb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest select-none">
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
                    ? 'bg-teal-600/20 text-teal-300 font-semibold'
                    : 'text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    active ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-400'
                  )}
                />
                {label}
              </Link>
            )
          })}
        </div>

        {/* User card */}
        <div className="mx-2 px-3 py-2.5 bg-slate-800 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-600/30 flex items-center justify-center shrink-0 text-teal-300 text-[11px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{userName}</p>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-px">{roleFmt}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
