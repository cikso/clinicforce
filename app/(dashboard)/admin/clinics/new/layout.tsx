import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Only platform_owner (founder) can create new clinics on the platform.
// clinic_owner can manage their existing clinics from /admin but cannot
// provision new ones — those are allocated to them by the founder.
export default async function NewClinicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) redirect('/admin')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: roles } = await service
    .from('clinic_users')
    .select('role')
    .eq('user_id', user.id)

  const isPlatformOwner = (roles ?? []).some((r) => r.role === 'platform_owner')
  if (!isPlatformOwner) redirect('/admin')

  return <>{children}</>
}
