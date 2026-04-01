'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Inbox, Phone,
  BarChart3, ClipboardList, Settings, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIMARY_NAV = [
  { label: 'Overview',  href: '/overview',     icon: LayoutDashboard },
  { label: 'Calls',     href: '/care-queue',   icon: Phone },
  { label: 'Call Inbox', href: '/calls',        icon: Inbox },
  { label: 'Handover',  href: '/referrals',    icon: ClipboardList },
  { label: 'Reports',   href: '/media-review', icon: BarChart3 },
]

const ADMIN_NAV = [
  { label: 'Team',     href: '/users',    icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  clinicName?: string
  userName?: string
  userRole?: string
}

export default function Sidebar({
  clinicName = 'Your Clinic',
  userName = 'Staff',
  userRole = 'receptionist',
}: SidebarProps) {
  const pathname = usePathname()
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const roleFmt  = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen bg-slate-900 border-r border-slate-800 overflow-y-auto">

      {/* -- Brand --------------------------------------------- */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-600/20 flex items-center justify-center shrink-0">
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute w-[11px] h-[1.5px] bg-teal-400 rounded-full" />
            <div className="absolute w-[1.5px] h-[11px] bg-teal-400 rounded-full" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-[15px] tracking-tight text-white leading-snug">VetForce</h1>
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest truncate mt-px">{clinicName}</p>
        </div>
      </div>

      {/* -- Primary Nav --------------------------------------- */}
      <nav className="flex-1 px-3 pt-5 pb-2">
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
                  'group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  active
                    ? 'bg-teal-600/20 text-teal-300 font-semibold'
                    : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                {active && (
                  <span className="absolute left-0 inset-y-[6px] w-[3px] bg-teal-400 rounded-r-full" />
                )}
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
      <div className="px-3 py-4 border-t border-slate-800">
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
                  'group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  active
                    ? 'bg-teal-600/20 text-teal-300 font-semibold'
                    : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                {active && (
                  <span className="absolute left-0 inset-y-[6px] w-[3px] bg-teal-400 rounded-r-full" />
                )}
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
        <div className="px-3 py-2.5 bg-slate-800 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-600/30 flex items-center justify-center shrink-0 text-teal-300 text-[11px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{userName}</p>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-px">{roleFmt}</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
