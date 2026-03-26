// Recent activity feed — operational events, no diagnosis implied

export interface ActivityEvent {
  id: string
  timestamp: string
  actor: string      // staff member or "System"
  action: string     // short operational description
  patientName?: string
  patientId?: string
  tag?: 'urgent' | 'info' | 'resolved'
}

const now = new Date()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()

export const mockActivity: ActivityEvent[] = [
  {
    id: 'ev1',
    timestamp: minsAgo(3),
    actor: 'System',
    action: 'Urgent alert raised — respiratory distress, no vet assigned',
    patientName: 'Milo',
    patientId: 'p5',
    tag: 'urgent',
  },
  {
    id: 'ev2',
    timestamp: minsAgo(8),
    actor: 'Dr. Patel',
    action: 'Assigned to Exam 1 — toxin ingestion case',
    patientName: 'Baxter',
    patientId: 'p1',
    tag: 'urgent',
  },
  {
    id: 'ev3',
    timestamp: minsAgo(15),
    actor: 'Nurse Kim',
    action: 'Triage completed — queued for orthopaedic assessment',
    patientName: 'Archie',
    patientId: 'p3',
    tag: 'info',
  },
  {
    id: 'ev4',
    timestamp: minsAgo(22),
    actor: 'System',
    action: 'After-hours call escalated — avian emergency flagged',
    patientName: 'Pepper',
    patientId: 'p6',
    tag: 'urgent',
  },
  {
    id: 'ev5',
    timestamp: minsAgo(35),
    actor: 'Dr. Walsh',
    action: 'Recheck completed — discharged with follow-up instructions',
    patientName: 'Oscar',
    patientId: 'p8',
    tag: 'resolved',
  },
  {
    id: 'ev6',
    timestamp: minsAgo(48),
    actor: 'Reception',
    action: 'Booking confirmed for urgent care consult',
    patientName: 'Cleo',
    patientId: 'p4',
    tag: 'info',
  },
  {
    id: 'ev7',
    timestamp: minsAgo(61),
    actor: 'Nurse Kim',
    action: 'Pre-op vitals recorded and chart updated',
    patientName: 'Ruby',
    patientId: 'p7',
    tag: 'info',
  },
]
