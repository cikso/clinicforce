import PageShell from '@/components/layout/PageShell'
import BookingsClient from '@/components/bookings/BookingsClient'

export default function BookingsPage() {
  return (
    <PageShell title="Booking Requests" clinicName="Downtown Clinic">
      <BookingsClient />
    </PageShell>
  )
}
