import { createClient } from './server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Call, Subscription } from '@/lib/types'

// ── fetchCallInbox ─────────────────────────────────────────────────────────────
// Returns the most recent call_inbox rows for the clinic as Call[]
export async function fetchCallInbox(clinicId: string): Promise<Call[]> {
  if (!clinicId) return []
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('call_inbox')
    .select(
      'id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, call_duration_seconds, created_at'
    )
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) {
    console.error('fetchCallInbox error:', error)
    return []
  }

  return data.map((row) => ({
    id:                  row.id as string,
    callerName:          (row.caller_name       as string) ?? 'Unknown caller',
    callerPhone:         (row.caller_phone      as string) ?? '—',
    petName:             (row.pet_name          as string) ?? '—',
    petSpecies:          (row.pet_species       as string) ?? '—',
    summary:             (row.summary           as string) ?? '',
    aiDetail:            (row.ai_detail         as string) ?? '',
    actionRequired:      (row.action_required   as string) ?? '—',
    urgency:             (row.urgency           as Call['urgency'])  ?? 'ROUTINE',
    status:              (row.status            as Call['status'])   ?? 'UNREAD',
    callDurationSeconds: (row.call_duration_seconds as number | null) ?? null,
    createdAt:           (row.created_at        as string) ?? new Date().toISOString(),
  }))
}

// ── getSubscription ────────────────────────────────────────────────────────────
// Returns the subscription row for the given clinic. Uses the service-role
// client when available because the `subscriptions` table has RLS enabled with
// no policies, so the session client returns null for every authenticated
// user (which the dashboard layout then treats as an inactive subscription
// and redirects to /login). Falls back to the session client if the service
// key is not configured. A proper RLS policy is the longer-term fix.
export async function getSubscription(clinicId: string): Promise<Subscription | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const client = serviceRoleKey
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
    : await createClient()

  const { data, error } = await client
    .from('subscriptions')
    .select('id, clinic_id, plan, status, trial_ends_at')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  if (error) {
    console.error('getSubscription error:', error)
    return null
  }

  return data as Subscription | null
}

// ── fetchDashboardCalls ────────────────────────────────────────────────────────
// Alias kept for backward compatibility — delegates to fetchCallInbox
export async function fetchDashboardCalls(clinicId: string): Promise<Call[]> {
  return fetchCallInbox(clinicId)
}

// ── fetchDashboardCases ────────────────────────────────────────────────────────
// Previously queried the old `cases` table; now reads from call_inbox
// Filters to CRITICAL/URGENT items only (i.e. cases requiring attention)
export async function fetchDashboardCases(clinicId: string): Promise<Call[]> {
  if (!clinicId) return []
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('call_inbox')
    .select(
      'id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, call_duration_seconds, created_at'
    )
    .eq('clinic_id', clinicId)
    .in('urgency', ['CRITICAL', 'URGENT'])
    .neq('status', 'ACTIONED')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) {
    console.error('fetchDashboardCases error:', error)
    return []
  }

  return data.map((row) => ({
    id:                  row.id as string,
    callerName:          (row.caller_name       as string) ?? 'Unknown caller',
    callerPhone:         (row.caller_phone      as string) ?? '—',
    petName:             (row.pet_name          as string) ?? '—',
    petSpecies:          (row.pet_species       as string) ?? '—',
    summary:             (row.summary           as string) ?? '',
    aiDetail:            (row.ai_detail         as string) ?? '',
    actionRequired:      (row.action_required   as string) ?? '—',
    urgency:             (row.urgency           as Call['urgency'])  ?? 'ROUTINE',
    status:              (row.status            as Call['status'])   ?? 'UNREAD',
    callDurationSeconds: (row.call_duration_seconds as number | null) ?? null,
    createdAt:           (row.created_at        as string) ?? new Date().toISOString(),
  }))
}
