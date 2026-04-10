import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import StatCard from '@/app/components/ui/StatCard'
import CoverageControl, { type CoverageMode } from '@/app/components/overview/CoverageControl'
import ActionQueuePreview from '@/app/components/overview/ActionQueuePreview'
import ActivityFeed from '@/app/components/overview/ActivityFeed'

export const metadata: Metadata = { title: 'Command Centre — ClinicForce' }
export const dynamic = 'force-dynamic'

/* ─── Sydney timezone helpers (matches /api/stats) ─── */

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

function pctChange(today: number, yesterday: number): { value: string; direction: 'up' | 'down' | 'neutral' } {
  if (yesterday === 0 && today === 0) return { value: 'No change', direction: 'neutral' }
  if (yesterday === 0) return { value: `+${today} from yesterday`, direction: 'up' }
  const pct = Math.round(((today - yesterday) / yesterday) * 100)
  if (pct === 0) return { value: 'Same as yesterday', direction: 'neutral' }
  if (pct > 0) return { value: `${pct}% from yesterday`, direction: 'up' }
  return { value: `${Math.abs(pct)}% from yesterday`, direction: 'down' }
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
      const onboardingCompleted = (clinic as { onboarding_completed?: boolean } | null)?.onboarding_completed === true
      if (!onboardingCompleted) {
        redirect('/onboarding/clinic-details')
      }
    }
  }

  const profile = await getClinicProfile()
  const clinicId = profile?.clinicId ?? ''
  const db = service ?? supabase

  // ── Compute day boundaries ──
  const today = sydneyDayBounds(0)
  const yesterday = sydneyDayBounds(1)

  // ── Parallel queries ──
  const [
    todayCallsRes,
    yesterdayCallsRes,
    todayBookingsRes,
    yesterdayBookingsRes,
    pendingTasksRes,
    todayTasksRes,
    recentCallsRes,
    coverageRes,
    voiceAgentRes,
    clinicRes,
  ] = await Promise.all([
    // Today's calls
    clinicId ? db
      .from('call_inbox')
      .select('id, urgency, status, action_required')
      .eq('clinic_id', clinicId)
      .gte('created_at', today.start)
      .lt('created_at', today.end) : Promise.resolve({ data: null }),

    // Yesterday's calls
    clinicId ? db
      .from('call_inbox')
      .select('id, urgency, status')
      .eq('clinic_id', clinicId)
      .gte('created_at', yesterday.start)
      .lt('created_at', yesterday.end) : Promise.resolve({ data: null }),

    // Today's bookings
    clinicId ? db
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', today.start)
      .lt('created_at', today.end) : Promise.resolve({ data: null, count: 0 }),

    // Yesterday's bookings
    clinicId ? db
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', yesterday.start)
      .lt('created_at', yesterday.end) : Promise.resolve({ data: null, count: 0 }),

    // Pending tasks count
    clinicId ? db
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDING') : Promise.resolve({ data: null, count: 0 }),

    // Tasks created today
    clinicId ? db
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', today.start)
      .lt('created_at', today.end) : Promise.resolve({ data: null, count: 0 }),

    // Recent calls for activity feed (last 10)
    clinicId ? db
      .from('call_inbox')
      .select('id, caller_name, summary, urgency, status, action_required, created_at, industry_data')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(10) : Promise.resolve({ data: null }),

    // Coverage session
    clinicId ? db
      .from('coverage_sessions')
      .select('status, reason, started_at')
      .eq('clinic_id', clinicId)
      .maybeSingle() : Promise.resolve({ data: null }),

    // Voice agent
    clinicId ? db
      .from('voice_agents')
      .select('mode, is_active')
      .eq('clinic_id', clinicId)
      .limit(1)
      .maybeSingle() : Promise.resolve({ data: null }),

    // Clinic (for call_handling_prefs and industry_config)
    clinicId ? db
      .from('clinics')
      .select('call_handling_prefs, industry_config')
      .eq('id', clinicId)
      .maybeSingle() : Promise.resolve({ data: null }),
  ])

  // ── Process KPI data ──
  const todayCalls = (todayCallsRes.data as Array<{ id: string; urgency: string; status: string; action_required: string | null }>) ?? []
  const yesterdayCalls = (yesterdayCallsRes.data as Array<{ id: string }>) ?? []

  const callsToday = todayCalls.length
  const callsYesterday = yesterdayCalls.length
  const callsDelta = pctChange(callsToday, callsYesterday)

  const bookingsToday = (todayBookingsRes as { count?: number | null }).count ?? 0
  const bookingsYesterday = (yesterdayBookingsRes as { count?: number | null }).count ?? 0
  const bookingsDelta = pctChange(bookingsToday, bookingsYesterday)

  // Missed = calls where action_required is set but not actioned, OR status is MISSED
  const missedCalls = todayCalls.filter(c =>
    c.status === 'MISSED' || (c.action_required && c.status !== 'ACTIONED')
  ).length
  const missedRevenue = missedCalls * 280

  const pendingTasks = (pendingTasksRes as { count?: number | null }).count ?? 0
  const todayNewTasks = (todayTasksRes as { count?: number | null }).count ?? 0

  // ── Top 5 pending tasks for Action Queue ──
  let topTasks: Array<{ id: string; title: string; description: string | null; priority: string; status: string; created_at: string; case_id: string | null }> = []
  if (clinicId) {
    const { data: taskRows } = await db
      .from('tasks')
      .select('id, title, description, priority, status, created_at, case_id')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDING')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5)
    topTasks = (taskRows ?? []) as typeof topTasks
  }

  // ── Coverage data ──
  const coverage = coverageRes.data as { status: string; reason: string; started_at: string | null } | null
  const isActive = coverage?.status === 'ACTIVE'
  const coverageMode: CoverageMode | null = isActive ? ((coverage?.reason as CoverageMode) ?? null) : null

  // Count calls covered since session started
  let callsCoveredSince = 0
  if (isActive && coverage?.started_at && clinicId) {
    const { count } = await db
      .from('call_inbox')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', coverage.started_at)
    callsCoveredSince = count ?? 0
  }

  // ── Clinic prefs + industry config ──
  const clinicData = clinicRes.data as { call_handling_prefs: Record<string, boolean> | null; industry_config: Record<string, unknown> | null } | null
  const callHandlingPrefs = clinicData?.call_handling_prefs ?? {}
  const industryConfig = clinicData?.industry_config ?? null
  const extraFields = (industryConfig as { extra_fields?: unknown[] } | null)?.extra_fields
  const hasExtraFields = Array.isArray(extraFields) && extraFields.length > 0

  // ── Recent calls for activity feed ──
  const recentCalls = (recentCallsRes.data ?? []) as Array<{
    id: string
    caller_name: string
    summary: string
    urgency: string
    status: string
    action_required: string | null
    created_at: string
    industry_data: Record<string, unknown> | null
  }>

  return (
    <div className="space-y-6">
      {/* ── Row 1: KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Calls Handled"
          value={callsToday}
          unit="today"
          delta={callsDelta}
        />
        <StatCard
          label="Bookings Captured"
          value={bookingsToday}
          unit="today"
          delta={bookingsDelta}
        />
        <StatCard
          label="Missed Calls"
          value={missedCalls}
          unit="today"
          highlight={missedCalls > 0}
          delta={{
            value: missedCalls > 0 ? `~$${missedRevenue.toLocaleString()} est. lost revenue` : 'No missed calls',
            direction: missedCalls > 0 ? 'down' : 'neutral',
          }}
        />
        <StatCard
          label="Open Actions"
          value={pendingTasks}
          unit="pending"
          delta={{
            value: `${todayNewTasks} new today`,
            direction: todayNewTasks > 0 ? 'up' : 'neutral',
          }}
        />
      </div>

      {/* ── Row 2: Coverage Control + Action Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CoverageControl
          initialMode={coverageMode}
          initialActiveSince={isActive ? coverage?.started_at ?? null : null}
          initialActivatedBy={isActive ? 'Auto' : null}
          initialCallsCovered={callsCoveredSince}
          initialPrefs={callHandlingPrefs}
          clinicId={clinicId}
        />
        <ActionQueuePreview
          initialTasks={topTasks}
          pendingCount={pendingTasks}
          hasExtraFields={hasExtraFields}
        />
      </div>

      {/* ── Row 3: Activity Feed ── */}
      <ActivityFeed
        calls={recentCalls}
        hasExtraFields={hasExtraFields}
      />
    </div>
  )
}
