import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase, validateSecret } from '@/lib/voice/shared'

export const preferredRegion = 'syd1'

// ─── POST /api/survey/trigger ────────────────────────────────────────────────
// Generic entry point for scheduling a post-visit survey SMS.
// Called by booking platforms (Phase 2) or manually from the dashboard.
// Protected with x-api-secret header — same as other webhook endpoints.

export async function POST(req: NextRequest) {
  if (!validateSecret(req)) {
    console.error('[/api/survey/trigger] 401 — invalid or missing x-api-secret')
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const clinic_id = body.clinic_id as string | undefined
  const patient_name = body.patient_name as string | undefined
  const patient_phone = body.patient_phone as string | undefined
  const visit_date = body.visit_date as string | undefined
  const provider_name = (body.provider_name as string | undefined) ?? null
  const source = (body.source as string | undefined) ?? 'manual'

  if (!clinic_id || !patient_name || !patient_phone) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: clinic_id, patient_name, patient_phone' },
      { status: 400 },
    )
  }

  try {
    const supabase = getServiceSupabase()

    // Validate clinic exists and surveys are enabled
    const { data: survey, error: surveyErr } = await supabase
      .from('surveys')
      .select('id, enabled, delay_minutes')
      .eq('clinic_id', clinic_id)
      .maybeSingle()

    if (surveyErr || !survey) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found or survey not configured' },
        { status: 404 },
      )
    }

    if (!survey.enabled) {
      return NextResponse.json(
        { success: false, error: 'Surveys are disabled for this clinic' },
        { status: 422 },
      )
    }

    // Insert survey_responses row
    const { data: response, error: insertErr } = await supabase
      .from('survey_responses')
      .insert({
        clinic_id,
        patient_name,
        patient_phone,
        visit_date: visit_date ?? null,
        provider_name,
        source,
        sent_at: null, // will be set when SMS is actually sent
      })
      .select('id')
      .single()

    if (insertErr || !response) {
      console.error('[/api/survey/trigger] Insert error:', insertErr?.message)
      return NextResponse.json({ success: false, error: 'Failed to create survey response' }, { status: 500 })
    }

    // Schedule Trigger.dev delayed job
    const delayMinutes = survey.delay_minutes ?? 120
    try {
      const sdkPath = ['@trigger.dev', 'sdk', 'v3'].join('/')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { tasks } = await (import(sdkPath) as Promise<any>)
      await tasks.trigger('survey-send', {
        survey_response_id: response.id,
        clinic_id,
      }, {
        delay: `${delayMinutes}m`,
      })
    } catch (triggerErr) {
      console.error('[/api/survey/trigger] Failed to schedule Trigger.dev job:', triggerErr)
      // Don't fail the request — the row is created, job can be retried
    }

    return NextResponse.json({ success: true, survey_response_id: response.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/survey/trigger] Unexpected error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
