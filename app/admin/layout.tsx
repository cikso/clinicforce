import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from './_shell'

export const metadata: Metadata = {
  title: 'ClinicForce Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect: must be authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Must have a clinic_users row with clinic_admin role
  // (for super-admin access, this check can be loosened later)
  const { data: cu } = await supabase
    .from('clinic_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!cu || !['clinic_admin', 'platform_owner'].includes(cu.role)) redirect('/overview')

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <AdminShell>{children}</AdminShell>
    </>
  )
}
