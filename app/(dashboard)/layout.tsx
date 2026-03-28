import Sidebar from '@/components/layout/Sidebar'
import ChatWidget from '@/components/chat/ChatWidget'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getClinicProfile()

  // No clinic set up yet → back to login to complete signup
  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f6f8]">
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
  )
}
