'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Phone, CalendarDays,
  BarChart3, ClipboardList, CheckSquare, Settings, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Coverage Console', href: '/overview',     icon: LayoutDashboard },
  { label: 'Interaction Log',  href: '/care-queue',   icon: MessageSquare },
  { label: 'Follow-Up Queue',  href: '/calls',        icon: Phone },
  { label: 'Bookings',         href: '/bookings',     icon: CalendarDays },
  { label: 'Coverage Reports', href: '/media-review', icon: BarChart3 },
  { label: 'Handover Notes',   href: '/referrals',    icon: ClipboardList },
  { label: 'Team Tasks',       href: '/tasks',        icon: CheckSquare },
  { label: 'Users',            href: '/users',        icon: Users },
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
  const roleFmt = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-white border-r border-slate-200 overflow-y-auto">

      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-10 h-10 rounded-full bg-[#0ea5e9] flex items-center justify-center shrink-0">
          <div className="w-5 h-5 bg-white rounded-sm relative flex items-center justify-center">
            <div className="w-3 h-0.5 bg-[#0ea5e9] absolute" />
            <div className="w-0.5 h-3 bg-[#0ea5e9] absolute" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-xl tracking-tight text-[#0f5b8a] leading-tight">VetDesk</h1>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{clinicName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-0.5 mt-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-[#f0f6ff] text-[#0f5b8a]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}>
              <Icon className={cn('w-5 h-5 shrink-0', active ? 'text-[#0ea5e9]' : 'text-slate-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <Link href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </Link>
        <div className="mt-1 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0f5b8a] flex items-center justify-center shrink-0 text-white text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{roleFmt}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
