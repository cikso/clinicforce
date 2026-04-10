import { NextRequest, NextResponse } from 'next/server'
import {
  getServiceSupabase,
  validateSecret,
  normaliseAustralianPhone,
  resolveClinicId,
} from '@/lib/voice/shared'

// ─── POST /api/log-referral ───────────────────────────────────────────────────
// Called by ElevenLabs when logging an emergency referral.
export async function POST(req: NextRequest) {
  if (!validateSecret(req)) {
    console.error('[/api/log-referral] 401 — invalid or missing x-api-secret')
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
      console.error('[/api/log-referral] Could not resolve clinic from body:', {
        clinic_id: body.clinic_id, clinic_name: body.clinic_name,
      })
      return NextResponse.json({ success: false, error: 'Could not resolve clinic' }, { status: 400 })
    }

    const owner_name             = (body.owner_name            as string | undefined) ?? 'Unknown caller'
    const rawPhone               = (body.phone_number          as string | undefined) ?? '—'
    const pet_name               = (body.pet_name              as string | undefined) ?? '—'
    const species                = (body.species               as string | undefined) ?? '—'
    const referral_destination   = (body.referral_destination  as string | undefined) ?? 'Unknown destination'
    const summary                = (body.summary               as string | undefined) ?? ''

    const phone_number = normaliseAustralianPhone(rawPhone)

    const fullSummary = referral_destination
      ? `Referred to: ${referral_destination}. ${summary}`
      : summary

    const { error } = await supabase
      .from('call_inbox')
      .insert({
        clinic_id:       clinicId,
        caller_name:     owner_name,
        caller_phone:    phone_number,
        pet_name,
        pet_species:     species,
        summary:         fullSummary.slice(0, 300),
        ai_detail:       fullSummary,
        action_required: 'Emergency referral logged — follow up with owner',
        urgency:         'CRITICAL',
        status:          'UNREAD',
      })

    if (error) {
      console.error('[/api/log-referral] Supabase insert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/log-referral] Unexpected error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
