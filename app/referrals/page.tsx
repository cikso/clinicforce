import PageShell from '@/components/layout/PageShell'
import PhaseTwoPlaceholder from '@/components/shared/PhaseTwoPlaceholder'
import { ArrowRightLeft } from 'lucide-react'

export default function ReferralsPage() {
  return (
    <PageShell title="Referral Hub" subtitle="Emergency care coordination">
      <PhaseTwoPlaceholder
        title="Emergency Referral Hub"
        description="In-flight referral tracking, partner ER directory, one-click case dispatch, and real-time acknowledgement status. Coming in Phase 2."
        icon={<ArrowRightLeft className="w-8 h-8" />}
      />
    </PageShell>
  )
}
