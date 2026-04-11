import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  compareStat: string
  delta: string
  deltaType: 'up' | 'down' | 'neutral'
  iconBg: string
  iconColor: string
  icon: ReactNode
}

const DELTA_STYLES = {
  up:      'bg-[#E8F6EE] text-[#0A6B4F] border-[#B3DFD0]',
  down:    'bg-[#FDEEEE] text-[#C0392B] border-[#F5BDB9]',
  neutral: 'bg-[#F4F6F9] text-[#8A94A6] border-[#DDE1E7]',
}

const DELTA_ARROWS = {
  up: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8V2M2.5 4.5L5 2l2.5 2.5" />
    </svg>
  ),
  down: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2v6M2.5 5.5L5 8l2.5-2.5" />
    </svg>
  ),
  neutral: null,
}

export default function KpiCard({
  label,
  value,
  compareStat,
  delta,
  deltaType,
  iconBg,
  iconColor,
  icon,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 transition-colors hover:border-[#B0BAC9]" style={{ border: '1.5px solid #DDE1E7' }}>
      {/* Row 1: icon + delta pill */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center justify-center rounded-[7px]" style={{ width: 34, height: 34, backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
        <span className={cn(
          'inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded border',
          DELTA_STYLES[deltaType],
        )}>
          {DELTA_ARROWS[deltaType]}
          {delta}
        </span>
      </div>

      {/* Row 2: label */}
      <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6] mb-0.5">{label}</p>

      {/* Row 3: value */}
      <p className="text-[28px] font-bold text-[#0A2540] leading-tight" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
        {value}
      </p>

      {/* Row 4: compare text */}
      <p className="text-[10px] text-[#B0BAC9] mt-0.5">{compareStat}</p>
    </div>
  )
}
