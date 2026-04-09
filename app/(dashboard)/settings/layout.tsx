import { redirect } from 'next/navigation'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import SettingsShell from './SettingsShell'

export const dynamic = 'force-dynamic'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')

  return (
    <SettingsShell userRole={profile.userRole}>
      {children}
    </SettingsShell>
  )
}
