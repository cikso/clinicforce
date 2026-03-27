import PageShell from '@/components/layout/PageShell'
import PhaseTwoPlaceholder from '@/components/shared/PhaseTwoPlaceholder'
import { Image } from 'lucide-react'

export default function MediaReviewPage() {
  return (
    <PageShell title="Media Review" subtitle="Patient imaging and owner-submitted assets">
      <PhaseTwoPlaceholder
        title="Media Review"
        description="AI-assisted review of owner-submitted photos, video clips, and imaging. Flagging, annotation, and follow-up workflow coming in Phase 2."
        icon={<Image className="w-8 h-8" />}
      />
    </PageShell>
  )
}
