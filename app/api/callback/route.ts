import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

export const preferredRegion = 'syd1'

function validateSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-api-secret')
  return !!secret && secret === process.env.ELEVENLABS_TOOL_SECRET
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// ─── Phone normalisation ──────────────────────────────────────────────────────
function normaliseAustralianPhone(raw: string): string {
  if (!raw || raw === '—') return '—'
  const digits = raw.replace(/\D/g, '')
  // Convert +61 international to local 0x format
  const local = digits.startsWith('61') && digits.length === 11
    ? '0' + digits.slice(2)
    : digits
  // Mobile: 04XX XXX XXX
  if (local.startsWith('04') && local.length === 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
  }
  // Landline: (0X) XXXX XXXX
  if (local.startsWith('0') && local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`
  }
  // Return cleaned digits if format not recognised
  return local
}

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

// Default clinic — used when ElevenLabs tools don't pass clinic_id/clinic_name.
// Safe for single-clinic deployments; multi-tenant will pass the value explicitly.
const DEFAULT_CLINIC_ID = '2a35d093-803a-44fd-927a-075511f57736'

/** Resolve clinic_id from body, falling back to the default clinic. */
async function resolveClinicId(
  supabase: ReturnType<typeof getSupabase>,
  body: Record<string, unknown>,
): Promise<string> {
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

  return DEFAULT_CLINIC_ID
}

// ─── POST /api/callback ───────────────────────────────────────────────────────
// Called by Sarah (ElevenLabs) when she invokes the create_callback_request tool
// during a live call.
//
// Expected body:
//   clinic_name   string
//   clinic_id     string  (optional — preferred for multi-tenant resolution)
//   owner_name    string
//   pet_name      string  (optional)
//   species       string  (optional)
//   phone_number  string  (required)
//   urgency       "routine" | "urgent" | "emergency"
//   summary       string
//
// Writes to: call_inbox (Supabase)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!validateSecret(req)) {
    console.error('[/api/callback] 401 — invalid or missing x-api-secret')
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  // Traffic Cop: ignore post-call webhooks so they do not create duplicate rows.
  if (body.type === 'post_call_transcription' || body.type === 'post_call_audio') {
    return NextResponse.json({ success: true, skipped: true }, { status: 200 })
  }

  console.log('[/api/callback] Incoming body:', JSON.stringify(body, null, 2))

  try {
    const supabase = getSupabase()

    const clinicId = await resolveClinicId(supabase, body)

    const owner_name   = (body.owner_name   as string | undefined) ?? 'Unknown caller'
    const rawPhone     = (body.phone_number as string | undefined) ?? '—'
    const pet_name     = (body.pet_name     as string | undefined) ?? '—'
    const species      = (body.species      as string | undefined) ?? '—'
    const urgencyRaw   = (body.urgency      as string | undefined)
    const summary      = (body.summary      as string | undefined) ?? ''

    const phone_number   = normaliseAustralianPhone(rawPhone)
    const urgency        = mapUrgency(urgencyRaw)
    const actionRequired = actionFromUrgency(urgency)

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

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 VETFORCE URGENT 🚨 Webhook failed to save to Supabase! Error: ${message}`,
          }),
        })
      } catch (discordError) {
        console.error('[/api/callback] Failed to send Discord alert:', discordError)
      }
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ─── GET — fetch unread inbox items for dashboard polling ─────────────────────
export async function GET() {
  try {
    const profile = await getClinicProfile()
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('call_inbox')
      .select('id, caller_name, caller_phone, pet_name, pet_species, summary, urgency, created_at')
      .eq('clinic_id', profile.clinicId)
      .eq('status', 'UNREAD')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error || !data) return NextResponse.json([])

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}
