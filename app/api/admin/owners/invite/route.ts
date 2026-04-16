import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { sendInviteEmail } from '@/lib/email'

/**
 * POST /api/admin/owners/invite
 *
 * Founder (platform_owner) invites a user as clinic_owner across one or more
 * clinics in a single email. The invite stores the primary clinic + the rest
 * in extra_clinic_ids; the accept handler creates one clinic_users row per
 * clinic.
 *
 * Body: { email: string, clinic_ids: string[] }
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(s) { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  // Only platform_owner provisions clinic_owners.
  const { data: roles } = await supabase
    .from('clinic_users').select('role').eq('user_id', user.id)
  const isPlatformOwner = (roles ?? []).some((r) => r.role === 'platform_owner')
  if (!isPlatformOwner) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: { email?: string; clinic_ids?: string[] }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const clinicIds = Array.from(new Set((body.clinic_ids ?? []).filter(Boolean)))

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  if (clinicIds.length === 0) {
    return NextResponse.json({ error: 'Select at least one clinic.' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Verify clinics exist
  const { data: clinics } = await service
    .from('clinics')
    .select('id, name')
    .in('id', clinicIds)

  if (!clinics || clinics.length !== clinicIds.length) {
    return NextResponse.json({ error: 'One or more clinics not found.' }, { status: 404 })
  }

  const [primaryId, ...extraIds] = clinicIds
  const primaryClinic = clinics.find((c) => c.id === primaryId)!

  // Check for an active pending owner invite for this email
  const { data: existing } = await service
    .from('clinic_invites')
    .select('id, expires_at')
    .eq('email', email)
    .eq('role', 'clinic_owner')
    .is('accepted_at', null)
    .maybeSingle()

  if (existing && new Date(existing.expires_at) > new Date()) {
    return NextResponse.json(
      { error: 'An active owner invite already exists for this email.' },
      { status: 409 },
    )
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: invite, error: inviteError } = await service
    .from('clinic_invites')
    .insert({
      clinic_id: primaryId,
      extra_clinic_ids: extraIds.length > 0 ? extraIds : null,
      email,
      role: 'clinic_owner',
      invited_by: user.email ?? user.id,
      expires_at: expiresAt,
    })
    .select('token')
    .single()

  if (inviteError || !invite) {
    console.error('[admin/owners/invite] insert error:', inviteError)
    return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.clinicforce.io'
  const inviteUrl = `${siteUrl}/invite/${invite.token}`

  // Email shows the primary clinic name + a hint that more access comes with it
  const clinicLabel = clinics.length === 1
    ? primaryClinic.name
    : `${primaryClinic.name} (and ${clinics.length - 1} more)`

  let emailSent = true
  try {
    await sendInviteEmail({
      to: email,
      clinicName: clinicLabel,
      inviteUrl,
      invitedBy: user.email ?? 'ClinicForce',
      role: 'clinic_owner',
    })
  } catch (emailErr) {
    console.error('[admin/owners/invite] email send failed:', emailErr)
    emailSent = false
  }

  return NextResponse.json({
    success: true,
    token: invite.token,
    clinicCount: clinics.length,
    emailSent,
  })
}
