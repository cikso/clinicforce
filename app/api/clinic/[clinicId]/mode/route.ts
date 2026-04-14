import { NextRequest, NextResponse } from 'next/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getServiceSupabase } from '@/lib/voice/shared'

const VALID_MODES = ['off', 'business_hours', 'after_hours', 'overflow', 'lunch_cover', 'emergency_only', 'weekend'] as const

type RouteCtx = { params: Promise<{ clinicId: string }> }

/**
 * Verify the caller is authenticated and authorised for the given clinic.
 * Platform owners may access any clinic; regular users only their own.
 */
async function authorise(clinicId: string) {
  const profile = await getClinicProfile()
  if (!profile) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }), profile: null }
  }
  if (!profile.isPlatformOwner && profile.clinicId !== clinicId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), profile: null }
  }
  return { error: null, profile }
}

// GET /api/clinic/[clinicId]/mode — read current coverage mode
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { clinicId } = await ctx.params
  if (!clinicId) {
    return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
  }

  const auth = await authorise(clinicId)
  if (auth.error) return auth.error

  try {
    const supabase = getServiceSupabase()
    const { data } = await supabase
      .from('clinics')
      .select('coverage_mode, coverage_mode_activated_at, coverage_mode_activated_by')
      .eq('id', clinicId)
      .maybeSingle()

    return NextResponse.json({
      mode: data?.coverage_mode ?? 'after_hours',
      activatedAt: data?.coverage_mode_activated_at ?? null,
      activatedBy: data?.coverage_mode_activated_by ?? null,
    })
  } catch {
    return NextResponse.json({ mode: 'after_hours', activatedAt: null, activatedBy: null })
  }
}

// PATCH /api/clinic/[clinicId]/mode
// Body: { mode: 'off' | 'business_hours' | 'after_hours' | 'overflow' | 'lunch_cover' | 'emergency_only' | 'weekend' }
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { clinicId } = await ctx.params
  if (!clinicId) {
    return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
  }

  const auth = await authorise(clinicId)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => ({}))
  const mode: string = body?.mode ?? 'after_hours'
  const activatedBy: string = body?.activatedBy ?? 'Manual'

  if (!(VALID_MODES as readonly string[]).includes(mode)) {
    return NextResponse.json({ error: `Invalid mode: ${mode}` }, { status: 400 })
  }

  const now = new Date().toISOString()
  const supabase = getServiceSupabase()

  // Update clinics table — this is what /api/initiate reads for routing
  const { error: clinicErr } = await supabase
    .from('clinics')
    .update({
      coverage_mode: mode,
      coverage_mode_activated_at: now,
      coverage_mode_activated_by: activatedBy,
    })
    .eq('id', clinicId)

  if (clinicErr) {
    console.error('[clinic/mode] clinics update error:', clinicErr)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  console.log(`[clinic/mode] ${clinicId} → ${mode} by ${auth.profile!.userName}`)

  return NextResponse.json({ mode, activatedAt: now, activatedBy })
}
