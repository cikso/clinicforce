import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import OnboardingShell from './onboarding-shell'

export const metadata: Metadata = {
  title: 'ClinicForce — Setup',
}

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Use service role to bypass RLS for role lookup
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: cu } = await service
      .from('clinic_users')
      .select('role')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    // Platform owner never does onboarding
    if (cu?.role === 'platform_owner') {
      redirect('/overview')
    }
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <OnboardingShell>{children}</OnboardingShell>
    </>
  )
}
