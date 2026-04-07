import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import SettingsClient from './SettingsClient'
import type { VoiceAgent } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get clinic via clinic_users
  const { data: cu } = await service
    .from('clinic_users')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  // Only clinic_admin or platform_owner can access settings
  if (!cu || !['clinic_admin', 'platform_owner'].includes(cu.role)) redirect('/overview')

  // Platform owner has no clinic — show platform-level settings placeholder
  if (cu.role === 'platform_owner') {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', fontFamily: '"DM Sans", sans-serif' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Platform Settings</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          You are logged in as the platform owner. Clinic-specific settings are managed per clinic via the Admin panel.
        </p>
      </div>
    )
  }

  if (!cu.clinic_id) redirect('/overview')

  const { data: clinic } = await service
    .from('clinics')
    .select(`
      id, name, slug, phone, email, address, suburb, website,
      vertical, business_hours,
      after_hours_partner, after_hours_phone, emergency_partner_address,
      services
    `)
    .eq('id', cu.clinic_id)
    .single()

  if (!clinic) redirect('/overview')

  // Fetch voice agent using the authenticated client (RLS applies automatically)
  const { data: voiceAgent } = await supabase
    .from('voice_agents')
    .select('id, clinic_id, elevenlabs_agent_id, twilio_phone_number, is_active, mode')
    .eq('clinic_id', cu.clinic_id)
    .maybeSingle<VoiceAgent>()

  return <SettingsClient clinic={clinic} voiceAgent={voiceAgent ?? null} />
}
