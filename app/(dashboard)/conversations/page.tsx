import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export default function ConversationsPage() {
  return (
    <Card>
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
            <path d="M42 32c0 1.1-.4 2.1-1.2 2.8A4 4 0 0 1 38 36H14l-8 8V12a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v20z" />
          </svg>
        }
        title="Conversations"
        description="This page is being built. Coming soon."
      />
    </Card>
  )
}
