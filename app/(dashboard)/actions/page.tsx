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

  // Join each task to its originating call_inbox row so the row + detail pane
  // can show caller/pet/AI-summary without a second round-trip. Supabase
  // implicit join via FK (`call_inbox`) returns the embedded row as an object.
  const taskSelect =
    'id, title, description, type, category, priority, status, source, ' +
    'assigned_to, case_id, call_inbox_id, due_at, sla_due_at, snoozed_until, ' +
    'next_best_action, completed_at, created_at, ' +
    'call:call_inbox!tasks_call_inbox_id_fkey(id, caller_name, caller_phone, pet_name, pet_species, urgency, summary, ai_detail, elevenlabs_conversation_id)'

  const [pendingRes, completedRes, staffRes] = await Promise.all([
    clinicId
      ? db
          .from('tasks')
          .select(taskSelect)
          .eq('clinic_id', clinicId)
          .in('status', ['PENDING', 'IN_PROGRESS'])
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),

    clinicId
      ? db
          .from('tasks')
          .select(taskSelect)
          .eq('clinic_id', clinicId)
          .eq('status', 'DONE')
          .gte('completed_at', todayISO)
          .order('completed_at', { ascending: false })
      : Promise.resolve({ data: null }),

    clinicId
      ? db
          .from('clinic_users')
          .select('id, name, role')
          .eq('clinic_id', clinicId)
      : Promise.resolve({ data: null }),
  ])

  // Supabase's row-type inference mis-parses explicit `fk-name(...)` relation
  // syntax as an error union, so we `unknown`-cast once and own the shape
  // via TaskRow at the component boundary.
  const pendingTasks   = (pendingRes.data   ?? []) as unknown as TaskRow[]
  const completedTasks = (completedRes.data ?? []) as unknown as TaskRow[]
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
