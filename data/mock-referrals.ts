import type { Referral, PartnerClinic } from '@/lib/types'
import { mockPatients } from './mock-patients'

const now = new Date()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()

export const mockReferrals: Referral[] = [
  {
    id: 'ref1',
    patient: mockPatients[1], // Luna
    referredTo: 'North Star ER',
    reason: 'Respiratory distress — priority transfer for specialist assessment',
    sentAt: minsAgo(4),
    status: 'ARRIVED',
    progressStep: 3,
    etaMinutes: 0,
    clinicPhone: '(555) 012-3456',
    clinicDistance: '4.2 miles',
    clinicWaitMinutes: 15,
    urgencyLevel: 'STAT',
  },
  {
    id: 'ref2',
    patient: mockPatients[2], // Archie
    referredTo: 'BluePearl Specialist',
    reason: 'Orthopaedic imaging and specialist review for right rear limb',
    sentAt: minsAgo(22),
    status: 'CASE_SENT',
    progressStep: 1,
    etaMinutes: 45,
    clinicPhone: '(555) 987-6543',
    clinicDistance: '8.9 miles',
    clinicWaitMinutes: 45,
    urgencyLevel: 'URGENT',
  },
]

export const mockPartnerClinics: PartnerClinic[] = [
  {
    id: 'pc1',
    name: 'North Star ER',
    phone: '(555) 012-3456',
    distanceMiles: 4.2,
    driveMinutes: 10,
    waitMinutes: 15,
    isOpen: true,
    isAtCapacity: false,
  },
  {
    id: 'pc2',
    name: 'BluePearl Specialist',
    phone: '(555) 987-6543',
    distanceMiles: 8.9,
    driveMinutes: 18,
    waitMinutes: 45,
    isOpen: true,
    isAtCapacity: false,
  },
  {
    id: 'pc3',
    name: 'VCA Central',
    phone: '(555) 444-5555',
    distanceMiles: 12.0,
    driveMinutes: 25,
    waitMinutes: null,
    isOpen: true,
    isAtCapacity: true,
  },
]
