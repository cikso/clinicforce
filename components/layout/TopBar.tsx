'use client'

import { Bell, Search, MapPin, Plus } from 'lucide-react'
import { mockAlerts } from '@/data/mock-alerts'

const unacknowledgedCount = mockAlerts.filter((a) => !a.acknowledged).length

interface TopBarProps {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  clinicName?: string
  showAiBadge?: boolean
  onNewCase?: () => void
}

export default function TopBar({
  title,
  subtitle,
  searchPlaceholder = 'Search cases...',
  clinicName = 'Downtown Clinic',
  showAiBadge,
  onNewCase,
}: TopBarProps) {
  return (
    <header className="h-20 bg-[#f8fafc] flex items-center px-8 sticky top-0 z-10 shrink-0 gap-6 border-b border-slate-200">

      {/* Page title */}
      <div className="shrink-0 flex items-center gap-3">
        <div>
          <h2 className="text-[#0f5b8a] font-bold text-xl whitespace-nowrap leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
        {showAiBadge && (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Triage Online
          </span>
        )}
      </div>

      {/* Search input */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-[#0f5b8a] focus:ring-2 focus:ring-[#0f5b8a]/20 transition-all outline-none placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 ml-auto shrink-0">

        {/* Clinic selector */}
        <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-full transition-colors">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{clinicName}</span>
        </button>

        {/* Bell */}
        <div className="relative">
          <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors" aria-label="Alerts">
            <Bell className="w-5 h-5" />
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#b91c1c] rounded-full border-2 border-[#f8fafc]" />
            )}
          </button>
        </div>

        {/* Add New Case CTA */}
        <button onClick={onNewCase} className="flex items-center gap-2 bg-[#0f5b8a] hover:bg-[#0c4a70] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Case
        </button>

        {/* Staff avatar */}
        <button className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrArisThorne&backgroundColor=0f5b8a"
            alt="Dr. Aris Thorne"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  )
}
