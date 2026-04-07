import Sidebar from '@/components/layout/Sidebar'
import ChatWidget from '@/components/chat/ChatWidget'
import { VerticalProvider } from '@/context/VerticalContext'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface UserProfile {
  userName:   string
  userRole:   string
  clinicName: string
  vertical:   string
}

async function getLayoutProfile(): Promise<UserProfile> {
  const fallback: UserProfile = {
    userName:   'Staff',
    userRole:   'receptionist',
    clinicName: '',
    vertical:   'vet',
  }

  try {
    // Step 1: get the authenticated user from the session cookie
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return fallback

    // Step 2: always use service role so RLS never blocks us
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return fallback

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: cu, error } = await service
      .from('clinic_users')
      .select('name, role, clinics(id, name, vertical)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (error || !cu) return fallback

    const role      = (cu.role as string) ?? 'receptionist'
    const name      = (cu.name as string) ?? user.email ?? 'Staff'
    const clinic    = Array.isArray(cu.clinics) ? cu.clinics[0] : (cu.clinics as Record<string, unknown> | null)
    const clinicName = role === 'platform_owner' ? '' : ((clinic?.name as string) ?? '')
    const vertical  = (clinic?.vertical as string) ?? 'vet'
    const userName  = role === 'platform_owner' ? 'ClinicForce' : name

    return { userName, userRole: role, clinicName, vertical }
  } catch {
    return fallback
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getLayoutProfile()

  return (
    <VerticalProvider vertical={profile.vertical}>
      <div className="h-screen flex overflow-hidden bg-[#f4f6f9]">
        <Sidebar
          clinicName={profile.clinicName}
          userName={profile.userName}
          userRole={profile.userRole}
        />
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {children}
        </div>
        <ChatWidget />
      </div>
    </VerticalProvider>
  )
}
