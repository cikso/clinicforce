import { NextRequest, NextResponse } from 'next/server'
import {
  getServiceSupabase,
  buildDynamicVariables,
  CLINIC_SELECT_FIELDS,
} from '@/lib/voice/shared'

export const preferredRegion = 'syd1'

// ElevenLabs Register Call API — the authenticated way to start a Twilio call
// with dynamic variables. Replaces the old unauthenticated redirect approach.
const ELEVENLABS_REGISTER_CALL_URL =
  'https://api.elevenlabs.io/v1/convai/twilio/register-call'

function twiml(xml: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

/**
 * POST /api/twilio/incoming
 *
 * Routing layer between Twilio and ElevenLabs.
 *
 * Flow:
 *   Incoming call -> Twilio
 *     -> resolve clinic + ElevenLabs agent from voice_agents by called number
 *     -> check coverage_sessions in Supabase
 *     -> if ACTIVE:   call ElevenLabs Register Call API with dynamic variables
 *                     -> returns TwiML -> Stella answers with full clinic context
 *     -> if INACTIVE: dial real clinic number -> desk phone rings
 *
 * Setup in Twilio Console:
 *   Phone Numbers -> your number -> Voice & Fax
 *     "A call comes in"      -> Webhook POST
 *                                https://app.clinicforce.io/api/twilio/incoming
 *     "Call status changes"  -> Webhook POST  (required for LiveCallPulse)
 *                                https://app.clinicforce.io/api/twilio/status
 *                                Events: completed
 *
 * The status callback is what lets the dashboard topbar pulse disappear
 * when a Stella/ElevenLabs call ends. For the overflow (Dial) path, the
 * <Dial action="..."> attribute already handles completion.
 */
export async function POST(req: NextRequest) {
  const clinicNumber = process.env.CLINIC_REAL_NUMBER

  try {
    const supabase = getServiceSupabase()

    // Twilio sends form-encoded data including the called number (To) and caller (From)
    const formData = await req.formData().catch(() => null)
    const toNumber   = formData?.get('To')      as string | null
    const fromNumber = formData?.get('From')    as string | null
    const callSid    = formData?.get('CallSid') as string | null

    if (!toNumber) {
      console.error('[twilio/incoming] No To number in Twilio request')
      if (clinicNumber) {
        return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
      }
      return twiml(`<Response><Say>Sorry, we could not route your call. Please try again later.</Say></Response>`)
    }

    // Resolve clinic AND ElevenLabs agent ID from the called Twilio number
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('clinic_id, elevenlabs_agent_id')
      .eq('twilio_phone_number', toNumber)
      .limit(1)
      .maybeSingle()

    if (!voiceAgent?.clinic_id) {
      console.error('[twilio/incoming] No voice_agent matched phone number:', toNumber)
      if (clinicNumber) {
        return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
      }
      return twiml(`<Response><Say>Sorry, we could not route your call. Please try again later.</Say></Response>`)
    }

    const clinicId = voiceAgent.clinic_id as string
    const agentId  = voiceAgent.elevenlabs_agent_id as string | null

    // Fetch coverage status and clinic details in parallel
    const [coverageResult, clinicResult] = await Promise.all([
      supabase
        .from('coverage_sessions')
        .select('status')
        .eq('clinic_id', clinicId)
        .single(),
      supabase
        .from('clinics')
        .select(CLINIC_SELECT_FIELDS)
        .eq('id', clinicId)
        .single(),
    ])

    const isActive = coverageResult.data?.status === 'ACTIVE'
    const clinic   = clinicResult.data as Record<string, unknown> | null

    // ── Record that a call is in progress. Powers LiveCallPulse in the
    //    dashboard topbar via Supabase realtime. Deleted by /api/twilio/status
    //    when the call completes. Fire-and-forget — never block the call flow.
    const willBeHandledByStella = Boolean(isActive && clinic && agentId)
    if (callSid) {
      supabase
        .from('active_calls')
        .upsert(
          {
            clinic_id:    clinicId,
            call_sid:     callSid,
            caller_phone: fromNumber,
            handled_by:   willBeHandledByStella ? 'STELLA' : 'CLINIC',
          },
          { onConflict: 'call_sid' },
        )
        .then(({ error }) => {
          if (error) console.error('[twilio/incoming] active_calls upsert failed:', error.message)
        })
    }

    if (isActive && clinic && agentId) {
      // ── Coverage ON -> register call with ElevenLabs (authenticated + dynamic vars)
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        console.error('[twilio/incoming] ELEVENLABS_API_KEY not set — cannot register call')
        if (clinicNumber) {
          return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
        }
        return twiml(`<Response><Say>Sorry, we are experiencing technical difficulties.</Say></Response>`)
      }

      const dynamicVars = buildDynamicVariables(clinic)

      console.log('[twilio/incoming] Registering call with ElevenLabs:', {
        agent_id: agentId,
        from: fromNumber,
        to: toNumber,
        vars: Object.keys(dynamicVars),
      })

      const registerResponse = await fetch(ELEVENLABS_REGISTER_CALL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          agent_id: agentId,
          from_number: fromNumber ?? '',
          to_number: toNumber,
          direction: 'inbound',
          conversation_initiation_client_data: {
            dynamic_variables: dynamicVars,
          },
        }),
        signal: AbortSignal.timeout(10_000),
      })

      if (!registerResponse.ok) {
        const errText = await registerResponse.text().catch(() => 'unknown error')
        console.error(
          '[twilio/incoming] ElevenLabs register-call failed:',
          registerResponse.status,
          errText,
        )
        // Fallback: dial the clinic directly
        if (clinicNumber) {
          return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
        }
        return twiml(`<Response><Say>Sorry, we are experiencing technical difficulties.</Say></Response>`)
      }

      // ElevenLabs returns TwiML XML — pass it directly to Twilio
      const twimlBody = await registerResponse.text()
      console.log('[twilio/incoming] ElevenLabs register-call success, returning TwiML')

      return new NextResponse(twimlBody, {
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      })

    } else if (clinicNumber) {
      // ── Coverage OFF -> ring real clinic number ──────────────
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
    } else if (clinic) {
      // No env fallback number but we have clinic data — try clinic phone
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${String(clinic.phone ?? '')}</Number>
  </Dial>
</Response>`)
    } else {
      return twiml(`<Response><Say>Sorry, we could not route your call. Please try again later.</Say></Response>`)
    }

  } catch (err) {
    console.error('[twilio/incoming] Error:', err)
    if (clinicNumber) {
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
    }
    return twiml(`<Response><Say>Sorry, we are experiencing technical difficulties. Please try again later.</Say></Response>`)
  }
}
