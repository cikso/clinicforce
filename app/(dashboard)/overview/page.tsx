import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getAccessibleClinics } from '@/lib/supabase/clinic-scope'
import KpiCard from './components/KpiCard'
import OverviewHeader from './components/OverviewHeader'
import CallVolumeChart, { type ChartDataPoint } from './components/CallVolumeChart'
import TaskList, { type Task } from './TaskList'
import PortfolioOverview, { type ClinicMetrics } from './PortfolioOverview'

export const metadata: Metadata = { title: 'Overview — ClinicForce' }
export const dynamic = 'force-dynamic'

/* ─── Sydney timezone helpers ─── */

function sydneyUTCOffset(dateStr: string): string {
  const probe = new Date(`${dateStr}T12:00:00Z`)
  const localStr = probe.toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
  const local = new Date(localStr)
  const diffMins = Math.round((local.getTime() - probe.getTime()) / 60_000)
  const sign = diffMins >= 0 ? '+' : '-'
  const h = String(Math.floor(Math.abs(diffMins) / 60)).padStart(2, '0')
  const m = String(Math.abs(diffMins) % 60).padStart(2, '0')
  return `${sign}${h}:${m}`
}

function sydneyDayBounds(daysAgo: number): { start: string; end: string } {
  const ref = new Date(Date.now() - daysAgo * 86_400_000)
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ref)
  const y  = parts.find(p => p.type === 'year')!.value
  const mo = parts.find(p => p.type === 'month')!.value
  const d  = parts.find(p => p.type === 'day')!.value
  const dateStr = `${y}-${mo}-${d}`
  const offset = sydneyUTCOffset(dateStr)
  const start  = new Date(`${dateStr}T00:00:00${offset}`)
  const end    = new Date(start.getTime() + 86_400_000)
  return { start: start.toISOString(), end: end.toISOString() }
}

/* ─── KPI Icons ─── */

const icons = {
  phone: (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  ),
  callback: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9v3a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2 12V4.5A1.5 1.5 0 0 1 3.5 3H7" />
      <path d="M10 2h4v4M14 2L7.5 8.5" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
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
}

/* ─── Helpers ─── */

function pctDelta(today: number, yesterday: number): { text: string; type: 'up' | 'down' | 'neutral' } {
  if (yesterday === 0 && today === 0) return { text: '0%', type: 'neutral' }
  if (yesterday === 0) return { text: '+100%', type: 'up' }
  const pct = Math.round(((today - yesterday) / yesterday) * 100)
  if (pct === 0) return { text: '0%', type: 'neutral' }
  if (pct > 0) return { text: `+${pct}%`, type: 'up' }
  return { text: `${pct}%`, type: 'down' }
}

function formatDuration(secs: number): string {
  if (secs <= 0) return '0s'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function sydneyHour(iso: string): number {
  try {
    const d = new Date(iso)
    const str = d.toLocaleString('en-US', { timeZone: 'Australia/Sydney', hour: 'numeric', hour12: false })
    return parseInt(str, 10)
  } catch { return 0 }
}

function sydneyWeekday(iso: string): number {
  // 0 = Sun, 6 = Sat
  try {
    const d = new Date(iso)
    const name = d.toLocaleDateString('en-US', { timeZone: 'Australia/Sydney', weekday: 'short' })
    return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[name as 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'] ?? 0
  } catch { return 0 }
}

function sydneyDayLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short' })
  } catch { return '—' }
}

function sydneyDateLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', day: 'numeric', month: 'short' })
  } catch { return '—' }
}

/* ─── Page ─── */

type CallRow = {
  id: string
  caller_name: string
  summary: string
  urgency: string
  status: string
  action_required: string | null
  call_duration_seconds: number | null
  created_at: string
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const service = serviceRoleKey
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
    : null

  // Onboarding gate
  if (user && service) {
    const { data: cu } = await service
      .from('clinic_users')
      .select('role, clinics(onboarding_completed)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    const role = cu?.role as string | undefined
    if (role !== 'platform_owner' && cu) {
      const clinic = Array.isArray(cu.clinics) ? cu.clinics[0] : cu.clinics
      const done = (clinic as { onboarding_completed?: boolean } | null)?.onboarding_completed === true
      if (!done) redirect('/onboarding/clinic-details')
    }
  }

  const profile = await getClinicProfile()
  const clinicId = profile?.clinicId ?? ''
  const db = service ?? supabase

  const today = sydneyDayBounds(0)
  const yesterday = sydneyDayBounds(1)

  /* ─── Multi-clinic branch (founder / clinic_owner) ───
   * If the user is multi-clinic AND has not drilled into a specific clinic
   * (no cf_active_clinic cookie → clinicId is empty), render the portfolio view.
   * If they HAVE drilled in (clinicId is set), fall through to the single-clinic
   * dashboard so they can see one clinic's command centre. */
  if (profile?.isMultiClinic && !clinicId) {
    const accessible = await getAccessibleClinics(profile.userId, profile.userRole)

    if (accessible.length === 0) {
      return (
        <div className="-m-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F6F9' }}>
          <div className="bg-white rounded-lg p-8 max-w-md text-center" style={{ border: '1.5px solid #DDE1E7' }}>
            <h1 className="text-[18px] font-bold text-[#0A2540] mb-2 font-heading">No clinics yet</h1>
            <p className="text-[13px] text-[#637381]">
              {profile.userRole === 'platform_owner'
                ? 'Create the first clinic from Clinic Admin to populate this view.'
                : 'You don’t own any clinics yet. The platform owner will assign clinics to you.'}
            </p>
          </div>
        </div>
      )
    }

    const clinicIds = accessible.map((c) => c.id)

    // Single bulk fetch: today + yesterday across every accessible clinic
    const [todayBulkRes, yesterdayBulkRes] = await Promise.all([
      db
        .from('call_inbox')
        .select('clinic_id, summary, urgency, status, action_required, call_duration_seconds, created_at')
        .in('clinic_id', clinicIds)
        .gte('created_at', today.start)
        .lt('created_at', today.end),
      db
        .from('call_inbox')
        .select('clinic_id, summary, urgency, action_required, call_duration_seconds, created_at')
        .in('clinic_id', clinicIds)
        .gte('created_at', yesterday.start)
        .lt('created_at', yesterday.end),
    ])

    type TodayCall = {
      clinic_id: string
      summary: string | null
      urgency: string
      status: string
      action_required: string | null
      call_duration_seconds: number | null
      created_at: string
    }
    type YesterdayCall = Omit<TodayCall, 'status'>
    const todayCalls = (todayBulkRes.data ?? []) as TodayCall[]
    const yesterdayCalls = (yesterdayBulkRes.data ?? []) as YesterdayCall[]

    const bookingKeywords = /\b(appointment|booking|check.?up|vaccination|dental|desex|neuter|spay)\b/i
    const isAfterHoursIso = (iso: string) => {
      const h = sydneyHour(iso)
      const dow = sydneyWeekday(iso)
      return dow === 0 || dow === 6 || h < 8 || h >= 18
    }

    // Bucket calls by clinic for fast aggregation per clinic
    const byClinicToday = new Map<string, TodayCall[]>()
    for (const c of todayCalls) {
      const arr = byClinicToday.get(c.clinic_id) ?? []
      arr.push(c)
      byClinicToday.set(c.clinic_id, arr)
    }
    const byClinicYesterday = new Map<string, YesterdayCall[]>()
    for (const c of yesterdayCalls) {
      const arr = byClinicYesterday.get(c.clinic_id) ?? []
      arr.push(c)
      byClinicYesterday.set(c.clinic_id, arr)
    }

    const metrics: ClinicMetrics[] = accessible.map((clinic) => {
      const t = byClinicToday.get(clinic.id) ?? []
      const y = byClinicYesterday.get(clinic.id) ?? []

      const callbacksToday = t.filter((c) => c.action_required).length
      const callbacksActioned = t.filter((c) => c.action_required && c.status === 'ACTIONED').length
      const callbacksYesterday = y.filter((c) => c.action_required).length

      const urgentToday = t.filter((c) => c.urgency === 'URGENT' || c.urgency === 'CRITICAL').length
      const urgentActioned = t.filter((c) => (c.urgency === 'URGENT' || c.urgency === 'CRITICAL') && c.status === 'ACTIONED').length
      const urgentYesterday = y.filter((c) => c.urgency === 'URGENT' || c.urgency === 'CRITICAL').length

      const bookingsToday = t.filter((c) => bookingKeywords.test(c.summary ?? '')).length
      const bookingsYesterday = y.filter((c) => bookingKeywords.test(c.summary ?? '')).length

      const afterHoursToday = t.filter((c) => isAfterHoursIso(c.created_at)).length
      const afterHoursYesterday = y.filter((c) => isAfterHoursIso(c.created_at)).length

      const dToday = t.map((c) => c.call_duration_seconds).filter((d): d is number => d !== null && d > 0)
      const dYesterday = y.map((c) => c.call_duration_seconds).filter((d): d is number => d !== null && d > 0)
      const avgDurationToday = dToday.length > 0 ? dToday.reduce((a, b) => a + b, 0) / dToday.length : 0
      const avgDurationYesterday = dYesterday.length > 0 ? dYesterday.reduce((a, b) => a + b, 0) / dYesterday.length : 0

      // Hourly buckets 08:00–18:00
      const hourly: { hour: number; handled: number; callbacks: number }[] = []
      for (let h = 8; h <= 18; h++) {
        const inHour = t.filter((c) => sydneyHour(c.created_at) === h)
        hourly.push({
          hour: h,
          handled: inHour.length,
          callbacks: inHour.filter((c) => c.action_required).length,
        })
      }

      return {
        clinicId: clinic.id,
        clinicName: clinic.name,
        vertical: clinic.vertical,
        suburb: clinic.suburb,
        callsToday: t.length,
        callbacksToday, callbacksActioned,
        urgentToday, urgentActioned,
        bookingsToday,
        afterHoursToday,
        avgDurationToday,
        callsYesterday: y.length,
        callbacksYesterday,
        urgentYesterday,
        bookingsYesterday,
        afterHoursYesterday,
        avgDurationYesterday,
        hourly,
      }
    })

    const todayLabel = new Date().toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const roleLabel = profile.userRole === 'platform_owner' ? 'Platform owner' : 'Clinic owner'

    return <PortfolioOverview clinics={metrics} todayLabel={todayLabel} roleLabel={roleLabel} />
  }


  // ── Parallel queries ──
  const [
    todayCallsRes,
    yesterdayCallsRes,
    clinicRes,
    last7dCallsRes,
    last30dCallsRes,
    tasksRes,
  ] = await Promise.all([
    // Today's calls (full rows for KPI computation + chart)
    clinicId ? db
      .from('call_inbox')
      .select('id, caller_name, summary, urgency, status, action_required, call_duration_seconds, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', today.start)
      .lt('created_at', today.end) : Promise.resolve({ data: [] }),

    // Yesterday's calls
    clinicId ? db
      .from('call_inbox')
      .select('id, urgency, status, action_required, call_duration_seconds, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', yesterday.start)
      .lt('created_at', yesterday.end) : Promise.resolve({ data: [] }),

    // Clinic record (coverage + name)
    clinicId ? db
      .from('clinics')
      .select('name, coverage_mode, coverage_mode_activated_at, coverage_mode_activated_by')
      .eq('id', clinicId)
      .maybeSingle() : Promise.resolve({ data: null }),

    // Last 7 days calls (for chart)
    clinicId ? db
      .from('call_inbox')
      .select('id, action_required, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', sydneyDayBounds(6).start)
      .lt('created_at', today.end) : Promise.resolve({ data: [] }),

    // Last 30 days calls (for chart)
    clinicId ? db
      .from('call_inbox')
      .select('id, action_required, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', sydneyDayBounds(29).start)
      .lt('created_at', today.end) : Promise.resolve({ data: [] }),

    // Unresolved tasks (newest first, cap 10)
    clinicId ? db
      .from('call_inbox')
      .select('id, caller_name, summary, urgency, action_required, created_at')
      .eq('clinic_id', clinicId)
      .not('action_required', 'is', null)
      .neq('status', 'ACTIONED')
      .order('created_at', { ascending: false })
      .limit(10) : Promise.resolve({ data: [] }),
  ])

  const todayCalls = (todayCallsRes.data ?? []) as CallRow[]
  const yesterdayCalls = (yesterdayCallsRes.data ?? []) as Array<{ id: string; urgency: string; status: string; action_required: string | null; call_duration_seconds: number | null; created_at: string }>
  const clinicRecord = clinicRes.data as { name: string; coverage_mode: string; coverage_mode_activated_at: string | null; coverage_mode_activated_by: string | null } | null

  // ── KPI computations ──

  // KPI 1: Total Calls
  const totalToday = todayCalls.length
  const totalYesterday = yesterdayCalls.length
  const totalDelta = pctDelta(totalToday, totalYesterday)

  // KPI 2: Answer Rate (always 100%)
  // KPI 3: Callbacks Requested (action_required IS NOT NULL)
  const callbacksToday = todayCalls.filter(c => c.action_required).length
  const callbacksActioned = todayCalls.filter(c => c.action_required && c.status === 'ACTIONED').length
  const callbacksYesterday = yesterdayCalls.filter(c => c.action_required).length
  const callbackDelta = pctDelta(callbacksToday, callbacksYesterday)

  // KPI 4: Avg Duration
  const durationsToday = todayCalls.map(c => c.call_duration_seconds).filter((d): d is number => d !== null && d > 0)
  const avgToday = durationsToday.length > 0 ? durationsToday.reduce((a, b) => a + b, 0) / durationsToday.length : 0
  const durationsYesterday = yesterdayCalls.map(c => c.call_duration_seconds).filter((d): d is number => d !== null && d > 0)
  const avgYesterday = durationsYesterday.length > 0 ? durationsYesterday.reduce((a, b) => a + b, 0) / durationsYesterday.length : 0
  const durationDiff = Math.round(avgToday - avgYesterday)
  const durationDelta: { text: string; type: 'up' | 'down' | 'neutral' } =
    Math.abs(durationDiff) <= 10 ? { text: '~0s', type: 'neutral' }
    : durationDiff < 0 ? { text: `${Math.abs(durationDiff)}s shorter`, type: 'up' }
    : { text: `${durationDiff}s longer`, type: 'down' }

  // KPI 5: Urgent Flags
  const urgentToday = todayCalls.filter(c => c.urgency === 'URGENT' || c.urgency === 'CRITICAL').length
  const urgentActioned = todayCalls.filter(c => (c.urgency === 'URGENT' || c.urgency === 'CRITICAL') && c.status === 'ACTIONED').length
  const urgentYesterday = yesterdayCalls.filter(c => c.urgency === 'URGENT' || c.urgency === 'CRITICAL').length
  const urgentDelta = pctDelta(urgentYesterday, urgentToday) // inverted: fewer urgent is good

  // KPI 6: Bookings Captured (summary contains appointment/booking keywords)
  const bookingKeywords = /\b(appointment|booking|check.?up|vaccination|dental|desex|neuter|spay)\b/i
  const bookingsToday = todayCalls.filter(c => bookingKeywords.test(c.summary ?? '')).length
  const bookingsYesterday = yesterdayCalls.filter(c => bookingKeywords.test((c as unknown as { summary?: string }).summary ?? '')).length
  const bookingDelta = pctDelta(bookingsToday, bookingsYesterday)

  // KPI 7: After-hours calls (outside Mon–Fri 08:00–18:00 Sydney)
  const isAfterHours = (iso: string) => {
    const h = sydneyHour(iso)
    const dow = sydneyWeekday(iso)
    return dow === 0 || dow === 6 || h < 8 || h >= 18
  }
  const afterHoursToday = todayCalls.filter(c => isAfterHours(c.created_at)).length
  const afterHoursYesterday = yesterdayCalls.filter(c => isAfterHours(c.created_at)).length
  const afterHoursDelta = pctDelta(afterHoursToday, afterHoursYesterday)

  // ── Unresolved tasks (client component input) ──
  const tasks = (tasksRes.data ?? []) as Task[]

  // ── Coverage Panel Data ──
  const coverageMode = (clinicRecord?.coverage_mode as string) ?? 'after_hours'

  // ── Chart Data ──
  // Hourly (today)
  const hourlyMap: Record<number, { handled: number; callbacks: number }> = {}
  for (let h = 8; h <= 18; h++) hourlyMap[h] = { handled: 0, callbacks: 0 }
  for (const call of todayCalls) {
    const h = sydneyHour(call.created_at)
    if (h >= 8 && h <= 18) {
      hourlyMap[h].handled++
      if (call.action_required) hourlyMap[h].callbacks++
    }
  }
  const hourlyData: ChartDataPoint[] = Object.entries(hourlyMap).map(([h, v]) => ({
    label: `${parseInt(h) > 12 ? parseInt(h) - 12 : h}${parseInt(h) >= 12 ? 'pm' : 'am'}`,
    handled: v.handled,
    callbacks: v.callbacks,
  }))

  // Weekly (7d)
  const last7d = (last7dCallsRes.data ?? []) as Array<{ id: string; action_required: string | null; created_at: string }>
  const weekMap: Record<string, { handled: number; callbacks: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const bounds = sydneyDayBounds(i)
    const label = sydneyDayLabel(bounds.start)
    weekMap[label] = { handled: 0, callbacks: 0 }
  }
  for (const call of last7d) {
    const label = sydneyDayLabel(call.created_at)
    if (weekMap[label]) {
      weekMap[label].handled++
      if (call.action_required) weekMap[label].callbacks++
    }
  }
  const weeklyData: ChartDataPoint[] = Object.entries(weekMap).map(([label, v]) => ({
    label, handled: v.handled, callbacks: v.callbacks,
  }))

  // Monthly (30d)
  const last30d = (last30dCallsRes.data ?? []) as Array<{ id: string; action_required: string | null; created_at: string }>
  const monthMap: Record<string, { handled: number; callbacks: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const bounds = sydneyDayBounds(i)
    const label = sydneyDateLabel(bounds.start)
    monthMap[label] = { handled: 0, callbacks: 0 }
  }
  for (const call of last30d) {
    const label = sydneyDateLabel(call.created_at)
    if (monthMap[label]) {
      monthMap[label].handled++
      if (call.action_required) monthMap[label].callbacks++
    }
  }
  const monthlyData: ChartDataPoint[] = Object.entries(monthMap).map(([label, v]) => ({
    label, handled: v.handled, callbacks: v.callbacks,
  }))

  // ── Today's date pill ──
  const todayLabel = new Date().toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="-m-6 min-h-screen" style={{ backgroundColor: '#F4F6F9' }}>
      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-4">
        {/* ── Page Header with Coverage Controls ── */}
        <OverviewHeader
          initialMode={coverageMode}
          clinicId={clinicId}
          todayLabel={todayLabel}
        />

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            label="Calls Answered"
            value={String(totalToday)}
            compareStat={`vs ${totalYesterday} yesterday`}
            delta={totalDelta.text}
            deltaType={totalDelta.type}
            iconBg="#EAF7F1"
            iconColor="#0A7A5B"
            icon={icons.phone}
          />
          <KpiCard
            label="Callbacks Requested"
            value={String(callbacksToday)}
            compareStat={`${callbacksActioned} actioned by staff`}
            delta={callbackDelta.text}
            deltaType={callbackDelta.type}
            iconBg="#FEF0F5"
            iconColor="#A0305A"
            icon={icons.callback}
          />
          <KpiCard
            label="Urgent Flags"
            value={String(urgentToday)}
            compareStat={`${urgentActioned} actioned`}
            delta={urgentDelta.text}
            deltaType={urgentToday > urgentYesterday ? 'down' : urgentToday < urgentYesterday ? 'up' : 'neutral'}
            iconBg="#FEF5E4"
            iconColor="#B7641C"
            icon={icons.flag}
          />
          <KpiCard
            label="Bookings Captured"
            value={String(bookingsToday)}
            compareStat={`vs ${bookingsYesterday} yesterday`}
            delta={bookingDelta.text}
            deltaType={bookingDelta.type}
            iconBg="#F2EEFB"
            iconColor="#6B3FA0"
            icon={icons.calendar}
          />
          <KpiCard
            label="Avg Duration"
            value={avgToday > 0 ? formatDuration(avgToday) : '—'}
            compareStat={durationDelta.text === '~0s' ? 'Same as yesterday' : `${durationDelta.text} than yesterday`}
            delta={durationDelta.text}
            deltaType={durationDelta.type}
            iconBg="#E6F0FB"
            iconColor="#1A5FA8"
            icon={icons.clock}
          />
          <KpiCard
            label="After-hours Calls"
            value={String(afterHoursToday)}
            compareStat={`vs ${afterHoursYesterday} yesterday`}
            delta={afterHoursDelta.text}
            deltaType={afterHoursDelta.type}
            iconBg="#E6F0FB"
            iconColor="#1A5FA8"
            icon={icons.clock}
          />
        </div>

        {/* ── Tasks + Call Volume ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5">
          <TaskList tasks={tasks} />
          <CallVolumeChart
            hourlyData={hourlyData}
            weeklyData={weeklyData}
            monthlyData={monthlyData}
          />
        </div>
      </div>
    </div>
  )
}
