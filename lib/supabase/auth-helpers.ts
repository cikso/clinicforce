import { createClient } from './server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isMultiClinicRole } from './clinic-scope'

export interface ClinicProfile {
  userId: string
  userName: string
  userRole: string
  clinicId: string
  clinicName: string
  clinicPhone: string
  vertical: string
  isPlatformOwner: boolean
  /** True for platform_owner OR clinic_owner — users whose default UX is multi-clinic. */
  isMultiClinic: boolean
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
  const isMultiClinic = isMultiClinicRole(role)

  // Multi-clinic users (platform_owner / clinic_owner) drive the active clinic via the
  // cf_active_clinic cookie when drilled into a single clinic. Without a cookie they
  // operate on the portfolio (no single active clinic), and clinicId is left empty.
  // IMPORTANT: clear the default-from-join clinic first, otherwise we silently fall
  // back to "first clinic" and portfolio mode never actually engages.
  if (isMultiClinic) {
    clinic = null
    const cookieStore = await cookies()
    const cookieClinicId = cookieStore.get('cf_active_clinic')?.value

    if (cookieClinicId) {
      const { data: picked } = await queryClient
        .from('clinics')
        .select('id, name, phone, vertical')
        .eq('id', cookieClinicId)
        .maybeSingle()
      if (picked) {
        // For clinic_owner, only honour the cookie if they actually own that clinic.
        if (role === 'clinic_owner') {
          const { data: ownership } = await queryClient
            .from('clinic_users')
            .select('id')
            .eq('user_id', user.id)
            .eq('clinic_id', cookieClinicId)
            .eq('role', 'clinic_owner')
            .maybeSingle()
          if (ownership) clinic = picked as Record<string, unknown>
        } else {
          clinic = picked as Record<string, unknown>
        }
      }
    }
  }

  return {
    userId: user.id,
    userName: isPlatformOwner
      ? 'ClinicForce'
      : ((data.name as string) ?? user.email ?? 'Staff'),
    userRole: role,
    clinicId: (clinic?.id as string) ?? '',
    clinicName: (clinic?.name as string) ?? '',
    clinicPhone: (clinic?.phone as string) ?? '',
    vertical: (clinic?.vertical as string) ?? 'vet',
    isPlatformOwner,
    isMultiClinic,
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
