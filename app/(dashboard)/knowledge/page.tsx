import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export default function KnowledgePage() {
  return (
    <Card>
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
            <path d="M6 38c4-2.5 9.5-2.5 13.5 0V10.5c-4-2.5-9.5-2.5-13.5 0V38z" />
            <path d="M42 38c-4-2.5-9.5-2.5-13.5 0V10.5c4-2.5 9.5-2.5 13.5 0V38z" />
          </svg>
        }
        title="Knowledge Base"
        description="This page is being built. Coming soon."
      />
    </Card>
  )
}
