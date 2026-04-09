import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export default function ActionsPage() {
  return (
    <Card>
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
            <path d="M16 12h24M16 24h24M16 36h24" />
            <circle cx="10" cy="12" r="2" fill="currentColor" stroke="none" />
            <circle cx="10" cy="24" r="2" fill="currentColor" stroke="none" />
            <circle cx="10" cy="36" r="2" fill="currentColor" stroke="none" />
          </svg>
        }
        title="Action Queue"
        description="This page is being built. Coming soon."
      />
    </Card>
  )
}
