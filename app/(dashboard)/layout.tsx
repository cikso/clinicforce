import { redirect } from 'next/navigation'
import { VerticalProvider } from '@/context/VerticalContext'
import { ClinicProvider, type ClinicOption, type IndustryConfig } from '@/context/ClinicContext'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getSubscription } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar'
import DashboardTopbar from '@/app/components/dashboard/DashboardTopbar'
import { ToastProvider } from '@/app/components/ui/Toast'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defence-in-depth: proxy.ts is the primary gate, this is the fallback
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getClinicProfile()

  const userName   = profile?.userName   ?? 'Staff'
  const _userRole  = profile?.userRole   ?? 'receptionist'
  const clinicName = profile?.clinicName ?? ''
  const vertical   = profile?.vertical   ?? 'vet'
  const clinicId   = profile?.clinicId   ?? ''
  const isPlatformOwner = profile?.isPlatformOwner ?? false

  // Platform owner: load all clinics for the switcher dropdown
  let allClinics: ClinicOption[] = []
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const service = serviceKey
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
    : null

  if (isPlatformOwner && service) {
    const { data } = await service
      .from('clinics')
      .select('id, name, vertical')
      .not('slug', 'eq', 'clinicforce-platform')
      .order('name')
    allClinics = (data ?? []) as ClinicOption[]
  }

  // Regular users: single-clinic array
  if (!isPlatformOwner && clinicId) {
    allClinics = [{ id: clinicId, name: clinicName, vertical }]
  }

  // Fetch subscription to show trial banner
  let _trialDaysRemaining: number | undefined
  if (clinicId) {
    const subscription = await getSubscription(clinicId)
    if (subscription?.status === 'trialing' && subscription.trial_ends_at) {
      const msRemaining = new Date(subscription.trial_ends_at).getTime() - Date.now()
      _trialDaysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
    }

    // ── Subscription status gate ─────────────────────────────────────
    // 'active', 'trialing' (with future trial_ends_at), and 'paused' pass through.
    if (
      !subscription ||
      subscription.status === 'cancelled' ||
      subscription.status === 'past_due'
    ) {
      redirect('/login?reason=subscription_inactive')
    }
    if (
      subscription.status === 'trialing' &&
      subscription.trial_ends_at &&
      new Date(subscription.trial_ends_at) < new Date()
    ) {
      redirect('/login?reason=trial_expired')
    }
  }

  // Fetch industry_config from clinics table
  let industryConfig: IndustryConfig = null
  if (clinicId && service) {
    const { data: clinicRow } = await service
      .from('clinics')
      .select('industry_config')
      .eq('id', clinicId)
      .maybeSingle()
    industryConfig = (clinicRow?.industry_config as IndustryConfig) ?? null
  }

  // Fetch pending task count for action queue badge + open survey actions
  let pendingTaskCount = 0
  let openSurveyActionCount = 0
  if (clinicId) {
    const supabase = await createClient()
    const [taskResult, surveyActionResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'PENDING'),
      service
        ? service
            .from('survey_actions')
            .select('id', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)
            .eq('status', 'open')
        : Promise.resolve({ count: 0 }),
    ])
    pendingTaskCount = taskResult.count ?? 0
    openSurveyActionCount = surveyActionResult.count ?? 0
  }

  return (
    <VerticalProvider vertical={vertical}>
      <ClinicProvider
        clinics={allClinics}
        activeClinicId={clinicId}
        activeClinicName={clinicName}
        isPlatformOwner={isPlatformOwner}
        industryConfig={industryConfig}
      >
        <ToastProvider>
          <div className="h-screen flex overflow-hidden bg-[var(--bg-secondary)]">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-white focus:text-[var(--brand)] focus:rounded-md focus:shadow-lg">
              Skip to content
            </a>
            <DashboardSidebar
              clinicName={clinicName}
              userName={userName}
              pendingTaskCount={pendingTaskCount}
              openSurveyActionCount={openSurveyActionCount}
              isPlatformOwner={isPlatformOwner}
            />
            <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
              <DashboardTopbar userName={userName} />
              <main id="main-content" className="flex-1 overflow-y-auto p-6 bg-[var(--bg-secondary)]">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </ClinicProvider>
    </VerticalProvider>
  )
}
