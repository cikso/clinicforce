import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import ClinicProfileClient from './ClinicProfileClient'

export const metadata: Metadata = { title: 'Settings — ClinicForce' }
export const dynamic = 'force-dynamic'

export default async function ClinicProfilePage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')

  // Multi-clinic roles (platform_owner, clinic_owner) have no single clinic
  // attached — edit per-clinic profile via /admin. Only clinic_admin can
  // manage clinic profile; everyone else goes to Team.
  if (profile.isMultiClinic) redirect('/admin')
  if (profile.userRole !== 'clinic_admin') redirect('/settings/team')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: clinic } = await service
    .from('clinics')
    .select(`
      id, name, phone, email, address, suburb, website,
      vertical, subject_label, professional_title, timezone,
      business_hours, industry_config
    `)
    .eq('id', profile.clinicId)
    .single()

  if (!clinic) redirect('/overview')

  return <ClinicProfileClient clinic={clinic} />
}
