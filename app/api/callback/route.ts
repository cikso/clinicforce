import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

function mapUrgency(raw: string | undefined): 'CRITICAL' | 'URGENT' | 'ROUTINE' {
  const u = (raw ?? '').toLowerCase()
  if (u === 'emergency') return 'CRITICAL'
  if (u === 'urgent')    return 'URGENT'
  return 'ROUTINE'
}

function actionFromUrgency(urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'): string {
  if (urgency === 'CRITICAL') return 'Urgent callback required — same-day assessment'
  if (urgency === 'URGENT')   return 'Call back today to follow up'
  return 'Review and action when available'
}

// ─── POST /api/callback ───────────────────────────────────────────────────────
// Called by Sarah (ElevenLabs) when she invokes the create_callback_request tool
// during a live call.
//
// Expected body:
//   clinic_name   string
//   owner_name    string
//   pet_name      string  (optional)
//   species       string  (optional)
//   phone_number  string  (required)
//   urgency       "routine" | "urgent" | "emergency"
//   summary       string
//
// Writes to: call_inbox (Supabase)
// Fields:    caller_name, caller_phone, pet_name, pet_species, summary,
//            ai_detail, action_required, urgency, status, clinic_id
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  // Log every incoming payload — visible in Vercel logs during testing
  console.log('[/api/callback] Incoming body:', JSON.stringify(body, null, 2))

  try {
    const owner_name   = (body.owner_name   as string | undefined) ?? 'Unknown caller'
    const phone_number = (body.phone_number as string | undefined) ?? '—'
    const pet_name     = (body.pet_name     as string | undefined) ?? '—'
    const species      = (body.species      as string | undefined) ?? '—'
    const urgencyRaw   = (body.urgency      as string | undefined)
    const summary      = (body.summary      as string | undefined) ?? ''

    const urgency        = mapUrgency(urgencyRaw)
    const actionRequired = actionFromUrgency(urgency)

    const supabase = getSupabase()

    const { error } = await supabase
      .from('call_inbox')
      .insert({
        clinic_id:       DEMO_CLINIC_ID,
        caller_name:     owner_name,
        caller_phone:    phone_number,
        pet_name,
        pet_species:     species,
        summary:         summary.slice(0, 300),
        ai_detail:       summary,
        action_required: actionRequired,
        urgency,
        status:          'UNREAD',
      })

    if (error) {
      console.error('[/api/callback] Supabase insert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/callback] Unexpected error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ─── GET — fetch unread inbox items for dashboard polling ─────────────────────
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('call_inbox')
      .select('id, caller_name, caller_phone, pet_name, pet_species, summary, urgency, created_at')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .eq('status', 'UNREAD')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !data) return NextResponse.json([])

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}
