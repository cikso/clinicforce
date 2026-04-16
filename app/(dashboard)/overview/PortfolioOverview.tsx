'use client'

/**
 * Portfolio Overview — multi-clinic dashboard for platform_owner and clinic_owner.
 *
 * Pattern: server fetches per-clinic daily metrics in one shot (efficient JOIN),
 * client handles selection state + on-the-fly aggregation. No re-fetches on
 * picker changes. Selection persisted to URL so views are shareable.
 */

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import KpiCard from './components/KpiCard'

/* ─────────── Types ─────────── */

export interface ClinicMetrics {
  clinicId: string
  clinicName: string
  vertical: string
  suburb: string | null
  // Today
  callsToday: number
  callbacksToday: number
  callbacksActioned: number
  urgentToday: number
  urgentActioned: number
  bookingsToday: number
  afterHoursToday: number
  avgDurationToday: number
  // Yesterday (for delta)
  callsYesterday: number
  callbacksYesterday: number
  urgentYesterday: number
  bookingsYesterday: number
  afterHoursYesterday: number
  avgDurationYesterday: number
  // Hourly breakdown today (08:00–18:00)
  hourly: { hour: number; handled: number; callbacks: number }[]
}

interface Props {
  clinics: ClinicMetrics[]
  todayLabel: string
  roleLabel: string
}

/* ─────────── Helpers ─────────── */

function formatDuration(secs: number): string {
  if (secs <= 0) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function pctDelta(today: number, yesterday: number): { text: string; type: 'up' | 'down' | 'neutral' } {
  if (yesterday === 0 && today === 0) return { text: '0%', type: 'neutral' }
  if (yesterday === 0) return { text: '+100%', type: 'up' }
  const pct = Math.round(((today - yesterday) / yesterday) * 100)
  if (pct === 0) return { text: '0%', type: 'neutral' }
  if (pct > 0) return { text: `+${pct}%`, type: 'up' }
  return { text: `${pct}%`, type: 'down' }
}

/* ─────────── KPI icons ─────────── */

const icons = {
  phone: (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
    </svg>
  ),
  callback: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9v3a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2 12V4.5A1.5 1.5 0 0 1 3.5 3H7" />
      <path d="M10 2h4v4M14 2L7.5 8.5" />
    </svg>
  ),
  flag: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14V2l9 4-9 4" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </svg>
  ),
}

/* ─────────── Component ─────────── */

const ALL = '__all__'

export default function PortfolioOverview({ clinics, todayLabel, roleLabel }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initial selection from URL: ?clinics=all (default) or ?clinics=id1,id2
  const initialSelection = useMemo<Set<string>>(() => {
    const param = searchParams.get('clinics')
    if (!param || param === 'all') return new Set([ALL])
    const ids = new Set(param.split(',').filter(Boolean))
    // Filter to only known clinics
    const valid = new Set<string>()
    for (const c of clinics) if (ids.has(c.clinicId)) valid.add(c.clinicId)
    return valid.size > 0 ? valid : new Set([ALL])
  }, [clinics, searchParams])

  const [selected, setSelected] = useState<Set<string>>(initialSelection)

  // Sync to URL when selection changes (replace, not push, to avoid back-button noise)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (selected.has(ALL) || selected.size === 0) {
      params.delete('clinics')
    } else {
      params.set('clinics', Array.from(selected).join(','))
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  function toggleClinic(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (id === ALL) return new Set([ALL])
      next.delete(ALL)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (next.size === 0) return new Set([ALL])
      return next
    })
  }

  function selectAll() {
    setSelected(new Set([ALL]))
  }

  // Resolve the active clinics based on selection
  const activeClinics = useMemo(() => {
    if (selected.has(ALL)) return clinics
    return clinics.filter((c) => selected.has(c.clinicId))
  }, [clinics, selected])

  // Aggregate KPIs across active clinics
  const agg = useMemo(() => {
    const sum = (key: keyof ClinicMetrics) =>
      activeClinics.reduce((a, c) => a + (typeof c[key] === 'number' ? (c[key] as number) : 0), 0)

    const callsToday = sum('callsToday')
    const callsYesterday = sum('callsYesterday')
    const callbacksToday = sum('callbacksToday')
    const callbacksActioned = sum('callbacksActioned')
    const callbacksYesterday = sum('callbacksYesterday')
    const urgentToday = sum('urgentToday')
    const urgentActioned = sum('urgentActioned')
    const urgentYesterday = sum('urgentYesterday')
    const bookingsToday = sum('bookingsToday')
    const bookingsYesterday = sum('bookingsYesterday')
    const afterHoursToday = sum('afterHoursToday')
    const afterHoursYesterday = sum('afterHoursYesterday')

    // Avg duration is weighted by call counts (so it's a true average, not avg-of-averages)
    const totalDurToday = activeClinics.reduce(
      (a, c) => a + c.avgDurationToday * c.callsToday, 0,
    )
    const totalDurYesterday = activeClinics.reduce(
      (a, c) => a + c.avgDurationYesterday * c.callsYesterday, 0,
    )
    const avgDurationToday = callsToday > 0 ? totalDurToday / callsToday : 0
    const avgDurationYesterday = callsYesterday > 0 ? totalDurYesterday / callsYesterday : 0
    const durationDiff = Math.round(avgDurationToday - avgDurationYesterday)
    const durationDelta: { text: string; type: 'up' | 'down' | 'neutral' } =
      Math.abs(durationDiff) <= 10 ? { text: '~0s', type: 'neutral' }
      : durationDiff < 0 ? { text: `${Math.abs(durationDiff)}s shorter`, type: 'up' }
      : { text: `${durationDiff}s longer`, type: 'down' }

    return {
      callsToday, callsYesterday, callsDelta: pctDelta(callsToday, callsYesterday),
      callbacksToday, callbacksActioned, callbacksYesterday, callbacksDelta: pctDelta(callbacksToday, callbacksYesterday),
      urgentToday, urgentActioned, urgentYesterday, urgentDelta: pctDelta(urgentToday, urgentYesterday),
      bookingsToday, bookingsYesterday, bookingsDelta: pctDelta(bookingsToday, bookingsYesterday),
      afterHoursToday, afterHoursYesterday, afterHoursDelta: pctDelta(afterHoursToday, afterHoursYesterday),
      avgDurationToday, durationDelta,
    }
  }, [activeClinics])

  // Aggregate hourly chart (sum across active clinics, 08:00–18:00)
  const chartData = useMemo(() => {
    const buckets: Record<number, { handled: number; callbacks: number }> = {}
    for (let h = 8; h <= 18; h++) buckets[h] = { handled: 0, callbacks: 0 }
    for (const c of activeClinics) {
      for (const point of c.hourly) {
        if (buckets[point.hour]) {
          buckets[point.hour].handled += point.handled
          buckets[point.hour].callbacks += point.callbacks
        }
      }
    }
    return Object.entries(buckets).map(([h, v]) => ({
      label: `${parseInt(h) > 12 ? parseInt(h) - 12 : h}${parseInt(h) >= 12 ? 'pm' : 'am'}`,
      handled: v.handled,
      callbacks: v.callbacks,
    }))
  }, [activeClinics])

  function drillInto(clinicId: string) {
    fetch('/api/clinic-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicId }),
    }).then(() => router.refresh())
  }

  const allSelected = selected.has(ALL)
  const selectedCount = allSelected ? clinics.length : selected.size

  return (
    <div className="-m-6 min-h-screen" style={{ backgroundColor: '#F4F6F9' }}>
      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-[#0A2540] font-heading leading-tight">
              Portfolio Overview
            </h1>
            <p className="text-[13px] text-[#637381] mt-0.5">
              {roleLabel} · {todayLabel} · {selectedCount} of {clinics.length} clinic{clinics.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Clinic picker */}
        <div className="bg-white rounded-lg p-4" style={{ border: '1.5px solid #DDE1E7' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-4 rounded-full bg-[#1A5FA8]" />
              <h3 className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#8A94A6]">
                Clinics in view
              </h3>
            </div>
            {!allSelected && (
              <button
                onClick={selectAll}
                className="text-[11px] font-semibold text-[#1A5FA8] hover:underline"
              >
                Select all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={selectAll}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors',
                allSelected
                  ? 'bg-[#0A7A5B] text-white border-[#0A7A5B]'
                  : 'bg-white text-[#637381] border-[#DDE1E7] hover:border-[#0A7A5B] hover:text-[#0A7A5B]',
              )}
            >
              All Clinics
              <span className={cn(
                'text-[10px] px-1.5 rounded-full',
                allSelected ? 'bg-white/20' : 'bg-[#F4F6F9]',
              )}>
                {clinics.length}
              </span>
            </button>
            {clinics.map((c) => {
              const isOn = !allSelected && selected.has(c.clinicId)
              return (
                <button
                  key={c.clinicId}
                  onClick={() => toggleClinic(c.clinicId)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors',
                    isOn
                      ? 'bg-[#E5F9F8] text-[#0A7A5B] border-[#0A7A5B]'
                      : 'bg-white text-[#637381] border-[#DDE1E7] hover:border-[#B0BAC9] hover:text-[#0A2540]',
                  )}
                >
                  {c.clinicName}
                </button>
              )
            })}
          </div>
        </div>

        {/* Aggregate KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            label="Calls Answered"
            value={String(agg.callsToday)}
            compareStat={`vs ${agg.callsYesterday} yesterday`}
            delta={agg.callsDelta.text}
            deltaType={agg.callsDelta.type}
            iconBg="#EAF7F1"
            iconColor="#0A7A5B"
            icon={icons.phone}
          />
          <KpiCard
            label="Callbacks Requested"
            value={String(agg.callbacksToday)}
            compareStat={`${agg.callbacksActioned} actioned`}
            delta={agg.callbacksDelta.text}
            deltaType={agg.callbacksDelta.type}
            iconBg="#FEF0F5"
            iconColor="#A0305A"
            icon={icons.callback}
          />
          <KpiCard
            label="Urgent Flags"
            value={String(agg.urgentToday)}
            compareStat={`${agg.urgentActioned} actioned`}
            delta={agg.urgentDelta.text}
            deltaType={agg.urgentToday > agg.urgentYesterday ? 'down' : agg.urgentToday < agg.urgentYesterday ? 'up' : 'neutral'}
            iconBg="#FEF5E4"
            iconColor="#B7641C"
            icon={icons.flag}
          />
          <KpiCard
            label="Bookings Captured"
            value={String(agg.bookingsToday)}
            compareStat={`vs ${agg.bookingsYesterday} yesterday`}
            delta={agg.bookingsDelta.text}
            deltaType={agg.bookingsDelta.type}
            iconBg="#F2EEFB"
            iconColor="#6B3FA0"
            icon={icons.calendar}
          />
          <KpiCard
            label="Avg Duration"
            value={agg.avgDurationToday > 0 ? formatDuration(agg.avgDurationToday) : '—'}
            compareStat={agg.durationDelta.text === '~0s' ? 'Same as yesterday' : `${agg.durationDelta.text} than yesterday`}
            delta={agg.durationDelta.text}
            deltaType={agg.durationDelta.type}
            iconBg="#E6F0FB"
            iconColor="#1A5FA8"
            icon={icons.clock}
          />
          <KpiCard
            label="After-hours Calls"
            value={String(agg.afterHoursToday)}
            compareStat={`vs ${agg.afterHoursYesterday} yesterday`}
            delta={agg.afterHoursDelta.text}
            deltaType={agg.afterHoursDelta.type}
            iconBg="#E6F0FB"
            iconColor="#1A5FA8"
            icon={icons.clock}
          />
        </div>

        {/* Per-clinic breakdown + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5">

          {/* Per-clinic breakdown table */}
          <div className="bg-white rounded-lg" style={{ border: '1.5px solid #DDE1E7' }}>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-4 rounded-full bg-[#0A7A5B]" />
                <h3 className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#8A94A6]">
                  Per-clinic breakdown — Today
                </h3>
              </div>
              <span className="text-[11px] text-[#8A94A6]">
                Click a row to drill in
              </span>
            </div>

            {activeClinics.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[#8A94A6]">
                No clinics selected.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.5px] font-bold text-[#8A94A6] bg-[#FAFBFC] border-y border-[#EEF1F4]">
                      <th className="px-5 py-2.5 font-bold">Clinic</th>
                      <th className="px-3 py-2.5 font-bold text-right">Calls</th>
                      <th className="px-3 py-2.5 font-bold text-right">Urgent</th>
                      <th className="px-3 py-2.5 font-bold text-right">Bookings</th>
                      <th className="px-3 py-2.5 font-bold text-right">After-hrs</th>
                      <th className="px-3 py-2.5 font-bold text-right">Avg Dur</th>
                      <th className="px-5 py-2.5 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {activeClinics
                      .slice()
                      .sort((a, b) => b.callsToday - a.callsToday)
                      .map((c) => {
                        const delta = pctDelta(c.callsToday, c.callsYesterday)
                        return (
                          <tr
                            key={c.clinicId}
                            onClick={() => drillInto(c.clinicId)}
                            className="border-b border-[#EEF1F4] last:border-b-0 hover:bg-[#FAFBFC] cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div className="text-[13px] font-semibold text-[#0A2540]">{c.clinicName}</div>
                              <div className="text-[11px] text-[#8A94A6]">
                                {c.suburb ?? c.vertical}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="text-[13px] font-semibold text-[#0A2540] tabular-nums">{c.callsToday}</div>
                              <div className={cn(
                                'text-[10px] tabular-nums',
                                delta.type === 'up' ? 'text-[#0A7A5B]' :
                                delta.type === 'down' ? 'text-[#C0392B]' : 'text-[#8A94A6]',
                              )}>
                                {delta.text}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right text-[13px] text-[#0A2540] tabular-nums">
                              {c.urgentToday > 0 ? (
                                <span className="font-semibold text-[#B7641C]">{c.urgentToday}</span>
                              ) : (
                                <span className="text-[#B0BAC9]">0</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right text-[13px] text-[#0A2540] tabular-nums">
                              {c.bookingsToday}
                            </td>
                            <td className="px-3 py-3 text-right text-[13px] text-[#0A2540] tabular-nums">
                              {c.afterHoursToday}
                            </td>
                            <td className="px-3 py-3 text-right text-[13px] text-[#637381] tabular-nums">
                              {formatDuration(c.avgDurationToday)}
                            </td>
                            <td className="px-5 py-3 text-[#B0BAC9]">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M6 3l5 5-5 5" />
                              </svg>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Aggregate hourly chart */}
          <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-[3px] h-4 rounded-full bg-[#0A7A5B]" />
              <h3 className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#8A94A6]">
                Call Volume — Today (aggregate)
              </h3>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="0" stroke="#F0F2F5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#B0BAC9' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#B0BAC9' }} tickLine={false} axisLine={false} allowDecimals={false} />
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
                  <Bar dataKey="handled" name="Handled by Stella" fill="#0A7A5B" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="callbacks" name="Callbacks" fill="#B7641C" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-[11px] text-[#637381]">
                <span className="inline-block w-[10px] h-[3px] rounded-full bg-[#0A7A5B]" />
                Handled by Stella
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#637381]">
                <span className="inline-block w-[10px] h-[3px] rounded-full bg-[#B7641C]" />
                Callbacks
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
