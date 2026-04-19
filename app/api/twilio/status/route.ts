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
    // Dial action callbacks send DialCallStatus, not CallStatus. Previously
    // this route only checked CallStatus, so the AI-off direct-dial path's
    // active_calls row never got cleaned up when the Dial completed.
    const dialStatus = params.get('DialCallStatus')
    const durationRaw = params.get('CallDuration') ?? params.get('DialCallDuration')
    const duration    = durationRaw ? Number(durationRaw) : null

    const TERMINAL_STATUSES = ['completed', 'busy', 'failed', 'no-answer', 'canceled']
    // Only act on terminal statuses; for phone-level status callbacks we'd
    // otherwise trigger on every ringing/answered transition. For Dial action
    // callbacks we trigger once on completion via DialCallStatus.
    const isTerminal =
      (!status && !dialStatus) ||
      (status && TERMINAL_STATUSES.includes(status)) ||
      (dialStatus && TERMINAL_STATUSES.includes(dialStatus))

    if (callSid && isTerminal) {
      const supabase = getServiceSupabase()

      // Look up the active_calls row to bridge this CallSid → clinic_id,
      // the call's start time, and — critically — the authoritative Twilio
      // PSTN caller_phone captured at /api/twilio/incoming.
      const { data: activeCall } = await supabase
        .from('active_calls')
        .select('clinic_id, started_at, caller_phone')
        .eq('call_sid', callSid)
        .maybeSingle()

      // Stamp CallDuration AND the real Twilio From onto the most recent
      // call_inbox row for this clinic created after the call started.
      // caller_phone: Stella's in-call tool often writes the number the
      // caller *said* (frequently mis-heard). active_calls.caller_phone is
      // the PSTN-signalling truth from Twilio's From header. Overwriting
      // here — before the ElevenLabs post-call webhook fires — is the
      // simplest way to guarantee the inbox shows the real caller ID.
      if (activeCall) {
        const { data: target } = await supabase
          .from('call_inbox')
          .select('id, call_duration_seconds')
          .eq('clinic_id', activeCall.clinic_id)
          .gte('created_at', activeCall.started_at)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (target) {
          const update: Record<string, unknown> = {}
          if (
            duration && Number.isFinite(duration) && duration > 0 &&
            target.call_duration_seconds == null
          ) {
            update.call_duration_seconds = duration
          }
          if (activeCall.caller_phone && String(activeCall.caller_phone).trim()) {
            update.caller_phone = String(activeCall.caller_phone).trim()
          }

          if (Object.keys(update).length > 0) {
            const { error: updateErr } = await supabase
              .from('call_inbox')
              .update(update)
              .eq('id', target.id)

            if (updateErr) {
              console.error('[twilio/status] call_inbox update failed:', updateErr.message)
            }
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
