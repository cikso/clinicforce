import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export const metadata: Metadata = { title: 'Knowledge Base — ClinicForce' }

export default function KnowledgePage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Knowledge Base</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          The FAQ Stella uses to answer routine caller questions.
        </p>
      </div>

      <Card>
        <EmptyState
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V5a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
            </svg>
          }
          title="Knowledge editor coming soon"
          description="For the trial, Stella uses the services, hours and emergency partner details from your clinic profile. Custom FAQ editing ships in Phase 2."
        />
      </Card>
    </div>
  )
}
