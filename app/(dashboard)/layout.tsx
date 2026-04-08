import Sidebar from '@/components/layout/Sidebar'
import ChatWidget from '@/components/chat/ChatWidget'
import { VerticalProvider } from '@/context/VerticalContext'
import { ClinicProvider, type ClinicOption } from '@/context/ClinicContext'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getSubscription } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getClinicProfile()

  const userName   = profile?.userName   ?? 'Staff'
  const userRole   = profile?.userRole   ?? 'receptionist'
  const clinicName = profile?.clinicName ?? ''
  const vertical   = profile?.vertical   ?? 'vet'
  const clinicId   = profile?.clinicId   ?? ''
  const isPlatformOwner = profile?.isPlatformOwner ?? false

  // Platform owner: load all clinics for the switcher dropdown
  let allClinics: ClinicOption[] = []
  if (isPlatformOwner) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const service = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      const { data } = await service
        .from('clinics')
        .select('id, name, vertical')
        .not('slug', 'eq', 'clinicforce-platform')
        .order('name')
      allClinics = (data ?? []) as ClinicOption[]
    }
  }
  // Regular users: single-clinic array
  if (!isPlatformOwner && clinicId) {
    allClinics = [{ id: clinicId, name: clinicName, vertical }]
  }

  // Fetch subscription to show trial banner
  let trialDaysRemaining: number | undefined
  if (clinicId) {
    const subscription = await getSubscription(clinicId)
    if (subscription?.status === 'trialing' && subscription.trial_ends_at) {
      const msRemaining = new Date(subscription.trial_ends_at).getTime() - Date.now()
      trialDaysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
    }
  }

  return (
    <VerticalProvider vertical={vertical}>
      <ClinicProvider
        clinics={allClinics}
        activeClinicId={clinicId}
        activeClinicName={clinicName}
        isPlatformOwner={isPlatformOwner}
      >
        <div className="h-screen flex overflow-hidden bg-slate-50">
          <Sidebar
            clinicName={clinicName}
            userName={userName}
            userRole={userRole}
            trialDaysRemaining={trialDaysRemaining}
          />
          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
            {children}
          </div>
          <ChatWidget />
        </div>
      </ClinicProvider>
    </VerticalProvider>
  )
}
