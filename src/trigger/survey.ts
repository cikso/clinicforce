import { task } from '@trigger.dev/sdk/v3'
import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ─── survey.send ─────────────────────────────────────────────────────────────
// Delayed job: fetches survey config, personalises SMS, sends via Twilio,
// and updates the survey_responses row with twilio_message_sid + sent_at.

export const surveySendTask = task({
  id: 'survey-send',
  maxDuration: 60,
  run: async (payload: { survey_response_id: string; clinic_id: string }) => {
    const supabase = getServiceSupabase()

    // Fetch survey config + clinic name
    const [surveyResult, clinicResult, responseResult] = await Promise.all([
      supabase
        .from('surveys')
        .select('sms_template, enabled')
        .eq('clinic_id', payload.clinic_id)
        .single(),
      supabase
        .from('clinics')
        .select('name')
        .eq('id', payload.clinic_id)
        .single(),
      supabase
        .from('survey_responses')
        .select('patient_name, patient_phone')
        .eq('id', payload.survey_response_id)
        .single(),
    ])

    if (!surveyResult.data || !clinicResult.data || !responseResult.data) {
      console.error('[survey-send] Missing data:', {
        survey: !!surveyResult.data,
        clinic: !!clinicResult.data,
        response: !!responseResult.data,
      })
      return { sent: false, reason: 'missing_data' }
    }

    // Respect disabled flag (may have changed since scheduling)
    if (!surveyResult.data.enabled) {
      return { sent: false, reason: 'surveys_disabled' }
    }

    const { patient_name, patient_phone } = responseResult.data
    const clinicName = clinicResult.data.name
    const template = surveyResult.data.sms_template ?? ''

    // Personalise SMS
    const smsBody = template
      .replace(/\{\{patient_name\}\}/g, patient_name ?? 'there')
      .replace(/\{\{clinic_name\}\}/g, clinicName ?? '')

    // Send via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_SMS_FROM_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.error('[survey-send] Twilio credentials not configured')
      return { sent: false, reason: 'twilio_not_configured' }
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const twilioAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: patient_phone,
        From: fromNumber,
        Body: smsBody,
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!twilioResponse.ok) {
      const errText = await twilioResponse.text().catch(() => 'unknown')
      console.error('[survey-send] Twilio error:', twilioResponse.status, errText)
      return { sent: false, reason: 'twilio_error' }
    }

    const twilioData = await twilioResponse.json()
    const messageSid = twilioData.sid as string

    // Update survey_responses with Twilio SID and sent timestamp
    await supabase
      .from('survey_responses')
      .update({
        twilio_message_sid: messageSid,
        sent_at: new Date().toISOString(),
      })
      .eq('id', payload.survey_response_id)

    console.log('[survey-send] SMS sent:', { messageSid, to: patient_phone })
    return { sent: true, messageSid }
  },
})
