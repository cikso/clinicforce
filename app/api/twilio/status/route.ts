import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/voice/shared'

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
 * Either way, we key off the CallSid and delete the matching active_calls
 * row so the dashboard LiveCallPulse disappears in real time.
 *
 * Also returns an empty TwiML so Twilio doesn't complain when called as a
 * Dial action URL.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null)
    const callSid  = formData?.get('CallSid')    as string | null
    const status   = formData?.get('CallStatus') as string | null

    // Only delete on terminal statuses; for Dial action callbacks the event
    // fires once on completion so this is a no-op filter, but for phone-level
    // status callbacks we'd otherwise delete the row on every ringing/answered
    // transition.
    const isTerminal = !status
      || ['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(status)

    if (callSid && isTerminal) {
      const supabase = getServiceSupabase()
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
