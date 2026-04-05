import Sidebar from '@/components/layout/Sidebar'
import ChatWidget from '@/components/chat/ChatWidget'
import { VerticalProvider } from '@/context/VerticalContext'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getClinicProfile()

  return (
    <VerticalProvider vertical={profile?.vertical ?? 'vet'}>
      <div className="h-screen flex overflow-hidden bg-slate-50">
        <Sidebar
          userName={profile?.userName ?? 'Staff'}
          userRole={profile?.userRole ?? 'receptionist'}
        />
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {children}
        </div>
        <ChatWidget />
      </div>
    </VerticalProvider>
  )
}
