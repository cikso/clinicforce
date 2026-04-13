import { NextRequest, NextResponse } from 'next/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getServiceSupabase } from '@/lib/voice/shared'

// ─── PATCH /api/survey/settings ──────────────────────────────────────────────
// Update survey config for the current clinic.

export async function PATCH(req: NextRequest) {
  const profile = await getClinicProfile()
  if (!profile?.clinicId || !['clinic_admin', 'platform_owner'].includes(profile.userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.enabled === 'boolean') updates.enabled = body.enabled
  if (typeof body.delay_minutes === 'number') updates.delay_minutes = body.delay_minutes
  if (typeof body.sms_template === 'string') updates.sms_template = body.sms_template

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('surveys')
    .update(updates)
    .eq('clinic_id', profile.clinicId)
    .select()
    .single()

  if (error) {
    console.error('[survey/settings] Update error:', error.message)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
