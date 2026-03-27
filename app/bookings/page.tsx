import PageShell from '@/components/layout/PageShell'
import PhaseTwoPlaceholder from '@/components/shared/PhaseTwoPlaceholder'
import { Calendar } from 'lucide-react'

export default function BookingsPage() {
  return (
    <PageShell title="Bookings" subtitle="Appointment management">
      <PhaseTwoPlaceholder
        title="Booking Requests"
        description="Full appointment scheduling, triage-priority approval flows, slot availability calendar, and owner notification system. Coming in Phase 2."
        icon={<Calendar className="w-8 h-8" />}
      />
    </PageShell>
  )
}
