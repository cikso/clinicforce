import PageShell from '@/components/layout/PageShell'
import PhaseTwoPlaceholder from '@/components/shared/PhaseTwoPlaceholder'
import { CheckSquare } from 'lucide-react'

export default function TasksPage() {
  return (
    <PageShell title="Tasks" subtitle="Clinical follow-ups and owner check-ins">
      <PhaseTwoPlaceholder
        title="Clinical Follow-Up Tasks"
        description="Post-call kanban board for recovery check-ins, triage reviews, and owner communication. Full task management coming in Phase 2."
        icon={<CheckSquare className="w-8 h-8" />}
      />
    </PageShell>
  )
}
