import type { Call } from '@/lib/types'
import { mockPatients } from './mock-patients'

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()

export const mockCalls: Call[] = [
  {
    id: 'c1',
    patient: mockPatients[5], // Pepper — African Grey
    callerName: 'David Chen',
    callerPhone: '+61 4 6789 0123',
    timestamp: minsAgo(2),
    durationSeconds: 187,
    status: 'ESCALATED',
    urgencyLevel: 'CRITICAL',
    urgencyFlag: true,
    aiSummary: 'Owner reports sudden collapse and wing-drooping in African Grey Parrot. No known trauma. Bird last ate this morning. Owner is en route.',
    transcript: '"...Pepper just fell off her perch and she\'s breathing really fast with her mouth open. She can\'t stand up. We\'re getting in the car now..."',
    recordingUrl: null,
  },
  {
    id: 'c2',
    patient: mockPatients[7], // Oscar — Maine Coon
    callerName: 'Liam Park',
    callerPhone: '+61 4 8901 2345',
    timestamp: minsAgo(15),
    durationSeconds: 142,
    status: 'UNREVIEWED',
    urgencyLevel: 'URGENT',
    urgencyFlag: true,
    aiSummary: 'Owner reports Oscar has not urinated since this afternoon. Straining to use litter box and vocalising. History of urinary blockage.',
    transcript: '"...Oscar keeps going to the litter box every few minutes and crying. He had a blockage six months ago, I\'m really worried it\'s happening again..."',
    recordingUrl: null,
  },
  {
    id: 'c3',
    patient: mockPatients[8], // Bella — Cavalier
    callerName: 'Sophie Turner',
    callerPhone: '+61 4 9012 3456',
    timestamp: minsAgo(42),
    durationSeconds: 98,
    status: 'REVIEWED',
    urgencyLevel: 'GENERAL',
    urgencyFlag: false,
    aiSummary: 'Owner requesting guidance on post-surgical wound care following splenectomy last week. Mild redness noted around incision. No swelling or discharge.',
    transcript: '"...hi, Bella had surgery last week and I noticed the scar looks a bit pink around the edges. It\'s not oozing or anything but I just wanted to check if that\'s normal..."',
    recordingUrl: null,
  },
  {
    id: 'c4',
    patient: mockPatients[3], // Cleo — Ragdoll
    callerName: 'Tom Nguyen',
    callerPhone: '+61 4 4567 8901',
    timestamp: hoursAgo(3),
    durationSeconds: 210,
    status: 'REVIEWED',
    urgencyLevel: 'GENERAL',
    urgencyFlag: false,
    aiSummary: 'Owner concerned Cleo not eating for 2 days and hiding. Indoor only. No vomiting reported. Booking made for tomorrow 9am.',
    transcript: '"...she hasn\'t touched her food since Tuesday and she\'s been hiding under the bed which she never does. She doesn\'t look sick but something\'s off..."',
    recordingUrl: null,
  },
  {
    id: 'c5',
    patient: mockPatients[7], // Oscar
    callerName: 'Liam Park',
    callerPhone: '+61 4 8901 2345',
    timestamp: hoursAgo(5),
    durationSeconds: 98,
    status: 'RESOLVED',
    urgencyLevel: 'GENERAL',
    urgencyFlag: false,
    aiSummary: 'Follow-up call post-discharge. Owner reports Oscar urinating normally. No concerns. Next recheck confirmed for today.',
    transcript: '"...just calling to let you know Oscar seems much better, he\'s been to the litter box a few times today no problem, eating well too..."',
    recordingUrl: null,
  },
]
