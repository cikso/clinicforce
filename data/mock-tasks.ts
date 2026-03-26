import type { FollowUpTask } from '@/lib/types'
import { mockPatients } from './mock-patients'

const today = new Date()

export const mockTasks: FollowUpTask[] = [
  // POST_CALL column
  {
    id: 't1',
    patient: mockPatients[1], // Luna
    patientSpecies: 'Canine',
    dueDate: today.toISOString(),
    dueTime: '2:00 PM',
    task: 'Check post-op respiratory rate after TPLO surgery. Confirm owner has medication schedule.',
    assignedTo: 'Dr. Walsh',
    assignedAvatars: ['NurseJane', 'DrWalsh'],
    completed: false,
    column: 'POST_CALL',
    priority: 'HIGH',
    caseId: 'CASE-8821',
    label: 'Urgent Recovery',
  },
  {
    id: 't2',
    patient: mockPatients[7], // Oscar
    patientSpecies: 'Feline',
    dueDate: today.toISOString(),
    dueTime: '4:30 PM',
    task: 'Owner called regarding mild lethargy post-vaccination. Reassure and monitor appetite over next 24h.',
    assignedTo: 'Dr. Patel',
    assignedAvatars: ['NurseSarah'],
    completed: false,
    column: 'POST_CALL',
    priority: 'ROUTINE',
    caseId: 'CASE-8845',
    label: 'Routine',
  },
  {
    id: 't3',
    patient: mockPatients[5], // Pepper
    patientSpecies: 'Avian',
    dueDate: today.toISOString(),
    dueTime: '12:00 PM',
    task: 'Follow up with owner on Pepper\'s status post-collapse. Confirm arrival at clinic or transport status.',
    assignedTo: 'Dr. Patel',
    assignedAvatars: ['DrPatel'],
    completed: false,
    column: 'POST_CALL',
    priority: 'CRITICAL',
    caseId: 'CASE-8901',
    label: 'Critical Recovery',
  },
  // TRIAGE_REVIEW column
  {
    id: 't4',
    patient: mockPatients[2], // Archie (as Max equivalent)
    patientSpecies: 'Canine',
    dueDate: today.toISOString(),
    dueTime: 'ASAP',
    task: 'Review incoming imaging results for right rear limb. Confirm referral decision with attending vet.',
    assignedTo: 'Dr. Walsh',
    assignedAvatars: ['DrWalsh'],
    completed: false,
    column: 'TRIAGE_REVIEW',
    priority: 'CRITICAL',
    caseId: 'CASE-8901',
    label: 'High Priority',
  },
  {
    id: 't5',
    patient: mockPatients[4], // Milo
    patientSpecies: 'Canine',
    dueDate: today.toISOString(),
    dueTime: '1:00 PM',
    task: 'Review owner-submitted respiratory video. Escalate if SpO2 not yet recorded — brachycephalic protocol.',
    assignedTo: 'Dr. Patel',
    assignedAvatars: ['DrPatel'],
    completed: false,
    column: 'TRIAGE_REVIEW',
    priority: 'HIGH',
    caseId: 'CASE-8892',
    label: 'Critical Review',
  },
  // OWNER_CHECKIN column
  {
    id: 't6',
    patient: mockPatients[0], // Baxter (as Cooper equivalent)
    patientSpecies: 'Canine',
    dueDate: today.toISOString(),
    dueTime: '3:15 PM',
    task: 'Update owner on toxicology assessment findings. Confirm next steps and monitoring instructions.',
    assignedTo: 'Dr. Patel',
    assignedAvatars: ['DrPatel'],
    completed: false,
    column: 'OWNER_CHECKIN',
    priority: 'HIGH',
    caseId: 'CASE-8856',
    label: 'Daily Update',
  },
  {
    id: 't7',
    patient: mockPatients[8], // Bella
    patientSpecies: 'Canine',
    dueDate: today.toISOString(),
    dueTime: '5:00 PM',
    task: 'Check in with owner regarding incision site redness flagged in media review. Advise on wound care.',
    assignedTo: 'Dr. Walsh',
    assignedAvatars: ['DrWalsh', 'NurseSarah'],
    completed: false,
    column: 'OWNER_CHECKIN',
    priority: 'ROUTINE',
    caseId: 'CASE-8877',
    label: 'Wound Check-In',
  },
  {
    id: 't8',
    patient: mockPatients[3], // Cleo
    patientSpecies: 'Feline',
    dueDate: today.toISOString(),
    dueTime: '6:00 PM',
    task: 'Call owner ahead of tomorrow\'s appointment. Confirm Cleo\'s eating status and current behaviour.',
    assignedTo: 'Dr. Walsh',
    assignedAvatars: ['NurseJane'],
    completed: false,
    column: 'OWNER_CHECKIN',
    priority: 'ROUTINE',
    caseId: 'CASE-8863',
    label: 'Pre-Appointment',
  },
]
