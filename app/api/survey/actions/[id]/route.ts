import { NextRequest, NextResponse } from 'next/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getServiceSupabase } from '@/lib/voice/shared'

// ─── PATCH /api/survey/actions/[id] ──────────────────────────────────────────
// Update a survey action's status and/or staff notes.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getClinicProfile()
  if (!profile?.clinicId || !['clinic_admin', 'platform_owner'].includes(profile.userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.status === 'string') updates.status = body.status
  if (typeof body.staff_notes === 'string') updates.staff_notes = body.staff_notes

  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('survey_actions')
    .update(updates)
    .eq('id', id)
    .eq('clinic_id', profile.clinicId)
    .select()
    .single()

  if (error) {
    console.error('[survey/actions] Update error:', error.message)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  return NextResponse.json(data)
}
