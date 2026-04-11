'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

export interface ChartDataPoint {
  label: string
  handled: number
  callbacks: number
}

interface CallVolumeChartProps {
  hourlyData: ChartDataPoint[]
  weeklyData: ChartDataPoint[]
  monthlyData: ChartDataPoint[]
}

type Tab = 'today' | '7d' | '30d'

export default function CallVolumeChart({ hourlyData, weeklyData, monthlyData }: CallVolumeChartProps) {
  const [tab, setTab] = useState<Tab>('today')

  const dataMap: Record<Tab, ChartDataPoint[]> = {
    today: hourlyData,
    '7d': weeklyData,
    '30d': monthlyData,
  }

  const data = dataMap[tab]

  return (
    <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 rounded-full bg-[#0A7A5B]" />
          <h3 className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#8A94A6]">
            Call Volume — {tab === 'today' ? 'Today' : tab === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </h3>
        </div>
        <div className="flex gap-1 bg-[#F4F6F9] rounded-md p-0.5">
          {(['today', '7d', '30d'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1 rounded text-[11px] font-semibold transition-all',
                tab === t
                  ? 'bg-white text-[#0A2540] shadow-sm'
                  : 'text-[#8A94A6] hover:text-[#637381]',
              )}
            >
              {t === 'today' ? 'Today' : t === '7d' ? '7d' : '30d'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="0"
              stroke="#F0F2F5"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#B0BAC9' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#B0BAC9' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #DDE1E7',
                borderRadius: 6,
                fontSize: 11,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
            />
            <Bar
              dataKey="handled"
              name="Handled by Sarah"
              fill="#0A7A5B"
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="callbacks"
              name="Callbacks"
              fill="#B7641C"
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-[#637381]">
          <span className="inline-block w-[10px] h-[3px] rounded-full bg-[#0A7A5B]" />
          Handled by Sarah
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#637381]">
          <span className="inline-block w-[10px] h-[3px] rounded-full bg-[#B7641C]" />
          Callbacks
        </span>
      </div>
    </div>
  )
}
