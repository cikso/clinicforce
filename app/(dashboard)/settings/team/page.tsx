import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import TeamClient from './TeamClient'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')
  // clinic_owner manages team per-clinic from /admin, not via /settings.
  // platform_owner can land here when drilled into a clinic.
  if (profile.userRole === 'clinic_owner') redirect('/admin')
  if (!['clinic_admin', 'platform_owner'].includes(profile.userRole)) redirect('/settings')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const [membersRes, invitesRes] = await Promise.all([
    service
      .from('clinic_users')
      .select('id, user_id, name, role')
      .eq('clinic_id', profile.clinicId)
      .order('created_at', { ascending: true }),
    service
      .from('clinic_invites')
      .select('id, email, role, created_at, expires_at, accepted_at')
      .eq('clinic_id', profile.clinicId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false }),
  ])

  const members = (membersRes.data ?? []) as Array<{
    id: string
    user_id: string
    name: string | null
    role: string
  }>

  const pendingInvites = (invitesRes.data ?? []).filter((inv: { expires_at: string | null }) => {
    if (!inv.expires_at) return true
    return new Date(inv.expires_at) > new Date()
  }) as Array<{
    id: string
    email: string
    role: string
    created_at: string
    expires_at: string | null
  }>

  return (
    <TeamClient
      members={members}
      pendingInvites={pendingInvites}
      currentUserId={profile.userId}
    />
  )
}
