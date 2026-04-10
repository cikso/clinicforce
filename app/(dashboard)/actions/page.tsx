import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import ActionQueueList, { type TaskRow } from '@/app/components/actions/ActionQueueList'

export const metadata: Metadata = { title: 'Action Queue — ClinicForce' }
export const dynamic = 'force-dynamic'

/* Sydney day bounds (reuse pattern from overview) */
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

function todayStart(): string {
  const ref = new Date()
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ref)
  const y  = parts.find(p => p.type === 'year')!.value
  const mo = parts.find(p => p.type === 'month')!.value
  const d  = parts.find(p => p.type === 'day')!.value
  const dateStr = `${y}-${mo}-${d}`
  const offset = sydneyUTCOffset(dateStr)
  return new Date(`${dateStr}T00:00:00${offset}`).toISOString()
}

export default async function ActionsPage() {
  const profile = await getClinicProfile()
  const clinicId = profile?.clinicId ?? ''

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const db = serviceKey
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
    : await createClient()

  const todayISO = todayStart()

  // Parallel queries
  const [pendingRes, completedRes, staffRes] = await Promise.all([
    // Pending + in-progress tasks
    clinicId
      ? db
          .from('tasks')
          .select('id, title, description, type, priority, status, assigned_to, case_id, due_at, completed_at, created_at')
          .eq('clinic_id', clinicId)
          .in('status', ['PENDING', 'IN_PROGRESS'])
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),

    // Completed today
    clinicId
      ? db
          .from('tasks')
          .select('id, title, description, type, priority, status, assigned_to, case_id, due_at, completed_at, created_at')
          .eq('clinic_id', clinicId)
          .eq('status', 'DONE')
          .gte('completed_at', todayISO)
          .order('completed_at', { ascending: false })
      : Promise.resolve({ data: null }),

    // Staff (clinic_users)
    clinicId
      ? db
          .from('clinic_users')
          .select('id, name, role')
          .eq('clinic_id', clinicId)
      : Promise.resolve({ data: null }),
  ])

  const pendingTasks = (pendingRes.data ?? []) as TaskRow[]
  const completedTasks = (completedRes.data ?? []) as TaskRow[]
  const staffList = ((staffRes.data ?? []) as Array<{ id: string; name: string; role: string }>)
    .map(s => ({ id: s.id, name: s.name || 'Unnamed' }))

  // Build a quick lookup for assignee names
  const staffMap: Record<string, string> = {}
  for (const s of staffList) {
    staffMap[s.id] = s.name
  }

  return (
    <ActionQueueList
      initialTasks={pendingTasks}
      initialCompleted={completedTasks}
      staff={staffList}
      staffMap={staffMap}
      clinicId={clinicId}
    />
  )
}
