import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getServiceSupabase } from '@/lib/voice/shared'
import SurveysClient from './SurveysClient'

export const metadata: Metadata = { title: 'Surveys — ClinicForce' }
export const dynamic = 'force-dynamic'

export default async function SurveysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getClinicProfile()
  if (!profile?.clinicId) redirect('/login')

  // Admin-only page
  if (!['clinic_admin', 'platform_owner'].includes(profile.userRole)) {
    redirect('/overview')
  }

  const service = getServiceSupabase()
  const clinicId = profile.clinicId

  // Fetch all data in parallel
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [
    surveyConfigResult,
    responsesResult,
    actionsResult,
    allResponsesResult,
  ] = await Promise.all([
    service
      .from('surveys')
      .select('*')
      .eq('clinic_id', clinicId)
      .maybeSingle(),
    service
      .from('survey_responses')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('sent_at', thirtyDaysAgo)
      .order('sent_at', { ascending: false }),
    service
      .from('survey_actions')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false }),
    // All responses with scores for NPS trend (last 30 days)
    service
      .from('survey_responses')
      .select('nps_score, responded_at')
      .eq('clinic_id', clinicId)
      .not('nps_score', 'is', null)
      .gte('responded_at', thirtyDaysAgo)
      .order('responded_at', { ascending: true }),
  ])

  return (
    <SurveysClient
      clinicId={clinicId}
      surveyConfig={surveyConfigResult.data}
      responses={responsesResult.data ?? []}
      actions={actionsResult.data ?? []}
      npsData={allResponsesResult.data ?? []}
    />
  )
}
