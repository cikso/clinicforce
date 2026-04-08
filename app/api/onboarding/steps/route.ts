import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const ORDERED_STEPS = [
  'clinic_profile',
  'staff_added',
  'voice_agent_configured',
  'phone_forwarding_set',
  'test_call_done',
  'go_live',
] as const

type StepKey = typeof ORDERED_STEPS[number]

// ── PATCH /api/onboarding/steps ───────────────────────────────────────────────
// Marks a single onboarding step as complete (upserts the row), then checks
// whether all steps are done to set clinics.onboarding_completed = true.
export async function PATCH(request: NextRequest) {
  let body: { step?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { step } = body
  if (!step || !ORDERED_STEPS.includes(step as StepKey)) {
    return NextResponse.json(
      { error: `Invalid step. Must be one of: ${ORDERED_STEPS.join(', ')}` },
      { status: 400 }
    )
  }

  // ── Authenticated session client (RLS applies) ────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  // ── Service role client (clinic_users RLS bypass) ─────────────────────────
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: cu, error: cuError } = await service
    .from('clinic_users')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (cuError || !cu?.clinic_id) {
    return NextResponse.json({ error: 'No clinic found for this user.' }, { status: 404 })
  }

  if (!['clinic_admin', 'platform_owner'].includes(cu.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient role.' }, { status: 403 })
  }

  // ── Enforce sequential order ──────────────────────────────────────────────
  const stepIndex = ORDERED_STEPS.indexOf(step as StepKey)
  if (stepIndex > 0) {
    const prevStep = ORDERED_STEPS[stepIndex - 1]
    const { data: prevRow } = await supabase
      .from('onboarding_steps')
      .select('completed')
      .eq('clinic_id', cu.clinic_id)
      .eq('step', prevStep)
      .maybeSingle()

    if (!prevRow?.completed) {
      return NextResponse.json(
        { error: `Complete "${prevStep.replace(/_/g, ' ')}" before this step.` },
        { status: 422 }
      )
    }
  }

  // ── Upsert step row (authenticated client → RLS applies) ─────────────────
  const { error: upsertError } = await supabase
    .from('onboarding_steps')
    .upsert(
      {
        clinic_id:    cu.clinic_id,
        step,
        completed:    true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'clinic_id,step' }
    )

  if (upsertError) {
    console.error('[onboarding/steps] upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to save step. Please try again.' }, { status: 500 })
  }

  // ── Check whether all steps are now complete ──────────────────────────────
  const { data: allRows } = await supabase
    .from('onboarding_steps')
    .select('step, completed')
    .eq('clinic_id', cu.clinic_id)

  const completedSet = new Set(
    (allRows ?? []).filter((r) => r.completed).map((r) => r.step)
  )
  const allComplete = ORDERED_STEPS.every((s) => completedSet.has(s))

  if (allComplete) {
    // Use service role to update clinics so RLS on clinics table doesn't block
    await service
      .from('clinics')
      .update({ onboarding_completed: true })
      .eq('id', cu.clinic_id)
  }

  return NextResponse.json({ success: true, allComplete })
}
