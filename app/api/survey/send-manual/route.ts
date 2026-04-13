import { NextRequest, NextResponse } from 'next/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getServiceSupabase } from '@/lib/voice/shared'

export const preferredRegion = 'syd1'

// ─── POST /api/survey/send-manual ────────────────────────────────────────────
// Authenticated endpoint for manually triggering a survey from the dashboard.
// Same logic as /api/survey/trigger but uses session auth instead of x-api-secret.

export async function POST(req: NextRequest) {
  const profile = await getClinicProfile()
  if (!profile?.clinicId || !['clinic_admin', 'platform_owner'].includes(profile.userRole)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const patient_name = body.patient_name as string | undefined
  const patient_phone = body.patient_phone as string | undefined
  const visit_date = (body.visit_date as string | undefined) ?? null
  const provider_name = (body.provider_name as string | undefined) ?? null

  if (!patient_name || !patient_phone) {
    return NextResponse.json(
      { error: 'Missing required fields: patient_name, patient_phone' },
      { status: 400 },
    )
  }

  const clinicId = profile.clinicId
  const supabase = getServiceSupabase()

  // Validate surveys are enabled
  const { data: survey } = await supabase
    .from('surveys')
    .select('id, enabled, delay_minutes')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  if (!survey?.enabled) {
    return NextResponse.json({ error: 'Surveys are disabled for this clinic' }, { status: 422 })
  }

  // Insert response row
  const { data: response, error: insertErr } = await supabase
    .from('survey_responses')
    .insert({
      clinic_id: clinicId,
      patient_name,
      patient_phone,
      visit_date,
      provider_name,
      source: 'manual',
      sent_at: null,
    })
    .select('id')
    .single()

  if (insertErr || !response) {
    console.error('[/api/survey/send-manual] Insert error:', insertErr?.message)
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 })
  }

  // Schedule delayed job
  const delayMinutes = survey.delay_minutes ?? 120
  try {
    const sdkPath = ['@trigger.dev', 'sdk', 'v3'].join('/')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tasks } = await (import(sdkPath) as Promise<any>)
    await tasks.trigger('survey-send', {
      survey_response_id: response.id,
      clinic_id: clinicId,
    }, {
      delay: `${delayMinutes}m`,
    })
  } catch (triggerErr) {
    console.error('[/api/survey/send-manual] Trigger.dev error:', triggerErr)
  }

  return NextResponse.json({ success: true, survey_response_id: response.id })
}
