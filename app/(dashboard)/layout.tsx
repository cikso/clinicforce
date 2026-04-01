import Sidebar from '@/components/layout/Sidebar'
import ChatWidget from '@/components/chat/ChatWidget'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Sidebar clinicName="Baulkham Hills Clinic" userName="Tommy" userRole="admin" />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {children}
      </div>
      <ChatWidget />
    </div>
  )
}
