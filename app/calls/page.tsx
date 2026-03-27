import PageShell from '@/components/layout/PageShell'
import PhaseTwoPlaceholder from '@/components/shared/PhaseTwoPlaceholder'
import { Phone } from 'lucide-react'

export default function CallsPage() {
  return (
    <PageShell title="After-Hours Calls" subtitle="AI-analyzed call transcripts">
      <PhaseTwoPlaceholder
        title="After-Hours Calls Module"
        description="Full call log, Sarah AI transcript review, urgency scoring, and call-to-case workflow. All call activity is surfaced on the main dashboard in Phase 1."
        icon={<Phone className="w-8 h-8" />}
      />
    </PageShell>
  )
}
