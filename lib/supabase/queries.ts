import { createClient } from './server'
import type { Call, Subscription } from '@/lib/types'

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

// ── fetchCallInbox ─────────────────────────────────────────────────────────────
// Returns the most recent call_inbox rows for the clinic as Call[]
export async function fetchCallInbox(): Promise<Call[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('call_inbox')
    .select(
      'id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, call_duration_seconds, created_at'
    )
    .eq('clinic_id', DEMO_CLINIC_ID)
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
// Returns the subscription row for the given clinic using the authenticated
// session client so Supabase RLS is applied automatically.
export async function getSubscription(clinicId: string): Promise<Subscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
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
export async function fetchDashboardCalls(): Promise<Call[]> {
  return fetchCallInbox()
}

// ── fetchDashboardCases ────────────────────────────────────────────────────────
// Previously queried the old `cases` table; now reads from call_inbox
// Filters to CRITICAL/URGENT items only (i.e. cases requiring attention)
export async function fetchDashboardCases(): Promise<Call[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('call_inbox')
    .select(
      'id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, call_duration_seconds, created_at'
    )
    .eq('clinic_id', DEMO_CLINIC_ID)
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
