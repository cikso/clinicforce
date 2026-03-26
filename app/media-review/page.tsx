import PageShell from '@/components/layout/PageShell'
import MediaClient from '@/components/media-review/MediaClient'

export default function MediaReviewPage() {
  return (
    <PageShell title="Media Review" searchPlaceholder="Search patients or tags...">
      <MediaClient />
    </PageShell>
  )
}
