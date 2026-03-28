import PageShell from '@/components/layout/PageShell'
import PhaseTwoPlaceholder from '@/components/shared/PhaseTwoPlaceholder'
import { Activity } from 'lucide-react'

export default function CareQueuePage() {
  return (
    <PageShell title="Care Queue" subtitle="Real-time triage and patient management">
      <PhaseTwoPlaceholder
        title="Active Care Queue"
        description="Full triage queue with patient management, urgency sorting, clinician assignment, and live status tracking. Coming in Phase 2."
        icon={<Activity className="w-8 h-8" />}
      />
    </PageShell>
  )
}
