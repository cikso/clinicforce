import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

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
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: clinicId } = await params

  const profile = await getClinicProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  if (!profile.isPlatformOwner && profile.clinicId !== clinicId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Build update object from allowed fields only
  const update: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      update[field] = body[field] ?? null
    }
  }

  if (Object.keys(update).length === 0 && !body.twilio_phone) {
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

      if (existing) {
        await service
          .from('voice_agents')
          .update({ twilio_phone_number: formatted })
          .eq('clinic_id', clinicId)
      } else {
        await service.from('voice_agents').insert({
          clinic_id: clinicId,
          twilio_phone_number: formatted,
          elevenlabs_agent_id: process.env.ELEVENLABS_AGENT_ID ?? '',
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
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: clinicId } = await params

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

  return NextResponse.json({ success: true, deleted: clinic.name })
}
