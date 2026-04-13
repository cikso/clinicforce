'use client'

import { BarChart2 } from 'lucide-react'
import type { CoverageUsage } from '@/data/mock-dashboard'

interface CoverageUsageCardProps {
  usage: CoverageUsage[]
}

export default function CoverageUsageCard({ usage: usageData }: CoverageUsageCardProps) {
  const totalMinutes = usageData.reduce((sum, u) => sum + u.minutes, 0)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const maxMinutes = Math.max(...usageData.map(u => u.minutes), 1)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-900">Coverage Today</span>
        </div>
        <span className="text-xs font-bold text-[#17C4BE]">{hours}h {mins}m total</span>
      </div>

      <div className="space-y-3">
        {usageData.filter(u => u.minutes > 0).map((item) => (
          <div key={item.reason}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">{item.label}</span>
              <span className="text-xs text-slate-400">{item.minutes}m</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(item.minutes / maxMinutes) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-slate-50">
        Reception hours protected today
      </p>
    </div>
  )
}
