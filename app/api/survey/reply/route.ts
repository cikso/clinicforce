import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/voice/shared'
import { verifyTwilioRequest } from '@/lib/twilio/verify'

export const preferredRegion = 'syd1'

// ─── POST /api/survey/reply ──────────────────────────────────────────────────
// Twilio inbound SMS webhook.
// NOTE: The Twilio number's "A message comes in" webhook must be pointed at
//   https://app.clinicforce.io/api/survey/reply
// in the Twilio console. This is a manual step done once per number.
//
// X-Twilio-Signature is verified before any DB reads or writes. An unsigned
// request could inject bogus NPS scores, create fake survey_actions, or trick
// the handler into sending TwiML replies on behalf of our Twilio number.

function twiml(body?: string) {
  const inner = body ? `<Message>${escapeXml(body)}</Message>` : ''
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${inner}</Response>`,
    { headers: { 'Content-Type': 'text/xml; charset=utf-8' } },
  )
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function POST(req: NextRequest) {
  const verified = await verifyTwilioRequest(req)
  if (!verified.valid) {
    console.error('[survey/reply] signature verification failed:', verified.reason)
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const params = verified.params
    const from = params.get('From')
    const body = (params.get('Body') ?? '').trim()

    if (!from) {
      return twiml()
    }

    const supabase = getServiceSupabase()

    // Find the most recent survey_response for this phone number
    const { data: response } = await supabase
      .from('survey_responses')
      .select('id, clinic_id, nps_score, patient_name, visit_date')
      .eq('patient_phone', from)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!response) {
      // No matching survey — return empty TwiML
      return twiml()
    }

    const parsed = parseInt(body, 10)
    const isScore = !isNaN(parsed) && parsed >= 1 && parsed <= 10

    if (isScore && !response.nps_score) {
      // ── First reply: NPS score ──────────────────────────────────────
      const score = parsed

      await supabase
        .from('survey_responses')
        .update({ nps_score: score, responded_at: new Date().toISOString() })
        .eq('id', response.id)

      // Fetch clinic's google_review_url
      const { data: clinic } = await supabase
        .from('clinics')
        .select('google_review_url')
        .eq('id', response.clinic_id)
        .maybeSingle()

      let replyMsg: string
      let createAction = false

      if (score <= 6) {
        // Detractor
        replyMsg = "Thank you for your feedback. We're sorry your experience wasn't perfect. Could you tell us what we could do better?"
        createAction = true
      } else if (score <= 8) {
        // Passive
        replyMsg = 'Thanks for the feedback! What would make your next visit a 10 out of 10?'
      } else {
        // Promoter (9-10)
        if (clinic?.google_review_url) {
          replyMsg = `That's wonderful to hear! We'd love if you could share your experience: ${clinic.google_review_url}`
        } else {
          replyMsg = "That's wonderful to hear! Thank you for your kind words."
        }
      }

      // Update follow_up_sent_at
      await supabase
        .from('survey_responses')
        .update({ follow_up_sent_at: new Date().toISOString() })
        .eq('id', response.id)

      // Create action for detractors
      if (createAction) {
        await supabase.from('survey_actions').insert({
          clinic_id: response.clinic_id,
          survey_response_id: response.id,
          patient_name: response.patient_name,
          patient_phone: from,
          visit_date: response.visit_date,
          nps_score: score,
          status: 'open',
        })
      }

      return twiml(replyMsg)
    }

    if (!isScore && response.nps_score) {
      // ── Follow-up text (already has a score) ────────────────────────
      await supabase
        .from('survey_responses')
        .update({
          follow_up_text: body,
          follow_up_responded_at: new Date().toISOString(),
        })
        .eq('id', response.id)

      // If detractor (score 1-6), update the action with the comment
      if (response.nps_score <= 6) {
        await supabase
          .from('survey_actions')
          .update({ comment: body, updated_at: new Date().toISOString() })
          .eq('survey_response_id', response.id)
      }

      return twiml()
    }

    // Unrecognised message — return empty TwiML
    return twiml()
  } catch (err) {
    console.error('[/api/survey/reply] Error:', err)
    return twiml()
  }
}
