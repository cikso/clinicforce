import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export const metadata: Metadata = { title: 'Referrals — ClinicForce' }

export default function ReferralsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Referrals</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Emergency and specialist handovers — tracked end to end.
        </p>
      </div>

      <Card>
        <EmptyState
          title="Referrals coming soon"
          description="Emergency handovers to your after-hours partner are captured in the Call Inbox today. A dedicated referrals workspace is planned for Phase 2."
        />
      </Card>
    </div>
  )
}
