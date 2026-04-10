import { NextRequest, NextResponse } from 'next/server'
import { validateSecret, getServiceSupabase } from '@/lib/voice/shared'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emergency-transfer
//
// Called by ElevenLabs when the caller confirms they want to be connected
// to the emergency partner clinic.
//
// ElevenLabs passes:
//   emergency_partner_phone  ← {{emergency_partner_phone}} (per-clinic)
//   clinic_name              ← {{clinic_name}}
//   clinic_id                ← {{clinic_id}}
//
// This route:
//   1. Resolves the Twilio number for this clinic from voice_agents
//   2. Finds the active in-progress Twilio call to that number
//   3. Redirects it to the clinic's emergency partner
// ─────────────────────────────────────────────────────────────────────────────

type TransferBody = {
  emergency_partner_phone?: string
  clinic_name?: string
  clinic_id?: string
}

function getCredentials() {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env vars')
  const authorization = `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`
  return { sid, authorization }
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('61') && digits.length >= 11) return `+${digits}`
  if (digits.startsWith('0')  && digits.length === 10) return `+61${digits.slice(1)}`
  if (digits.length === 9 && !digits.startsWith('0')) return `+61${digits}`
  return `+${digits}`
}

export async function POST(req: NextRequest) {
  if (!validateSecret(req)) {
    console.error('[/api/emergency-transfer] 401 — invalid or missing x-api-secret')
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: TransferBody

  try {
    body = (await req.json()) as TransferBody
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawEmergencyPhone = body.emergency_partner_phone
  const clinicName        = body.clinic_name ?? 'Unknown clinic'
  const clinicId          = body.clinic_id

  if (!rawEmergencyPhone) {
    console.error('[/api/emergency-transfer] No emergency_partner_phone provided')
    return NextResponse.json({ success: false, error: 'Missing emergency_partner_phone' }, { status: 400 })
  }

  try {
    const { sid, authorization } = getCredentials()

    // Resolve the Twilio number for this clinic from voice_agents
    let ourNumber: string | null = null

    if (clinicId) {
      const supabase = getServiceSupabase()
      const { data: voiceAgent } = await supabase
        .from('voice_agents')
        .select('twilio_phone_number')
        .eq('clinic_id', clinicId)
        .limit(1)
        .maybeSingle()
      if (voiceAgent?.twilio_phone_number) {
        ourNumber = toE164(voiceAgent.twilio_phone_number)
      }
    }

    // Fallback to env var if clinic lookup didn't return a number
    if (!ourNumber && process.env.TWILIO_PHONE_NUMBER) {
      ourNumber = toE164(process.env.TWILIO_PHONE_NUMBER)
    }

    if (!ourNumber) {
      return NextResponse.json({ success: false, error: 'No Twilio number found for clinic' }, { status: 400 })
    }

    const emergencyPhone = toE164(rawEmergencyPhone)

    // Find the active inbound call to our Twilio number
    const listUrl =
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json` +
      `?To=${encodeURIComponent(ourNumber)}&Status=in-progress&PageSize=5`

    const listRes = await fetch(listUrl, {
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(10_000),
    })

    if (!listRes.ok) {
      const err = await listRes.text()
      console.error('[/api/emergency-transfer] Twilio list calls failed:', err)
      return NextResponse.json({ success: false, error: 'Failed to list Twilio calls' }, { status: 502 })
    }

    const listData = (await listRes.json()) as { calls?: Array<{ sid: string; from: string }> }
    const activeCalls = listData.calls ?? []

    if (!activeCalls.length) {
      console.warn('[/api/emergency-transfer] No active call found for', ourNumber)
      return NextResponse.json({ success: false, error: 'No active call found' }, { status: 404 })
    }

    const callSid = activeCalls[0].sid

    // Redirect the call to the emergency partner
    const twiml = `<Response><Dial timeout="30" callerId="${ourNumber}">${emergencyPhone}</Dial></Response>`

    const updateRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls/${callSid}.json`,
      {
        method: 'POST',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ Twiml: twiml }).toString(),
        signal: AbortSignal.timeout(10_000),
      },
    )

    if (!updateRes.ok) {
      const err = await updateRes.text()
      console.error('[/api/emergency-transfer] Twilio call update failed:', err)
      return NextResponse.json({ success: false, error: 'Transfer failed', detail: err }, { status: 502 })
    }

    console.log(
      `[/api/emergency-transfer] Call ${callSid} transferred to ${emergencyPhone} for ${clinicName}`,
    )

    return NextResponse.json({
      success: true,
      call_sid: callSid,
      transferred_to: emergencyPhone,
      clinic: clinicName,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/emergency-transfer] Unexpected error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
