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
  title:              string
  subtitle?:          string
  searchPlaceholder?: string
  clinicName?:        string
  userName?:          string
  coverage?:          CoverageStatus
  onNewCase?:         () => void
}

export default function TopBar({
  title,
  subtitle,
  searchPlaceholder = 'Search calls...',
  clinicName = '',
  userName   = '',
  coverage,
  onNewCase,
}: TopBarProps) {
  // Avatar initials: prefer userName, fall back to clinicName, then 'CF'
  const avatarSource   = userName || clinicName || 'CF'
  const avatarInitials = avatarSource
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isActive = coverage?.status === 'ACTIVE' && !!coverage?.mode

  return (
    <header className="h-[60px] bg-white flex items-center px-5 sticky top-0 z-10 shrink-0 border-b border-[#e9ecef] shadow-[0_2px_5px_rgba(0,0,0,0.06)] gap-3">

      {/* ── Brand logo ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0">
          <circle cx="16" cy="16" r="15" fill="#007bff" />
          <path
            d="M8 16 Q11 10 14 16 Q17 22 20 16 Q23 10 24 16"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="font-bold text-[#001f3f] text-[15px] leading-none tracking-tight">
          ClinicForce
        </span>
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="h-5 w-px bg-[#e9ecef] shrink-0" />

      {/* ── Coverage status pill ─────────────────────────────── */}
      {coverage && (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold shrink-0 transition-all ${
          isActive
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-[#e6f7ff] border-[#b3d9ff] text-[#007bff]'
        }`}>
          {isActive ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#007bff]" />
          )}
          {isActive && coverage.mode ? (
            <>
              <span className="font-bold">{MODE_STATUS_LABELS[coverage.mode]}</span>
              {coverage.startTime && (
                <span className="text-emerald-600/70 font-normal"> · since {coverage.startTime}</span>
              )}
            </>
          ) : (
            <span>ClinicForce <span className="font-bold">off</span> · Reception active</span>
          )}
        </div>
      )}

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="flex-1 max-w-[260px]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-4 py-[7px] bg-[#f1f3f5] border border-transparent rounded-full text-[13px] focus:bg-white focus:border-[#007bff]/30 focus:ring-2 focus:ring-[#007bff]/10 transition-all outline-none placeholder:text-[#888] text-[#333]"
          />
        </div>
      </div>

      {/* ── Right controls ──────────────────────────────────── */}
      <div className="flex items-center gap-3 ml-auto shrink-0">

        {/* Clinic / user location */}
        {(clinicName || userName) && (
          <div className="hidden md:flex items-center gap-1.5 text-[13px] text-[#555]">
            <MapPin className="w-3.5 h-3.5 text-[#888]" />
            <span className="font-medium">{clinicName || userName}</span>
          </div>
        )}

        {/* End Coverage — only when a mode is active */}
        {isActive && (
          <button
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors bg-[#f1f3f5] hover:bg-[#e2e6ea] text-[#555]"
          >
            <Power className="w-3 h-3" />
            End Coverage
          </button>
        )}

        {/* Bell */}
        <div className="relative">
          <button
            className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#333] hover:bg-[#f1f3f5] rounded-lg transition-colors"
            aria-label="Alerts"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-[1.5px] border-white" />
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#001f3f] flex items-center justify-center shrink-0 text-white text-[10px] font-bold">
          {avatarInitials}
        </div>
      </div>
    </header>
  )
}
