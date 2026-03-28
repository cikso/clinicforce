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
  LUNCH_BREAK:  'Lunch Break',
  MEETING:      'Team Meeting',
  SICK_LEAVE:   'Sick Leave',
  OVERFLOW:     'Overflow',
  AFTER_HOURS:  'After Hours',
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
  const isActive    = coverage?.status === 'ACTIVE'
  const reasonLabel = coverage?.reason ? (REASON_LABELS[coverage.reason] ?? coverage.reason) : ''

  return (
    <header className="h-[56px] bg-white flex items-center px-6 sticky top-0 z-10 shrink-0 border-b border-slate-200/80 gap-4">

      {/* Page title */}
      <div className="shrink-0">
        <h2 className="text-[#0f2744] font-bold text-[15px] whitespace-nowrap leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* Coverage status pill */}
      {coverage && (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold shrink-0 transition-all ${
          isActive
            ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
          }`} />
          {isActive ? (
            <>
              <span className="font-bold">VetDesk ON</span>
              {reasonLabel && <span className="text-emerald-600/70 font-normal"> · {reasonLabel}</span>}
              {coverage.startTime && <span className="text-emerald-600/60 font-normal"> · {coverage.startTime}</span>}
            </>
          ) : (
            <span>VetDesk <span className="font-bold">OFF</span> · Reception active</span>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[13px] focus:bg-white focus:border-[#0891b2] focus:ring-2 focus:ring-[#0891b2]/10 transition-all outline-none placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto shrink-0">

        {/* Clinic location */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-slate-500">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span className="font-medium">{clinicName}</span>
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Alerts"
          >
            <Bell className="w-[17px] h-[17px]" />
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-[1.5px] border-white" />
            )}
          </button>
        </div>

        {/* End Coverage button — only visible when coverage is active */}
        {isActive && (
          <button
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <Power className="w-3 h-3" />
            End Coverage
          </button>
        )}

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-[#0f2744] flex items-center justify-center shrink-0 text-white text-[10px] font-bold ml-1">
          {(clinicName ?? 'VC').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
