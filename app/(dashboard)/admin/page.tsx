import { createClient } from '@supabase/supabase-js'
import AdminDashboardClient, { type AdminClinic } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Fetch clinics, user counts, and subscriptions in parallel
  const [{ data: rawClinics }, { data: users }, { data: subscriptions }] = await Promise.all([
    service
      .from('clinics')
      .select('id, name, slug, phone, vertical, onboarding_completed, created_at, suburb')
      .order('created_at', { ascending: false }),
    service
      .from('clinic_users')
      .select('id, clinic_id'),
    service
      .from('subscriptions')
      .select('clinic_id, plan, status, trial_ends_at'),
  ])

  // Count users per clinic
  const userCountMap: Record<string, number> = {}
  users?.forEach((u) => {
    userCountMap[u.clinic_id] = (userCountMap[u.clinic_id] ?? 0) + 1
  })

  // Subscription map
  const subMap: Record<string, { plan: string | null; status: string | null; trial_ends_at: string | null }> = {}
  subscriptions?.forEach((s) => {
    subMap[s.clinic_id] = { plan: s.plan, status: s.status, trial_ends_at: s.trial_ends_at }
  })

  // Build enriched clinic list
  const clinics: AdminClinic[] = (rawClinics ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    vertical: c.vertical,
    suburb: c.suburb,
    phone: c.phone,
    onboarding_completed: c.onboarding_completed,
    created_at: c.created_at,
    user_count: userCountMap[c.id] ?? 0,
    plan: subMap[c.id]?.plan ?? null,
    plan_status: subMap[c.id]?.status ?? null,
    trial_ends_at: subMap[c.id]?.trial_ends_at ?? null,
  }))

  const totalUsers = users?.length ?? 0

  return <AdminDashboardClient clinics={clinics} totalUsers={totalUsers} />
}
