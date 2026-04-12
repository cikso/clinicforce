import { NextRequest, NextResponse } from 'next/server'
import { validateSecret, getServiceSupabase } from '@/lib/voice/shared'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transfer
//
// Dynamic call transfer webhook — called by ElevenLabs as a custom tool
// when AI Off mode requires an immediate transfer to clinic reception.
//
// Unlike the system transfer_to_number tool (hardcoded phone number),
// this endpoint looks up the reception_number from Supabase per-clinic,
// enabling one shared agent to transfer to different numbers dynamically.
//
// ElevenLabs passes:
//   clinic_id  ← {{clinic_id}} (dynamic variable)
//
// This route:
//   1. Looks up clinics.reception_number (fallback: clinics.phone)
//   2. Resolves the Twilio number for this clinic from voice_agents
//   3. Finds the active in-progress Twilio call
//   4. Redirects it to the clinic's reception number
// ─────────────────────────────────────────────────────────────────────────────

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
    console.error('[/api/transfer] 401 — invalid or missing x-api-secret')
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const clinicId = body.clinic_id as string | undefined

  if (!clinicId) {
    console.error('[/api/transfer] No clinic_id provided')
    return NextResponse.json({ success: false, error: 'Missing clinic_id' }, { status: 400 })
  }

  try {
    const supabase = getServiceSupabase()

    // 1. Look up reception_number from clinics table
    const { data: clinic } = await supabase
      .from('clinics')
      .select('reception_number, phone, name')
      .eq('id', clinicId)
      .maybeSingle()

    const transferTo = clinic?.reception_number ?? clinic?.phone
    if (!transferTo) {
      console.error('[/api/transfer] No reception_number or phone for clinic:', clinicId)
      return NextResponse.json({ success: false, error: 'No transfer number found for clinic' }, { status: 400 })
    }

    const transferPhone = toE164(String(transferTo))
    const clinicName = String(clinic?.name ?? 'Unknown clinic')

    // 2. Resolve the Twilio number for this clinic
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('twilio_phone_number')
      .eq('clinic_id', clinicId)
      .limit(1)
      .maybeSingle()

    let ourNumber = voiceAgent?.twilio_phone_number
      ? toE164(voiceAgent.twilio_phone_number)
      : null

    if (!ourNumber && process.env.TWILIO_PHONE_NUMBER) {
      ourNumber = toE164(process.env.TWILIO_PHONE_NUMBER)
    }

    if (!ourNumber) {
      return NextResponse.json({ success: false, error: 'No Twilio number found for clinic' }, { status: 400 })
    }

    // 3. Find the active inbound call via Twilio API
    const { sid, authorization } = getCredentials()

    const listUrl =
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json` +
      `?To=${encodeURIComponent(ourNumber)}&Status=in-progress&PageSize=5`

    const listRes = await fetch(listUrl, {
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(10_000),
    })

    if (!listRes.ok) {
      const err = await listRes.text()
      console.error('[/api/transfer] Twilio list calls failed:', err)
      return NextResponse.json({ success: false, error: 'Failed to list Twilio calls' }, { status: 502 })
    }

    const listData = (await listRes.json()) as { calls?: Array<{ sid: string }> }
    const activeCalls = listData.calls ?? []

    if (!activeCalls.length) {
      console.warn('[/api/transfer] No active call found for', ourNumber)
      return NextResponse.json({ success: false, error: 'No active call found' }, { status: 404 })
    }

    const callSid = activeCalls[0].sid

    // 4. Redirect the call to reception
    const twiml = `<Response><Dial timeout="30" callerId="${ourNumber}">${transferPhone}</Dial></Response>`

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
      console.error('[/api/transfer] Twilio call update failed:', err)
      return NextResponse.json({ success: false, error: 'Transfer failed', detail: err }, { status: 502 })
    }

    console.log(`[/api/transfer] Call ${callSid} transferred to ${transferPhone} for ${clinicName}`)

    return NextResponse.json({
      success: true,
      call_sid: callSid,
      transferred_to: transferPhone,
      clinic: clinicName,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/transfer] Unexpected error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
