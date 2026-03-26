import PageShell from '@/components/layout/PageShell'
import CallsClient from '@/components/calls/CallsClient'

export default function CallsPage() {
  return (
    <PageShell title="After-Hours Calls" subtitle="AI-analyzed transcripts prioritized by urgency">
      <CallsClient />
    </PageShell>
  )
}
