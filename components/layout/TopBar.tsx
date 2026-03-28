'use client'

import { Bell, Search, MapPin, Power } from 'lucide-react'
import { mockAlerts } from '@/data/mock-alerts'

const unacknowledgedCount = mockAlerts.filter((a) => !a.acknowledged).length

interface CoverageStatus {
  status: 'ACTIVE' | 'INACTIVE'
  reason?: string
  startTime?: string
}

interface TopBarProps {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  clinicName?: string
  coverage?: CoverageStatus
  onNewCase?: () => void
}

const REASON_LABELS: Record<string, string> = {
  LUNCH_BREAK: 'Lunch Break',
  MEETING: 'Team Meeting',
  SICK_LEAVE: 'Sick Leave',
  OVERFLOW: 'Overflow',
  AFTER_HOURS: 'After Hours',
  MORNING_RUSH: 'Morning Rush',
}

export default function TopBar({
  title,
  subtitle,
  searchPlaceholder = 'Search calls...',
  clinicName = 'Your Clinic',
  coverage,
  onNewCase,
}: TopBarProps) {
  const isActive = coverage?.status === 'ACTIVE'
  const reasonLabel = coverage?.reason ? (REASON_LABELS[coverage.reason] ?? coverage.reason) : ''

  return (
    <header className="h-16 bg-white flex items-center px-8 sticky top-0 z-10 shrink-0 gap-5 border-b border-slate-100">

      {/* Page title */}
      <div className="shrink-0">
        <h2 className="text-[#0f5b8a] font-bold text-lg whitespace-nowrap leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>

      {/* Coverage status pill — THE hero element */}
      {coverage && (
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all ${
          isActive
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          {isActive ? (
            <span>VetDesk <span className="font-extrabold">ON</span>{reasonLabel ? ` · ${reasonLabel}` : ''}{coverage.startTime ? ` · since ${coverage.startTime}` : ''}</span>
          ) : (
            <span>VetDesk <span className="font-extrabold">OFF</span> · Reception available</span>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm focus:bg-white focus:border-[#0f5b8a] focus:ring-2 focus:ring-[#0f5b8a]/10 transition-all outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-auto shrink-0">

        {/* Clinic */}
        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-semibold">{clinicName}</span>
        </button>

        {/* Bell */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50" aria-label="Alerts">
            <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>

        {/* Activate / Deactivate CTA */}
        <button
          onClick={onNewCase}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm ${
            isActive
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-[#0f5b8a] hover:bg-[#0c4a70] text-white'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {isActive ? 'End Coverage' : 'Activate Coverage'}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0f5b8a] flex items-center justify-center shrink-0 text-white text-xs font-bold">
          {(clinicName ?? 'VC').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
