import PageShell from '@/components/layout/PageShell'
import CareQueueClient from '@/components/care-queue/CareQueueClient'

export default function CareQueuePage() {
  return (
    <PageShell title="Active Care Queue" subtitle="Real-time triage and patient management">
      <CareQueueClient />
    </PageShell>
  )
}
