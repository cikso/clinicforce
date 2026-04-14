import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import {
  getServiceSupabase,
  buildDynamicVariables,
  CLINIC_SELECT_FIELDS,
} from '@/lib/voice/shared'
import { withRetry } from '@/lib/utils/withRetry'

export const preferredRegion = 'syd1'

const SIGNATURE_HEADER = 'ElevenLabs-Signature'
const MAX_TIMESTAMP_SKEW_SECONDS = 300

/**
 * Verify an ElevenLabs webhook signature.
 *
 * Header format: `t=<unix-seconds>,v0=<hmac-sha256-hex>`
 * Signed payload: `<timestamp>.<raw-body>` using ELEVENLABS_WEBHOOK_SECRET.
 *
 * Returns null on success, or a 403 NextResponse on failure.
 */
function verifyElevenLabsSignature(
  headerValue: string | null,
  rawBody: string,
): NextResponse | null {
  if (!headerValue) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET
  if (!secret) {
    console.error('[/api/initiate] ELEVENLABS_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Parse `t=...,v0=...`
  let timestamp: string | null = null
  let signature: string | null = null
  for (const part of headerValue.split(',')) {
    const [k, v] = part.trim().split('=')
    if (k === 't') timestamp = v
    else if (k === 'v0') signature = v
  }

  if (!timestamp || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const tsNum = Number(timestamp)
  if (!Number.isFinite(tsNum)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Reject stale / future-dated timestamps (replay protection)
  if (Math.abs(Date.now() / 1000 - tsNum) > MAX_TIMESTAMP_SKEW_SECONDS) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const providedBuf = Buffer.from(signature, 'hex')

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return null
}

/**
 * POST /api/initiate
 *
 * ElevenLabs conversation initiation webhook. Called by ElevenLabs before
 * every inbound call to fetch dynamic variables for the agent prompt.
 *
 * ElevenLabs sends { agent_id, ... } in the body. We look up the clinic
 * via voice_agents.elevenlabs_agent_id and return the clinic's variables.
 */
export async function POST(req: NextRequest) {
  // Read raw body FIRST so we can verify the HMAC signature over the exact bytes
  const rawBody = await req.text()

  // ── Signature verification ─────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.warn('Skipping ElevenLabs signature verification in development')
  } else {
    const failure = verifyElevenLabsSignature(
      req.headers.get(SIGNATURE_HEADER),
      rawBody,
    )
    if (failure) return failure
  }

  let body: Record<string, unknown>
  try {
    body = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {}
  } catch {
    body = {}
  }

  // ElevenLabs may send the called number under different keys
  const toNumber = (
    (body.to as string) ||
    (body.called_number as string) ||
    (body.phone_number as string) ||
    (body.caller_id as string) ||
    null
  )

  console.log('[/api/initiate] Webhook called — full body:', JSON.stringify(body))
  console.log('[/api/initiate] Resolved toNumber:', toNumber)

  const supabase = getServiceSupabase()

  // Resolve clinic from Twilio To number → voice_agents → clinics
  let clinic: Record<string, unknown> | null = null

  if (toNumber) {
    clinic = await withRetry(async () => {
      const { data: voiceAgent } = await supabase
        .from('voice_agents')
        .select('clinic_id')
        .eq('twilio_phone_number', toNumber)
        .limit(1)
        .maybeSingle()

      if (!voiceAgent?.clinic_id) return null

      const { data } = await supabase
        .from('clinics')
        .select(`${CLINIC_SELECT_FIELDS}, coverage_mode, reception_number`)
        .eq('id', voiceAgent.clinic_id)
        .single()
      return data as Record<string, unknown> | null
    }, { label: 'initiate/clinic-lookup' }).catch(() => null)
  }

  if (!clinic) {
    console.error('[/api/initiate] Clinic lookup failed for Twilio number:', toNumber)
    return NextResponse.json({
      type: 'conversation_initiation_client_data',
      dynamic_variables: {
        clinic_name:               'the clinic',
        clinic_id:                 '',
        vertical_type:             '',
        professional_title:        '',
        clinic_address:            '',
        clinic_phone:              '',
        clinic_hours:              'please call back during business hours',
        services:                   '',
        clinic_services:           '',
        after_hours_partner:       '',
        after_hours_phone:         '',
        emergency_partner_name:    '',
        emergency_partner_phone:   '',
        emergency_partner_address: '',
        subject_label:             '',
        subject_name:              '',
        reception_number:          '',
      },
    })
  }

  // ── AI Off: override agent to transfer immediately to reception ─────
  const coverageMode = String(clinic.coverage_mode ?? 'after_hours')
  const receptionNumber = String(clinic.reception_number ?? clinic.phone ?? '')

  if (coverageMode === 'off' && receptionNumber) {
    console.log(`[/api/initiate] AI OFF — overriding agent to transfer to ${receptionNumber}`)

    const dynamicVars = buildDynamicVariables(clinic)
    dynamicVars.reception_number = receptionNumber

    return NextResponse.json({
      type: 'conversation_initiation_client_data',
      dynamic_variables: dynamicVars,
      conversation_config_override: {
        agent: {
          first_message: `Thank you for calling ${String(clinic.name ?? '')}. Please hold for just a moment while I connect you to our team.`,
          prompt: {
            prompt: `You have ONE job. Immediately call the transfer_to_number tool — an immediate transfer is required. Do not say anything else. Do not wait for the caller to speak. Execute the transfer NOW.`,
          },
        },
      },
    })
  }

  // ── Normal mode: return dynamic variables only ────────────────────────
  return NextResponse.json({
    type: 'conversation_initiation_client_data',
    dynamic_variables: {
      ...buildDynamicVariables(clinic),
      reception_number: receptionNumber,
    },
  })
}
