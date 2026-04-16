import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

/**
 * POST /api/clinic-switch
 *
 * Body:
 *   { clinicId: string }  → drill into that clinic
 *   { clinicId: null }    → clear the cookie, return to portfolio (multi-clinic) view
 *
 * Allowed for any multi-clinic user (platform_owner OR clinic_owner). For
 * clinic_owner we additionally verify they actually own the requested clinic.
 */
export async function POST(req: NextRequest) {
  const profile = await getClinicProfile()
  if (!profile?.isMultiClinic) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !('clinicId' in body)) {
    return NextResponse.json({ error: 'clinicId required (string or null)' }, { status: 400 })
  }

  const cookieStore = await cookies()

  // null → clear cookie, return to portfolio view.
  // Use an explicit expired Set-Cookie (rather than .delete()) so the path/secure/httpOnly
  // attributes match the original cookie — otherwise some browsers ignore the deletion.
  if (body.clinicId === null) {
    cookieStore.set('cf_active_clinic', '', {
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
      secure: true,
      httpOnly: true,
    })
    return NextResponse.json({ ok: true, mode: 'portfolio' })
  }

  if (typeof body.clinicId !== 'string' || !body.clinicId) {
    return NextResponse.json({ error: 'clinicId must be a uuid string or null' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('id', body.clinicId)
    .maybeSingle()

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  // For clinic_owner, ensure they actually own the requested clinic
  if (profile.userRole === 'clinic_owner') {
    const { data: ownership } = await supabase
      .from('clinic_users')
      .select('id')
      .eq('user_id', profile.userId)
      .eq('clinic_id', body.clinicId)
      .eq('role', 'clinic_owner')
      .maybeSingle()
    if (!ownership) {
      return NextResponse.json({ error: 'You do not own this clinic.' }, { status: 403 })
    }
  }

  cookieStore.set('cf_active_clinic', body.clinicId, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: true,
    httpOnly: true,
  })

  return NextResponse.json({ ok: true, mode: 'single' })
}
