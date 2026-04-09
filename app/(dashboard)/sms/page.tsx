import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export default function SmsPage() {
  return (
    <Card>
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
            <path d="M8 8h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H16l-9 9V12a4 4 0 0 1 4-4z" />
            <circle cx="18" cy="21" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="24" cy="21" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="30" cy="21" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        }
        title="SMS Hub"
        description="This page is being built. Coming soon."
      />
    </Card>
  )
}
