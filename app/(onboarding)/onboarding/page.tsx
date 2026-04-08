import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import ChecklistClient, { type StepRow } from './ChecklistClient'

export const dynamic = 'force-dynamic'

export default async function OnboardingChecklistPage() {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Role check (service role bypasses RLS on clinic_users) ────────────────
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: cu } = await service
    .from('clinic_users')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!cu?.clinic_id) redirect('/overview')

  // Only clinic_admin and platform_owner may access this checklist
  if (!['clinic_admin', 'platform_owner'].includes(cu.role)) {
    redirect('/overview')
  }

  // ── Fetch onboarding steps (authenticated client → RLS applies) ───────────
  const { data: steps } = await supabase
    .from('onboarding_steps')
    .select('step, completed, completed_at')
    .eq('clinic_id', cu.clinic_id)

  return <ChecklistClient initialSteps={(steps ?? []) as StepRow[]} />
}
