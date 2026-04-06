import { createClient } from './server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface ClinicProfile {
  userId: string
  userName: string
  userRole: string
  clinicId: string
  clinicName: string
  clinicPhone: string
  clinicSuburb: string
  clinicState: string
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

  // Always use service role for profile lookup — bypasses RLS completely
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await service
    .from('clinic_users')
    .select(`
      id, name, role,
      clinics ( id, name, phone, suburb, state, vertical )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  const clinic = Array.isArray(data.clinics) ? data.clinics[0] : (data.clinics as Record<string, unknown> | null)
  const role = (data.role as string) ?? 'receptionist'
  const isPlatformOwner = role === 'platform_owner'

  return {
    userId: user.id,
    userName: isPlatformOwner ? 'ClinicForce' : ((data.name as string) ?? user.email ?? 'Staff'),
    userRole: role,
    clinicId: (clinic?.id as string) ?? '',
    clinicName: isPlatformOwner ? '' : ((clinic?.name as string) ?? ''),
    clinicPhone: (clinic?.phone as string) ?? '',
    clinicSuburb: (clinic?.suburb as string) ?? '',
    clinicState: (clinic?.state as string) ?? '',
    vertical: (clinic?.vertical as string) ?? 'vet',
    isPlatformOwner,
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
