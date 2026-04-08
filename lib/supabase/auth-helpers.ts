import { createClient } from './server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export interface ClinicProfile {
  userId: string
  userName: string
  userRole: string
  clinicId: string
  clinicName: string
  clinicPhone: string
  vertical: string
  isPlatformOwner: boolean
}

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getClinicProfile(): Promise<ClinicProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const queryClient = serviceRoleKey
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    : supabase

  const { data, error } = await queryClient
    .from('clinic_users')
    .select(`
      id, name, role,
      clinics ( id, name, phone, vertical )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[getClinicProfile] query error:', error.message)
    return null
  }
  if (!data) return null

  let clinic = Array.isArray(data.clinics) ? data.clinics[0] : (data.clinics as Record<string, unknown> | null)
  const role = (data.role as string) ?? 'receptionist'
  const isPlatformOwner = role === 'platform_owner'

  // Platform owner: respect the cf_active_clinic cookie if set,
  // otherwise fall back to the active voice_agents clinic
  if (isPlatformOwner) {
    const cookieStore = await cookies()
    const cookieClinicId = cookieStore.get('cf_active_clinic')?.value

    if (cookieClinicId) {
      const { data: picked } = await queryClient
        .from('clinics')
        .select('id, name, phone, vertical')
        .eq('id', cookieClinicId)
        .maybeSingle()
      if (picked) clinic = picked as Record<string, unknown>
    }

    // No cookie or invalid cookie — fall back to active voice agent clinic
    if (!clinic) {
      const { data: activeAgent } = await queryClient
        .from('voice_agents')
        .select('clinic_id, clinics(id, name, phone, vertical)')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()
      const agentClinic = activeAgent?.clinics
      const resolved = Array.isArray(agentClinic) ? agentClinic[0] : agentClinic
      if (resolved) clinic = resolved as Record<string, unknown>
    }
  }

  return {
    userId: user.id,
    userName: isPlatformOwner ? 'ClinicForce' : ((data.name as string) ?? user.email ?? 'Staff'),
    userRole: role,
    clinicId: (clinic?.id as string) ?? '',
    clinicName: (clinic?.name as string) ?? '',
    clinicPhone: (clinic?.phone as string) ?? '',
    vertical: (clinic?.vertical as string) ?? 'vet',
    isPlatformOwner,
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
