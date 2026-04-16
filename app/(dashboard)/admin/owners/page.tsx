import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import OwnersClient, { type OwnerRow, type PendingOwnerInvite, type ClinicOption } from './OwnersClient'

export const dynamic = 'force-dynamic'

export default async function OwnersPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')

  // Provisioning is platform_owner only. clinic_owner can SEE the /admin
  // console (their scoped clinics) but cannot manage other owners.
  if (profile.userRole !== 'platform_owner') redirect('/admin')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Fetch all clinic_owner memberships, all clinics (for picker + names),
  // and all pending owner invites.
  const [ownerLinksRes, clinicsRes, invitesRes] = await Promise.all([
    service
      .from('clinic_users')
      .select('user_id, clinic_id, name, role, created_at')
      .eq('role', 'clinic_owner'),
    service
      .from('clinics')
      .select('id, name, slug, suburb')
      .neq('slug', 'clinicforce-platform')
      .order('name', { ascending: true }),
    service
      .from('clinic_invites')
      .select('id, email, clinic_id, extra_clinic_ids, invited_by, created_at, expires_at, accepted_at')
      .eq('role', 'clinic_owner')
      .is('accepted_at', null)
      .order('created_at', { ascending: false }),
  ])

  const allClinics: ClinicOption[] = (clinicsRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    suburb: c.suburb,
  }))
  const clinicById = new Map(allClinics.map((c) => [c.id, c]))

  // Group memberships by user_id
  type Slot = { name: string | null; clinicIds: string[]; createdAt: string }
  const byUser = new Map<string, Slot>()
  for (const link of ownerLinksRes.data ?? []) {
    const slot: Slot = byUser.get(link.user_id) ?? {
      name: link.name,
      clinicIds: [],
      createdAt: link.created_at,
    }
    slot.clinicIds.push(link.clinic_id)
    if (!slot.name && link.name) slot.name = link.name
    if (link.created_at < slot.createdAt) slot.createdAt = link.created_at
    byUser.set(link.user_id, slot)
  }

  // Resolve user emails via auth.admin.listUsers (paginated, but we expect small N)
  const { data: usersList } = await service.auth.admin.listUsers({ perPage: 200 })
  const emailById = new Map<string, string>()
  for (const u of usersList?.users ?? []) {
    if (u.email) emailById.set(u.id, u.email)
  }

  const owners: OwnerRow[] = Array.from(byUser.entries())
    .map(([userId, info]) => ({
      userId,
      email: emailById.get(userId) ?? '(unknown)',
      name: info.name,
      createdAt: info.createdAt,
      clinics: info.clinicIds
        .map((cid) => clinicById.get(cid))
        .filter((c): c is ClinicOption => Boolean(c)),
    }))
    .sort((a, b) => a.email.localeCompare(b.email))

  const now = new Date()
  const pendingInvites: PendingOwnerInvite[] = (invitesRes.data ?? [])
    .filter((inv) => !inv.expires_at || new Date(inv.expires_at) > now)
    .map((inv) => {
      const ids = [inv.clinic_id, ...((inv.extra_clinic_ids ?? []) as string[])]
      return {
        id: inv.id,
        email: inv.email,
        invitedBy: inv.invited_by,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
        clinics: ids.map((cid) => clinicById.get(cid)).filter((c): c is ClinicOption => Boolean(c)),
      }
    })

  return (
    <OwnersClient
      owners={owners}
      pendingInvites={pendingInvites}
      allClinics={allClinics}
    />
  )
}
