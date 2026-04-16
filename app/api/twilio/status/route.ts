import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/voice/shared'
import { verifyTwilioRequest } from '@/lib/twilio/verify'

export const preferredRegion = 'syd1'

/**
 * POST /api/twilio/status
 *
 * Call completion webhook. Fires in two scenarios:
 *
 *   1. Dial action callback — when the <Dial> verb in our incoming TwiML
 *      completes (Twilio calls this URL automatically because of
 *      `action="/api/twilio/status"` on the <Dial>).
 *
 *   2. Phone-number-level status callback — if the clinic has set the
 *      "Status Callback URL" on their Twilio number to this endpoint,
 *      Twilio will POST here on every status change (initiated, ringing,
 *      answered, completed). This is the recommended setup for Stella-
 *      handled calls (the ElevenLabs path), because ElevenLabs returns
 *      its own TwiML and we don't own the completion flow otherwise.
 *
 * On terminal status we:
 *   1. Copy Twilio's CallDuration onto the most recent call_inbox row for
 *      this call, if one exists (inserted by /api/flag-urgent or
 *      /api/callback during the conversation). ElevenLabs' post-call
 *      webhook sometimes doesn't fire or doesn't include duration, so
 *      taking it straight from Twilio is the reliable source of truth.
 *   2. Delete the active_calls row so the dashboard LiveCallPulse clears
 *      in real time.
 *
 * Returns empty TwiML so Twilio is happy whether it called us as a Dial
 * action URL or a phone-number-level status callback.
 */
export async function POST(req: NextRequest) {
  // Unsigned status callbacks would let an attacker clear LiveCallPulse
  // prematurely or write bogus call_duration_seconds. Reject anything unsigned.
  const verified = await verifyTwilioRequest(req)
  if (!verified.valid) {
    console.error('[twilio/status] signature verification failed:', verified.reason)
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const params     = verified.params
    const callSid    = params.get('CallSid')
    const status     = params.get('CallStatus')
    const durationRaw = params.get('CallDuration')
    const duration    = durationRaw ? Number(durationRaw) : null

    // Only act on terminal statuses; for Dial action callbacks the event
    // fires once on completion so this is a no-op filter, but for phone-level
    // status callbacks we'd otherwise trigger on every ringing/answered
    // transition.
    const isTerminal = !status
      || ['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(status)

    if (callSid && isTerminal) {
      const supabase = getServiceSupabase()

      // Look up the active_calls row to bridge this CallSid → clinic_id
      // and the call's start time. Needed to find the right call_inbox row
      // to stamp with the duration.
      const { data: activeCall } = await supabase
        .from('active_calls')
        .select('clinic_id, started_at')
        .eq('call_sid', callSid)
        .maybeSingle()

      // Stamp CallDuration onto the most recent call_inbox row for this
      // clinic created after the call started that doesn't already have
      // a duration. Scoped narrowly so we don't clobber older rows.
      if (activeCall && duration && Number.isFinite(duration) && duration > 0) {
        const { data: target } = await supabase
          .from('call_inbox')
          .select('id')
          .eq('clinic_id', activeCall.clinic_id)
          .gte('created_at', activeCall.started_at)
          .is('call_duration_seconds', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (target) {
          const { error: updateErr } = await supabase
            .from('call_inbox')
            .update({ call_duration_seconds: duration })
            .eq('id', target.id)

          if (updateErr) {
            console.error('[twilio/status] call_duration update failed:', updateErr.message)
          }
        }
      }

      // Clear the active_calls row so LiveCallPulse disappears.
      const { error } = await supabase
        .from('active_calls')
        .delete()
        .eq('call_sid', callSid)

      if (error) {
        console.error('[twilio/status] active_calls delete failed:', error.message)
      }
    }
  } catch (err) {
    console.error('[twilio/status] Error:', err)
  }

  // Empty TwiML — Twilio is happy.
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Response></Response>`,
    { headers: { 'Content-Type': 'text/xml; charset=utf-8' } },
  )
}
