import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Platform Admin — ClinicForce',
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Step 1: authenticated user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Step 2: check role via service client (bypasses RLS reliably)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) redirect('/overview')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: cu } = await service
    .from('clinic_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  // platform_owner ONLY — clinic_admin and staff are redirected
  if (!cu || cu.role !== 'platform_owner') redirect('/overview')

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        {children}
      </div>
    </>
  )
}
