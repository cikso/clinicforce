import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emergency-transfer
//
// Called by ElevenLabs webhook tool `emergency_transfer` when the caller
// confirms they want to be connected to the emergency partner clinic.
//
// ElevenLabs auto-fills the parameters from dynamic variables:
//   emergency_partner_phone  ← {{emergency_partner_phone}} (per-clinic from initiation webhook)
//   clinic_name              ← {{clinic_name}}
//
// This route:
//   1. Finds the active in-progress Twilio call to our number
//   2. Redirects it to the clinic's emergency partner via Twilio REST API
//   3. ElevenLabs detects the stream ended and closes the conversation gracefully
//
// ─── Enterprise multi-clinic note ────────────────────────────────────────────
// TWILIO_PHONE_NUMBER is the single ElevenLabs/Twilio number. For multi-number
// deployments, pass `called_number` as a system-provided tool parameter and use
// it to identify which Twilio number to query.
// ─────────────────────────────────────────────────────────────────────────────

type TransferBody = {
  emergency_partner_phone?: string
  clinic_name?: string
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
  // Bare 9-digit Australian number without leading 0
  if (digits.length === 9 && !digits.startsWith('0')) return `+61${digits}`
  return `+${digits}`
}

export async function POST(req: NextRequest) {
  let body: TransferBody

  try {
    body = (await req.json()) as TransferBody
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  console.log('[/api/emergency-transfer] Incoming body:', JSON.stringify(body))

  // Fallback to Baulkham Hills emergency partner if ElevenLabs doesn't pass the value
  const rawEmergencyPhone = body.emergency_partner_phone ?? '0296397744'
  const clinicName        = body.clinic_name ?? 'Baulkham Hills Veterinary Hospital'

  try {
    const { sid, authorization } = getCredentials()
    const ourNumber = toE164(process.env.TWILIO_PHONE_NUMBER ?? '+61253005033')
    const emergencyPhone = toE164(rawEmergencyPhone)

    // ── Step 1: Find the active inbound call to our Twilio number ──────────
    const listUrl =
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json` +
      `?To=${encodeURIComponent(ourNumber)}&Status=in-progress&PageSize=5`

    const listRes = await fetch(listUrl, {
      headers: { Authorization: authorization },
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

    // ── Step 2: Redirect the call to the emergency partner ─────────────────
    // Twilio executes the new TwiML immediately, pulling the caller out of the
    // ElevenLabs conference and connecting them to the emergency number.
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
      },
    )

    if (!updateRes.ok) {
      const err = await updateRes.text()
      console.error('[/api/emergency-transfer] Twilio call update failed:', err)
      return NextResponse.json({ success: false, error: 'Transfer failed', detail: err }, { status: 502 })
    }

    console.log(
      `[/api/emergency-transfer] ✅ Call ${callSid} transferred to ${emergencyPhone} for ${clinicName}`,
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
