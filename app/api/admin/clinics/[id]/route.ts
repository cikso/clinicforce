import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

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

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

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
