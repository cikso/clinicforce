import { NextRequest, NextResponse } from 'next/server'
import {
  getServiceSupabase,
  validateSecret,
  normaliseAustralianPhone,
  resolveClinicId,
} from '@/lib/voice/shared'
import { withRetry } from '@/lib/utils/withRetry'

// ─── POST /api/flag-urgent ────────────────────────────────────────────────────
// Called by ElevenLabs when flagging a call as urgent/critical.
export async function POST(req: NextRequest) {
  if (!validateSecret(req)) {
    console.error('[/api/flag-urgent] 401 — invalid or missing x-api-secret')
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const supabase = getServiceSupabase()

    const clinicId = await resolveClinicId(supabase, body)
    if (!clinicId) {
      console.error('[/api/flag-urgent] Could not resolve clinic from body:', {
        clinic_id: body.clinic_id, clinic_name: body.clinic_name,
      })
      return NextResponse.json({ success: false, error: 'Could not resolve clinic' }, { status: 400 })
    }

    const owner_name   = (body.owner_name   as string | undefined) ?? 'Unknown caller'
    const rawPhone     = (body.phone_number as string | undefined) ?? '—'
    const pet_name     = (body.pet_name     as string | undefined) ?? '—'
    const species      = (body.species      as string | undefined) ?? '—'
    const summary      = (body.summary      as string | undefined) ?? ''

    const phone_number = normaliseAustralianPhone(rawPhone)

    await withRetry(async () => {
      const { error } = await supabase
        .from('call_inbox')
        .insert({
          clinic_id:       clinicId,
          caller_name:     owner_name,
          caller_phone:    phone_number,
          pet_name,
          pet_species:     species,
          summary:         summary.slice(0, 300),
          ai_detail:       summary,
          action_required: 'URGENT — immediate callback required',
          urgency:         'CRITICAL',
          status:          'UNREAD',
        })

      if (error) throw error
    }, { label: 'flag-urgent/insert' })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/flag-urgent] Unexpected error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
