import type { UrgentAlert } from '@/lib/types'
import { mockPatients } from './mock-patients'

const now = new Date()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()

export const mockAlerts: UrgentAlert[] = [
  {
    id: 'a1',
    patient: mockPatients[0], // Baxter
    message: 'Suspected toxin ingestion — requires immediate assessment. Owner has packaging on hand.',
    triageLevel: 'URGENT',
    createdAt: minsAgo(12),
    acknowledged: false,
  },
  {
    id: 'a2',
    patient: mockPatients[4], // Milo
    message: 'Respiratory distress in waiting room — no vet assigned yet. Priority escalation required.',
    triageLevel: 'URGENT',
    createdAt: minsAgo(8),
    acknowledged: false,
  },
  {
    id: 'a3',
    patient: mockPatients[5], // Pepper
    message: 'After-hours call flagged as urgent — owner reports sudden collapse and wing-drooping.',
    triageLevel: 'URGENT',
    createdAt: minsAgo(22),
    acknowledged: false,
  },
  {
    id: 'a4',
    patient: mockPatients[2], // Archie
    message: 'Referral to orthopedic specialist pending — awaiting owner consent for imaging.',
    triageLevel: 'HIGH',
    createdAt: minsAgo(40),
    acknowledged: true,
  },
]
