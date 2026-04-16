'use client'

import { Bell, Search, MapPin, Power } from 'lucide-react'
import { mockAlerts } from '@/data/mock-alerts'
import type { CoverageMode } from '@/data/mock-dashboard'

const unacknowledgedCount = mockAlerts.filter((a) => !a.acknowledged).length

const MODE_STATUS_LABELS: Record<CoverageMode, string> = {
  DAYTIME:     'Daytime coverage active',
  LUNCH:       'Lunch coverage active',
  AFTER_HOURS: 'After-hours coverage active',
}

interface CoverageStatus {
  status:     'ACTIVE' | 'INACTIVE'
  mode?:      CoverageMode | null
  startTime?: string
}

interface TopBarProps {
  title:             string
  subtitle?:         string
  searchPlaceholder?: string
  clinicName?:       string
  userName?:         string
  coverage?:         CoverageStatus
  onNewCase?:        () => void
}

export default function TopBar({
  title,
  subtitle,
  searchPlaceholder = 'Search calls...',
  clinicName = '',
  userName = '',
  coverage,
  onNewCase,
}: TopBarProps) {
  // Avatar initials: use userName if available, fall back to clinicName
  const avatarSource = userName || clinicName || 'CF'
  const avatarInitials = avatarSource
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const isActive = coverage?.status === 'ACTIVE' && !!coverage?.mode

  return (
    <header className="h-[56px] bg-white flex items-center px-6 sticky top-0 z-10 shrink-0 border-b border-slate-200/80 gap-4">

      {/* Page title */}
      <div className="shrink-0">
        <h2 className="text-xl font-semibold text-slate-900 whitespace-nowrap leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* Coverage status pill */}
      {coverage && (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold shrink-0 transition-all ${
          isActive
            ? 'bg-green-950 border-green-800 text-green-300'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          {/* Dot — animate-ping when active, grey when off */}
          {isActive ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-300" />
          )}

          {isActive && coverage.mode ? (
            <>
              <span className="font-bold">{MODE_STATUS_LABELS[coverage.mode]}</span>
              {coverage.startTime && (
                <span className="text-green-400/70 font-normal"> · since {coverage.startTime}</span>
              )}
            </>
          ) : (
            <span>ClinicForce <span className="font-bold">off</span> · Reception active</span>
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
            className="w-full pl-8 pr-4 py-1.5 bg-[#f4f6f9] border border-[#E5EAF0] rounded-md text-[13px] focus:bg-white focus:border-[#00D68F] focus:ring-2 focus:ring-[#00D68F]/10 transition-all outline-none placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto shrink-0">

        {/* Clinic location */}
        {(clinicName || userName) && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="font-medium">{clinicName || userName}</span>
          </div>
        )}

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

        {/* End Coverage — only when a mode is active */}
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
        <div className="w-7 h-7 rounded-full bg-[#00D68F] flex items-center justify-center shrink-0 text-white text-[10px] font-bold ml-1">
          {avatarInitials}
        </div>
      </div>
    </header>
  )
}
