import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export const metadata: Metadata = { title: 'Bookings — ClinicForce' }

export default function BookingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Bookings</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Two-way sync with your practice management system, plus SMS reminders.
        </p>
      </div>

      <Card>
        <EmptyState
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
          }
          title="Bookings is coming next"
          description="This is where Stella's captured appointment requests will land, ready for one-click confirmation into your practice management system. Live in Phase 2."
        />
      </Card>

      <Card header={{ title: "What's shipping here" }}>
        <ul className="space-y-2.5 text-[13px] text-[var(--text-secondary)] list-disc pl-5">
          <li>Real-time availability pulled from your PIMS (ezyVet first, Provet + others next).</li>
          <li>Staff-approved booking confirmation — Stella proposes, you confirm in one click.</li>
          <li>Automatic SMS reminders at T-24h and T-2h with one-tap reschedule.</li>
          <li>Post-visit surveys linked back to the original appointment.</li>
        </ul>
      </Card>
    </div>
  )
}
