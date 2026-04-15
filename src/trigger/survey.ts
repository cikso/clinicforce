import { task } from '@trigger.dev/sdk/v3'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Fixed taxonomy. Keep in sync with the dashboard label map in
// app/(dashboard)/surveys/SurveysClient.tsx (THEME_LABELS).
export const SURVEY_THEMES = [
  'wait_time',
  'pricing',
  'staff_friendliness',
  'clinical_quality',
  'communication',
  'facility_cleanliness',
  'appointment_availability',
  'billing',
  'follow_up_care',
  'parking',
  'other',
] as const
export type SurveyTheme = typeof SURVEY_THEMES[number]

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

// ─── survey-extract-theme ────────────────────────────────────────────────────
// After a respondent's free-text follow-up reply lands in survey_responses,
// classify it into one of SURVEY_THEMES so the dashboard can cluster feedback.
// Fire-and-forget — failures are logged but never block the SMS reply.

export const surveyExtractThemeTask = task({
  id: 'survey-extract-theme',
  maxDuration: 60,
  run: async (payload: { survey_response_id: string }) => {
    const supabase = getServiceSupabase()

    const { data: row, error } = await supabase
      .from('survey_responses')
      .select('id, follow_up_text, nps_score, theme')
      .eq('id', payload.survey_response_id)
      .single()

    if (error || !row) {
      console.error('[survey-extract-theme] Row not found:', error?.message)
      return { extracted: false, reason: 'not_found' }
    }

    if (row.theme) {
      return { extracted: false, reason: 'already_extracted' }
    }

    const text = (row.follow_up_text ?? '').trim()
    if (text.length < 3) {
      return { extracted: false, reason: 'no_text' }
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[survey-extract-theme] OPENAI_API_KEY not configured')
      return { extracted: false, reason: 'openai_not_configured' }
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const systemPrompt = `You are classifying veterinary clinic post-visit survey feedback into a single theme.
Pick the SINGLE best matching theme from this exact list:
${SURVEY_THEMES.join(', ')}

Definitions:
- wait_time: time spent waiting for the appointment or in clinic
- pricing: cost, value for money, fees
- staff_friendliness: warmth/rudeness of vets, nurses, reception
- clinical_quality: quality of medical care, diagnosis, treatment
- communication: how well things were explained, kept informed, follow-through on calls/messages
- facility_cleanliness: hygiene, smell, tidiness of premises
- appointment_availability: difficulty getting an appointment, scheduling
- billing: invoice clarity, surprise charges, payment process
- follow_up_care: post-visit check-ins, aftercare instructions
- parking: parking access or availability
- other: anything that does not clearly fit above

Respond as JSON: { "theme": "<one_of_the_themes>" }`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `NPS score: ${row.nps_score ?? 'unknown'}\nFeedback: ${text}`,
          },
        ],
        temperature: 0,
        max_tokens: 30,
        response_format: { type: 'json_object' },
      })

      const raw = completion.choices[0]?.message?.content
      if (!raw) {
        return { extracted: false, reason: 'empty_completion' }
      }

      const parsed = JSON.parse(raw) as { theme?: string }
      const theme = parsed.theme as SurveyTheme | undefined

      if (!theme || !SURVEY_THEMES.includes(theme)) {
        console.error('[survey-extract-theme] Invalid theme returned:', parsed)
        return { extracted: false, reason: 'invalid_theme' }
      }

      await supabase
        .from('survey_responses')
        .update({ theme, theme_extracted_at: new Date().toISOString() })
        .eq('id', row.id)

      console.log('[survey-extract-theme] Tagged:', { id: row.id, theme })
      return { extracted: true, theme }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[survey-extract-theme] OpenAI error:', message)
      return { extracted: false, reason: 'openai_error' }
    }
  },
})
