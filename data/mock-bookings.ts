import type { Booking } from '@/lib/types'
import { mockPatients } from './mock-patients'

const now = new Date()
const today = new Date()
const todayAt = (h: number, m = 0) => {
  const d = new Date(today)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    patient: mockPatients[6], // Ruby
    appointmentType: 'Pre-Op Check',
    scheduledAt: todayAt(9, 0),
    status: 'CHECKED_IN',
    assignedVet: 'Dr. Patel',
    notes: 'Desexing surgery tomorrow. Pre-op bloods required.',
    isNewRequest: false,
  },
  {
    id: 'b2',
    patient: mockPatients[1], // Luna
    appointmentType: 'Annual Wellness',
    scheduledAt: todayAt(9, 30),
    status: 'CHECKED_IN',
    assignedVet: 'Dr. Walsh',
    notes: 'F3 booster due. Owner wants weight check.',
    isNewRequest: false,
  },
  {
    id: 'b3',
    patient: mockPatients[7], // Oscar
    appointmentType: 'Recheck',
    scheduledAt: todayAt(10, 0),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Patel',
    notes: '7-day post-urinary blockage recheck. Ultrasound booked.',
    isNewRequest: false,
  },
  {
    id: 'b4',
    patient: mockPatients[3], // Cleo
    appointmentType: 'Urgent Care',
    scheduledAt: todayAt(10, 30),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Walsh',
    notes: 'Not eating x2 days. Hiding behaviour. Owner called last night.',
    isNewRequest: false,
  },
  {
    id: 'b5',
    patient: mockPatients[9], // Ziggy
    appointmentType: 'Exotic Consult',
    scheduledAt: todayAt(11, 0),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Patel',
    notes: 'Lethargy and anorexia. UVB and husbandry review.',
    isNewRequest: false,
  },
  {
    id: 'b6',
    patient: mockPatients[2], // Archie
    appointmentType: 'Orthopaedic Assessment',
    scheduledAt: todayAt(11, 30),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Walsh',
    notes: 'Non-weight-bearing right rear. Imaging referral pending consent.',
    isNewRequest: false,
  },
  {
    id: 'b7',
    patient: mockPatients[8], // Bella
    appointmentType: 'Post-Surgical Review',
    scheduledAt: todayAt(14, 0),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Patel',
    notes: 'Week 1 wound check post splenectomy. Owner noted redness.',
    isNewRequest: false,
  },
  {
    id: 'b8',
    patient: mockPatients[0], // Baxter
    appointmentType: 'Emergency',
    scheduledAt: todayAt(8, 45),
    status: 'CHECKED_IN',
    assignedVet: 'Dr. Patel',
    notes: 'Suspected toxin ingestion. Walk-in — added to schedule on arrival.',
    isNewRequest: false,
  },
  // New requests pending approval
  {
    id: 'b9',
    patient: mockPatients[1], // Luna (new request)
    appointmentType: 'Emergency Triage',
    scheduledAt: todayAt(14, 30),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Walsh',
    notes: 'Sudden lethargy and laboured breathing.',
    isNewRequest: true,
    triageReason: 'Sudden lethargy and refusal to eat for 24 hours. Slightly laboured breathing noted by owner.',
    submittedAt: minsAgo(12),
  },
  {
    id: 'b10',
    patient: mockPatients[4], // Milo (new request)
    appointmentType: 'Annual Wellness',
    scheduledAt: todayAt(15, 0),
    status: 'CONFIRMED',
    assignedVet: 'Dr. Patel',
    notes: 'Annual checkup and DHPP booster. Owner wants flea prevention discussion.',
    isNewRequest: true,
    triageReason: 'Annual wellness checkup and DHPP booster. Owner also wants to discuss flea and tick prevention options.',
    submittedAt: minsAgo(35),
  },
]
