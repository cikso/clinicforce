import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { ClinicUpdateSchema } from '@/lib/validation/schemas'
import { logAudit } from '@/lib/audit'

function getService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// Allowed fields that can be updated
const ALLOWED_FIELDS = [
  'name', 'phone', 'email', 'website', 'address', 'suburb', 'postcode',
  'vertical', 'services', 'timezone', 'reception_number',
  'after_hours_partner', 'after_hours_phone', 'emergency_partner_address',
] as const

/**
 * PATCH /api/admin/clinics/[id]
 * Platform-owner or clinic_admin. Updates editable clinic fields.
 * Also syncs voice_agents.twilio_phone_number if twilio_phone is provided.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: clinicId } = await params

  // UUID guard before any DB hits
  if (!/^[0-9a-f-]{36}$/i.test(clinicId)) {
    return NextResponse.json({ error: 'Invalid clinic id.' }, { status: 400 })
  }

  const profile = await getClinicProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  // Platform owner can target any clinic; clinic admins only their own.
  // Receptionists / staff have no admin write power.
  if (!profile.isPlatformOwner) {
    if (profile.clinicId !== clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (profile.userRole !== 'clinic_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate the update payload against the same schema as the create path,
  // then narrow to the columns this endpoint allows mutating.
  const validated = ClinicUpdateSchema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json(
      {
        error: 'Invalid fields',
        issues: validated.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    )
  }
  const update: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in validated.data) {
      update[field] = (validated.data as Record<string, unknown>)[field] ?? null
    }
  }

  if (Object.keys(update).length === 0 && typeof body.twilio_phone !== 'string') {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const service = getService()

  // Update clinic record
  if (Object.keys(update).length > 0) {
    const { error } = await service
      .from('clinics')
      .update(update)
      .eq('id', clinicId)

    if (error) {
      console.error('[admin/clinics] update error:', error.message)
      return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
    }

    logAudit({
      action: 'admin.clinic.updated',
      clinicId,
      actorId: profile.userId,
      resource: `clinic:${clinicId}`,
      metadata: { fields: Object.keys(update) },
    }, req)
  }

  // Sync Twilio phone number in voice_agents if provided
  if (typeof body.twilio_phone === 'string') {
    const twilioE164 = body.twilio_phone.replace(/\D/g, '')
    const formatted = twilioE164.startsWith('61')
      ? `+${twilioE164}`
      : twilioE164.startsWith('0')
        ? `+61${twilioE164.slice(1)}`
        : `+${twilioE164}`

    if (body.twilio_phone.trim()) {
      // Upsert: update existing or create new voice_agent row
      const { data: existing } = await service
        .from('voice_agents')
        .select('id')
        .eq('clinic_id', clinicId)
        .maybeSingle()

      // Per-clinic agent id: prefer the caller-supplied value, then env default.
      const providedAgentId =
        typeof body.elevenlabs_agent_id === 'string' && body.elevenlabs_agent_id.trim()
          ? body.elevenlabs_agent_id.trim()
          : null
      const fallbackAgentId = process.env.ELEVENLABS_AGENT_ID ?? ''

      if (existing) {
        const updatePayload: Record<string, unknown> = { twilio_phone_number: formatted }
        if (providedAgentId) updatePayload.elevenlabs_agent_id = providedAgentId
        await service
          .from('voice_agents')
          .update(updatePayload)
          .eq('clinic_id', clinicId)
      } else {
        await service.from('voice_agents').insert({
          clinic_id: clinicId,
          twilio_phone_number: formatted,
          elevenlabs_agent_id: providedAgentId ?? fallbackAgentId,
          is_active: true,
          mode: 'DAYTIME',
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/admin/clinics/[id]
 * Platform-owner only. Deletes a clinic and all associated data.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: clinicId } = await params

  if (!/^[0-9a-f-]{36}$/i.test(clinicId)) {
    return NextResponse.json({ error: 'Invalid clinic id.' }, { status: 400 })
  }

  // Auth: must be platform_owner
  const profile = await getClinicProfile()
  if (!profile?.isPlatformOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const service = getService()

  // Verify clinic exists
  const { data: clinic } = await service
    .from('clinics')
    .select('id, name')
    .eq('id', clinicId)
    .maybeSingle()

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  // Delete all related data in dependency order
  const tables = [
    'activity_log',
    'call_inbox',
    'coverage_sessions',
    'tasks',
    'notification_settings',
    'onboarding_steps',
    'voice_agents',
    'clinic_invites',
    'subscriptions',
    'clinic_users',
  ]

  const errors: string[] = []

  for (const table of tables) {
    const { error } = await service
      .from(table)
      .delete()
      .eq('clinic_id', clinicId)

    if (error) {
      // Log but continue — some tables may not have rows
      console.warn(`[delete-clinic] Error deleting from ${table}:`, error.message)
      errors.push(`${table}: ${error.message}`)
    }
  }

  // Finally delete the clinic itself
  const { error: clinicError } = await service
    .from('clinics')
    .delete()
    .eq('id', clinicId)

  if (clinicError) {
    return NextResponse.json(
      { error: `Failed to delete clinic: ${clinicError.message}`, partialErrors: errors },
      { status: 500 },
    )
  }

  logAudit({
    action: 'admin.clinic.deleted',
    clinicId,
    actorId: profile.userId,
    resource: `clinic:${clinicId}`,
    metadata: { name: clinic.name },
  }, req)

  return NextResponse.json({ success: true, deleted: clinic.name })
}
