import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

export const metadata: Metadata = { title: 'Settings — ClinicForce' }
export const dynamic = 'force-dynamic'

export default async function SettingsIndexPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')
  if (profile.isMultiClinic) redirect('/admin')
  redirect('/settings/team')
}
