import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { SetupStep } from '@/components/dashboard/GettingStartedPanel'

export const dynamic = 'force-dynamic'

async function getSetupStatus() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: cu } = await supabase
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()

    if (!cu?.clinic_id) return null

    const { data: clinic } = await supabase
      .from('clinics')
      .select(`
        id, name, onboarding_completed,
        phone, address,
        business_hours,
        after_hours_partner, after_hours_phone,
        voice_phone
      `)
      .eq('id', cu.clinic_id)
      .single()

    if (!clinic) return null

    // Count calls received so far
    const { count: callCount } = await supabase
      .from('call_inbox')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', cu.clinic_id)

    return { clinic, callCount: callCount ?? 0 }
  } catch {
    return null
  }
}

export default async function OverviewPage() {
  // Server-side onboarding gate using service role (bypasses RLS)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Use maybeSingle — never throws, returns null if no row found
    const { data: cu } = await service
      .from('clinic_users')
      .select('role, clinics(onboarding_completed)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    const role = cu?.role as string | undefined

    // Platform owner: skip everything, go straight to dashboard
    if (role === 'platform_owner') {
      return <DashboardClient gettingStarted={null} />
    }

    // Only redirect to onboarding if we have data confirming it's not done
    if (cu) {
      const clinic = Array.isArray(cu.clinics) ? cu.clinics[0] : cu.clinics
      const onboardingCompleted = (clinic as { onboarding_completed?: boolean } | null)?.onboarding_completed === true
      if (!onboardingCompleted) {
        redirect('/onboarding/clinic-details')
      }
    }
  }

  const setup = await getSetupStatus()

  let gettingStarted: { steps: SetupStep[]; clinicName: string } | null = null

  if (setup) {
    const { clinic, callCount } = setup
    const clinicName = clinic.name ?? 'Your Clinic'

    const steps: SetupStep[] = [
      {
        id:          'clinic-details',
        label:       'Clinic details confirmed',
        description: 'Add your clinic phone number and address so callers receive accurate information.',
        done:        !!(clinic.phone && clinic.address),
        href:        '/onboarding/clinic-details',
        cta:         'Add details',
      },
      {
        id:          'hours',
        label:       'Opening hours configured',
        description: 'Set your opening hours so your AI receptionist knows when your clinic is available.',
        done:        !!clinic.business_hours,
        href:        '/onboarding/hours',
        cta:         'Set hours',
      },
      {
        id:          'emergency',
        label:       'Emergency partner set up',
        description: 'Add your after-hours or emergency partner clinic for urgent call transfers.',
        done:        !!(clinic.after_hours_partner && clinic.after_hours_phone),
        href:        '/onboarding/call-handling',
        cta:         'Add partner',
      },
      {
        id:          'voice-phone',
        label:       'Voice number connected',
        description: 'Connect your Twilio number so the AI receptionist can handle live inbound calls.',
        done:        !!clinic.voice_phone,
        href:        '/admin',
        cta:         'Connect number',
      },
      {
        id:          'first-call',
        label:       'First call received',
        description: 'Make a test call to your clinic number to confirm everything is working end-to-end.',
        done:        callCount > 0,
        href:        '/calls',
        cta:         'View calls',
      },
    ]

    // Only show the panel if at least one step is incomplete
    if (!steps.every(s => s.done)) {
      gettingStarted = { steps, clinicName }
    }
  }

  return <DashboardClient gettingStarted={gettingStarted} />
}
