import Sidebar from '@/components/layout/Sidebar'
import ChatWidget from '@/components/chat/ChatWidget'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Fetch real clinic + user — falls back gracefully if not yet set up
  const profile = await getClinicProfile()

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f6f8]">
      <Sidebar
        clinicName={profile?.clinicName ?? 'Your Clinic'}
        userName={profile?.userName ?? 'Staff'}
        userRole={profile?.userRole ?? 'receptionist'}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {children}
      </div>
      <ChatWidget />
    </div>
  )
}
