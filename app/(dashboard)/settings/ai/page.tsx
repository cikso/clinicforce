import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import AIAgentClient from './AIAgentClient'

export const dynamic = 'force-dynamic'

export default async function AIAgentPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')
  if (profile.userRole !== 'platform_owner') redirect('/settings/team')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const [agentRes, clinicRes] = await Promise.all([
    service
      .from('voice_agents')
      .select('id, clinic_id, is_active, mode, elevenlabs_agent_id, twilio_phone_number')
      .eq('clinic_id', profile.clinicId)
      .maybeSingle(),
    service
      .from('clinics')
      .select('id, name, call_handling_prefs, industry_config')
      .eq('id', profile.clinicId)
      .single(),
  ])

  return (
    <AIAgentClient
      voiceAgent={agentRes.data ?? null}
      clinicName={clinicRes.data?.name ?? profile.clinicName}
      callHandlingPrefs={(clinicRes.data?.call_handling_prefs as Record<string, boolean>) ?? {}}
      industryConfig={(clinicRes.data?.industry_config as Record<string, unknown>) ?? {}}
    />
  )
}
