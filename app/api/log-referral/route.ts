import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function normaliseAustralianPhone(raw: string): string {
  if (!raw || raw === '—') return '—'
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('61') && digits.length === 11
    ? '0' + digits.slice(2)
    : digits
  if (local.startsWith('04') && local.length === 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
  }
  if (local.startsWith('0') && local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`
  }
  return local
}

/** Resolve clinic_id from body: direct clinic_id, or lookup by clinic_name. */
async function resolveClinicId(
  supabase: ReturnType<typeof getSupabase>,
  body: Record<string, unknown>,
): Promise<string | null> {
  if (typeof body.clinic_id === 'string' && body.clinic_id) return body.clinic_id

  if (typeof body.clinic_name === 'string' && body.clinic_name) {
    const { data } = await supabase
      .from('clinics')
      .select('id')
      .eq('name', body.clinic_name)
      .limit(1)
      .maybeSingle()
    if (data?.id) return data.id as string
  }

  return null
}

// ─── POST /api/log-referral ───────────────────────────────────────────────────
// Called by ElevenLabs when logging an emergency referral.
//
// Expected body:
//   owner_name            string
//   phone_number          string
//   pet_name              string
//   species               string
//   referral_destination  string
//   reason                string
//   summary               string
//   clinic_name           string
//   clinic_id             string  (optional — preferred for multi-tenant resolution)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  console.log('[/api/log-referral] Incoming body:', JSON.stringify(body, null, 2))

  try {
    const supabase = getSupabase()

    const clinicId = await resolveClinicId(supabase, body)
    if (!clinicId) {
      console.error('[/api/log-referral] Could not resolve clinic_id from body')
      return NextResponse.json({ success: false, error: 'Could not resolve clinic_id' }, { status: 400 })
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
