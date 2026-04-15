import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { sendInviteEmail } from '@/lib/email'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(s) { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { data: cu } = await supabase
    .from('clinic_users').select('role').eq('user_id', user.id).single()
  if (!cu || !['clinic_admin', 'platform_owner'].includes(cu.role)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, phone, email, address, suburb, postcode, website, vertical, twilio_phone, services, after_hours_partner, after_hours_phone, emergency_partner_address } = body as Record<string, string | null>
  const invites = (body.invites as Array<{ email: string; role: string }>) ?? []

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Clinic name is required.' }, { status: 400 })
  }

  // Auto-generate slug from clinic name
  const slug = name.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Check slug uniqueness
  const { data: existing } = await service.from('clinics').select('id').eq('slug', slug.trim()).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'This slug is already taken. Choose a different one.' }, { status: 409 })
  }

  // Normalise Twilio phone to E.164 (strip spaces)
  const twilioE164 = twilio_phone?.replace(/\s+/g, '') || null
  // For voice_phone backwards compat: strip +61 prefix → 0-prefixed local number
  const voicePhone = twilioE164
    ? twilioE164.replace(/^\+61/, '0')
    : null

  // Create clinic
  const { data: clinic, error: clinicError } = await service
    .from('clinics')
    .insert({
      name: name.trim(),
      slug: slug.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      suburb: suburb?.trim() || null,
      postcode: postcode?.trim() || null,
      website: website?.trim() || null,
      vertical: vertical ?? 'vet',
      services: services?.trim() || null,
      after_hours_partner: after_hours_partner?.trim() || null,
      after_hours_phone: after_hours_phone?.trim() || null,
      emergency_partner_address: emergency_partner_address?.trim() || null,
      voice_phone: voicePhone,
      onboarding_completed: true,
    })
    .select('id')
    .single()

  if (clinicError || !clinic) {
    console.error('[admin/clinics] insert error:', clinicError)
    return NextResponse.json({ error: 'Failed to create clinic.' }, { status: 500 })
  }

  logAudit({
    action: 'admin.clinic.created',
    clinicId: clinic.id,
    actorId: user.id,
    actorEmail: user.email ?? null,
    resource: `clinic:${clinic.id}`,
    metadata: { name: name.trim(), vertical: vertical ?? 'vet' },
  }, request)

  // Create voice_agents row if Twilio number was provided
  if (twilioE164) {
    const { error: vaError } = await service.from('voice_agents').insert({
      clinic_id: clinic.id,
      twilio_phone_number: twilioE164,
      elevenlabs_agent_id: process.env.ELEVENLABS_AGENT_ID ?? null,
      is_active: true,
      mode: 'DAYTIME',
    })
    if (vaError) {
      console.error('[admin/clinics] voice_agents insert error:', vaError)
    }
  }

  // Send invites to all added users
  const ROLE_MAP: Record<string, string> = {
    Admin: 'clinic_admin',
    Vet: 'vet',
    Nurse: 'nurse',
    Receptionist: 'receptionist',
  }

  for (const inv of invites) {
    const dbRole = ROLE_MAP[inv.role] ?? 'receptionist'
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: invite } = await service.from('clinic_invites').insert({
      clinic_id: clinic.id,
      email: inv.email.trim(),
      role: dbRole,
      invited_by: user.email ?? user.id,
      expires_at: expiresAt,
    }).select('token').single()

    if (invite?.token) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.clinicforce.io'
      const inviteUrl = `${siteUrl}/invite/${invite.token}`
      try {
        await sendInviteEmail({
          to: inv.email.trim(),
          clinicName: name.trim(),
          inviteUrl,
          invitedBy: user.email ?? 'Platform Admin',
          role: dbRole,
        })
      } catch (emailErr) {
        console.error('[admin/clinics] invite email failed for', inv.email, emailErr)
      }
      logAudit({
        action: 'invite.sent',
        clinicId: clinic.id,
        actorId: user.id,
        actorEmail: user.email ?? null,
        resource: `invite-email:${inv.email.trim()}`,
        metadata: { role: dbRole },
      }, request)
    }
  }

  return NextResponse.json({ success: true, clinic_id: clinic.id })
}
