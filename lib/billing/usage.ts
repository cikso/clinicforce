/**
 * Usage metering + plan limits.
 *
 * We don't keep a separate counter table — call_inbox already has every row
 * we need, and counting a month of rows is fast once the
 * idx_call_inbox_clinic_status_created composite index is in play.
 *
 * For overflow protection this module exposes a synchronous check
 * (`isOverLimit`) used by the inbox webhook, and a `getMonthlyUsage` helper
 * used by the billing UI.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export type PlanKey = 'trial' | 'starter' | 'growth' | 'enterprise'

export const PLAN_LIMITS: Record<PlanKey, number> = {
  trial: 100,
  starter: 200,
  growth: 500,
  enterprise: Number.POSITIVE_INFINITY,
}

export function planLimit(plan: string | null | undefined): number {
  if (!plan) return PLAN_LIMITS.trial
  const k = plan as PlanKey
  return PLAN_LIMITS[k] ?? PLAN_LIMITS.trial
}

export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export type UsageSnapshot = {
  callsThisMonth: number
  limit: number
  plan: PlanKey
  status: string
  percentUsed: number
  isOverLimit: boolean
  resetAt: string
}

/**
 * One round-trip to Postgres returning the numbers the UI needs. Missing
 * subscription row falls back to trial / trial-limit, so brand-new clinics
 * still see useful data.
 */
export async function getMonthlyUsage(
  supabase: SupabaseClient,
  clinicId: string,
): Promise<UsageSnapshot> {
  const since = monthStart().toISOString()

  // Subscription plan/status
  const subQ = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('clinic_id', clinicId)
    .maybeSingle()
  const plan = ((subQ.data?.plan as string | undefined) ?? 'trial') as PlanKey
  const status = (subQ.data?.status as string | undefined) ?? 'trialing'

  // Calls in current UTC month
  const countQ = await supabase
    .from('call_inbox')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', since)

  const callsThisMonth = countQ.count ?? 0
  const limit = planLimit(plan)
  const resetAt = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1),
  ).toISOString()

  return {
    callsThisMonth,
    limit,
    plan,
    status,
    percentUsed: limit === Infinity ? 0 : Math.min(100, Math.round((callsThisMonth / limit) * 100)),
    isOverLimit: callsThisMonth >= limit,
    resetAt,
  }
}

/**
 * Fast overflow check for the hot webhook path. Returns true if the clinic
 * is currently past its plan's monthly allowance. Enterprise (Infinity) is
 * always allowed.
 */
export async function isOverLimit(
  supabase: SupabaseClient,
  clinicId: string,
): Promise<boolean> {
  const snap = await getMonthlyUsage(supabase, clinicId)
  return snap.isOverLimit
}
