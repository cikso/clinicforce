import { NextRequest, NextResponse } from 'next/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import {
  getServiceSupabase,
  validateSecret,
  normaliseAustralianPhone,
  resolveClinicId,
} from '@/lib/voice/shared'
import { withRetry } from '@/lib/utils/withRetry'

export const preferredRegion = 'syd1'

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

  // Ignore post-call webhooks to avoid duplicate rows
  if (body.type === 'post_call_transcription' || body.type === 'post_call_audio') {
    return NextResponse.json({ success: true, skipped: true }, { status: 200 })
  }

  try {
    const supabase = getServiceSupabase()

    const clinicId = await resolveClinicId(supabase, body)
    if (!clinicId) {
      console.error('[/api/callback] Could not resolve clinic from body:', {
        clinic_id: body.clinic_id, clinic_name: body.clinic_name,
      })
      return NextResponse.json({ success: false, error: 'Could not resolve clinic' }, { status: 400 })
    }

    const owner_name   = (body.owner_name   as string | undefined) ?? 'Unknown caller'
    const rawPhone     = (body.phone_number as string | undefined) ?? '—'
    const pet_name     = (body.pet_name     as string | undefined) ?? '—'
    const species      = (body.species      as string | undefined) ?? '—'
    const urgencyRaw   = (body.urgency      as string | undefined)
    const summary      = (body.summary      as string | undefined) ?? ''

    const phone_number   = normaliseAustralianPhone(rawPhone)
    const urgency        = mapUrgency(urgencyRaw)
    const actionRequired = actionFromUrgency(urgency)

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
          action_required: actionRequired,
          urgency,
          status:          'UNREAD',
        })

      if (error) throw error
    }, { label: 'callback/insert' })

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
            content: `Webhook failed to save to Supabase! Error: ${message}`,
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

    const supabase = getServiceSupabase()

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
