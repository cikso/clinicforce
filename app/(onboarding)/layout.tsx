import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'ClinicForce — Setup',
}

// Auth-only guard for all /onboarding/* routes.
// Role checks (clinic_admin vs platform_owner) are enforced per-page.
// Wizard steps are wrapped in OnboardingShell by their own (wizard)/layout.tsx.
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <>{children}</>
}
