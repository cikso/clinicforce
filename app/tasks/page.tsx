import PageShell from '@/components/layout/PageShell'
import TasksClient from '@/components/tasks/TasksClient'

export default function TasksPage() {
  return (
    <PageShell
      title="Clinical Follow-Ups"
      subtitle="Post-call tasks, triage reviews, and owner check-ins"
      clinicName="Northside Clinic"
    >
      <TasksClient />
    </PageShell>
  )
}
