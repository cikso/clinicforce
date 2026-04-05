import { createClient } from './server'

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

  const { data, error } = await supabase
    .from('clinic_users')
    .select(`
      id, name, role,
      clinics ( id, name, phone, suburb, state, vertical )
    `)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  const clinic = Array.isArray(data.clinics) ? data.clinics[0] : (data.clinics as Record<string, unknown> | null)

  return {
    userId: user.id,
    userName: (data.name as string) ?? user.email ?? 'Staff',
    userRole: (data.role as string) ?? 'receptionist',
    clinicId: (clinic?.id as string) ?? '',
    clinicName: (clinic?.name as string) ?? 'Your Clinic',
    clinicPhone: (clinic?.phone as string) ?? '',
    clinicSuburb: (clinic?.suburb as string) ?? '',
    clinicState: (clinic?.state as string) ?? '',
    vertical: (clinic?.vertical as string) ?? 'vet',
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
