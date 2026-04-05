import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

// ElevenLabs Twilio inbound endpoint — set via env var so it matches your account region.
// Find yours: ElevenLabs → Phone Numbers → click your number → copy the webhook URL shown.
// Common values:
//   https://api.elevenlabs.io/v1/convai/twilio/inbound_call   (global)
//   https://api.us.elevenlabs.io/twilio/inbound_call           (US region)
const ELEVENLABS_INBOUND_URL =
  process.env.ELEVENLABS_INBOUND_URL ??
  'https://api.elevenlabs.io/v1/convai/twilio/inbound_call'

// Dynamic variables required by ElevenLabs first-message templates.
// ElevenLabs reads these from query params on the inbound_call redirect URL.
// Set CLINIC_NAME in Vercel env vars to match whatever {{clinic_name}} you
// used in your ElevenLabs agent's first message.
const CLINIC_NAME = encodeURIComponent(
  process.env.CLINIC_NAME ?? 'the clinic'
)

function elevenLabsUrl() {
  return `${ELEVENLABS_INBOUND_URL}?clinic_name=${CLINIC_NAME}`
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function twiml(xml: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

/**
 * POST /api/twilio/incoming
 *
 * This is the routing layer between Twilio and ElevenLabs.
 *
 * Flow:
 *   Incoming call → Twilio (+61253005033)
 *     → this webhook checks coverage_sessions in Supabase
 *     → if ACTIVE:   redirect to ElevenLabs → Sarah answers
 *     → if INACTIVE: dial real clinic number → desk phone rings
 *
 * Setup required in Twilio Console:
 *   Phone Numbers → +61 2 5300 5033 → Voice
 *   "A call comes in" → Webhook → POST
 *   URL: https://clinicforce.io/api/twilio/incoming
 */
export async function POST() {
  const clinicNumber = process.env.CLINIC_REAL_NUMBER

  if (!clinicNumber) {
    console.error('[twilio/incoming] Missing CLINIC_REAL_NUMBER env var')
    // Fall through to ElevenLabs as safe default — better Sarah answers than nothing
    return twiml(`
<Response>
  <Redirect method="POST">${elevenLabsUrl()}</Redirect>
</Response>`)
  }

  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('coverage_sessions')
      .select('status')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .single()

    const isActive = data?.status === 'ACTIVE'

    if (isActive) {
      // ── Coverage ON → hand off to ElevenLabs (Sarah answers) ──
      // method="POST" is critical — Twilio defaults to GET which strips
      // the call params ElevenLabs needs to identify the agent by number
      return twiml(`
<Response>
  <Redirect method="POST">${elevenLabsUrl()}</Redirect>
</Response>`)
    } else {
      // ── Coverage OFF → ring real clinic number ──────────────
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
    }

  } catch (err) {
    console.error('[twilio/incoming] Supabase error — defaulting to ElevenLabs:', err)
    // Safe fallback: if we can't read coverage state, send to Sarah.
    // Better an AI answers than the call is dropped.
    return twiml(`
<Response>
  <Redirect method="POST">${elevenLabsUrl()}</Redirect>
</Response>`)
  }
}
