import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import NotificationsClient from './NotificationsClient'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')
  if (profile.userRole !== 'platform_owner') redirect('/settings/team')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Try to fetch notification_settings, but handle table not existing gracefully
  let settings: Record<string, unknown> | null = null
  try {
    const { data } = await service
      .from('notification_settings')
      .select('*')
      .eq('clinic_id', profile.clinicId)
      .maybeSingle()
    settings = data as Record<string, unknown> | null
  } catch {
    // Table may not exist yet
  }

  return <NotificationsClient settings={settings} />
}
