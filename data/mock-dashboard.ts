// ─────────────────────────────────────────────────────────────
// VetDesk — Central Mock Dashboard Data
// ─────────────────────────────────────────────────────────────

export type CaseUrgency = 'CRITICAL' | 'URGENT' | 'ROUTINE'
export type CaseStatus = 'WAITING' | 'IN_REVIEW' | 'IN_TREATMENT' | 'AWAITING_OWNER' | 'ESCALATED'
export type IntakeSource = 'VOICE_AI' | 'WEB_CHAT' | 'PHONE' | 'FRONT_DESK' | 'REFERRAL'
export type CallStatus = 'NEW' | 'REVIEWED' | 'CASE_CREATED' | 'QUEUED' | 'CALLBACK_MARKED' | 'ESCALATED'
export type CallRisk = 'CRITICAL' | 'URGENT' | 'GENERAL'
export type ActivityType = 'case' | 'call' | 'assignment' | 'escalation' | 'system'

export interface DashboardCase {
  id: string
  caseRef: string
  patientName: string
  species: string
  breed: string
  age: string
  issue: string
  urgency: CaseUrgency
  waitMinutes: number
  aiSummary: string
  status: CaseStatus
  clinician: string | null
  clinicianAvatar: string | null
  source: IntakeSource
  riskFactor: string
  urgencyScore: number
  aiJustification: string
  ownerName: string
  ownerPhone: string
  ownerAddress: string
  ownerAvatar: string
  createdAt: string
}

export interface DashboardCall {
  id: string
  callerName: string
  callerPhone: string
  patientName: string
  species: string
  receivedMinsAgo: number
  transcript: string
  aiRiskLabel: CallRisk
  aiConfidence: number
  aiNextStep: string
  status: CallStatus
}

export interface Clinician {
  id: string
  name: string
  role: string
  available: boolean
  avatar: string
}

export interface ClinicCapacity {
  totalRooms: number
  occupiedRooms: number
  nextSlotTime: string
  cliniciansOnDuty: number
  cliniciansAvailable: number
}

export interface ActivityItem {
  id: string
  message: string
  timestamp: Date
  type: ActivityType
}

// ─── Cases ────────────────────────────────────────────────────

export const INITIAL_CASES: DashboardCase[] = [
  {
    id: 'case-1',
    caseRef: 'VD-9921',
    patientName: 'Luna',
    species: 'Feline',
    breed: 'Domestic Shorthair',
    age: '4y F/S',
    issue: 'Respiratory Distress',
    urgency: 'CRITICAL',
    waitMinutes: 4,
    aiSummary: 'Acute collapse with shallow breathing. Cardiovascular compromise likely.',
    status: 'WAITING',
    clinician: null,
    clinicianAvatar: null,
    source: 'VOICE_AI',
    riskFactor: 'GDV / Cardiovascular',
    urgencyScore: 9.2,
    aiJustification:
      'Acute onset collapse with shallow breathing and pale mucous membranes. Pattern consistent with cardiovascular compromise or internal trauma. Immediate intervention required — do not delay imaging.',
    ownerName: 'Sarah Jenkins',
    ownerPhone: '+1 (555) 012-4492',
    ownerAddress: '122 West End Ave',
    ownerAvatar: 'SarahJenkins',
    createdAt: '4m ago',
  },
  {
    id: 'case-2',
    caseRef: 'VD-9922',
    patientName: 'Oliver',
    species: 'Feline',
    breed: 'Tabby',
    age: '12y M/N',
    issue: 'Urinary Blockage',
    urgency: 'URGENT',
    waitMinutes: 12,
    aiSummary: 'FLUTD suspected. Renal failure risk within 6 hours without unblocking.',
    status: 'IN_REVIEW',
    clinician: 'Dr. Smith',
    clinicianAvatar: 'DrSmith',
    source: 'WEB_CHAT',
    riskFactor: 'Renal Failure',
    urgencyScore: 8.1,
    aiJustification:
      'Complete urethral obstruction suspected. 12-year-old male with dysuria and abdominal distension. Renal decompensation likely within 6 hours without catheterisation. Prioritise over routine cases.',
    ownerName: 'Liam Park',
    ownerPhone: '+1 (555) 883-2910',
    ownerAddress: '45 North St',
    ownerAvatar: 'LiamPark',
    createdAt: '12m ago',
  },
  {
    id: 'case-3',
    caseRef: 'VD-9923',
    patientName: 'Bella',
    species: 'Canine',
    breed: 'French Bulldog',
    age: '2y F/S',
    issue: 'Toxin Ingestion',
    urgency: 'URGENT',
    waitMinutes: 15,
    aiSummary: 'Dark chocolate ingestion ~40mg/kg. Emesis window still open.',
    status: 'IN_TREATMENT',
    clinician: 'Dr. Thorne',
    clinicianAvatar: 'DrArisThorne',
    source: 'PHONE',
    riskFactor: 'Theobromine Toxicity',
    urgencyScore: 7.4,
    aiJustification:
      'Dark chocolate at estimated 40mg/kg theobromine exposure. Current window for emesis induction is open — act within 30 minutes. Methylxanthine toxicity monitoring required for 6–8 hours post-ingestion.',
    ownerName: 'Elena Rodriguez',
    ownerPhone: '+1 (555) 441-0023',
    ownerAddress: '88 East Ave',
    ownerAvatar: 'ElenaRodriguez',
    createdAt: '15m ago',
  },
  {
    id: 'case-4',
    caseRef: 'VD-9924',
    patientName: 'Max',
    species: 'Canine',
    breed: 'Mixed Breed',
    age: '1y M/N',
    issue: 'Limping (Front Right)',
    urgency: 'ROUTINE',
    waitMinutes: 25,
    aiSummary: 'Probable soft tissue injury. No systemic symptoms. Owner present.',
    status: 'AWAITING_OWNER',
    clinician: null,
    clinicianAvatar: null,
    source: 'FRONT_DESK',
    riskFactor: 'Soft Tissue',
    urgencyScore: 2.8,
    aiJustification:
      'Mild non-weight-bearing on right forelimb with no systemic signs. Likely soft tissue injury or minor fracture. Low urgency — physical exam and imaging can confirm after higher-priority cases are managed.',
    ownerName: 'Michael Chen',
    ownerPhone: '+1 (555) 662-8847',
    ownerAddress: '12 South Blvd',
    ownerAvatar: 'MichaelChen',
    createdAt: '25m ago',
  },
]

// ─── Calls ────────────────────────────────────────────────────

export const INITIAL_CALLS: DashboardCall[] = [
  {
    id: 'call-1',
    callerName: 'David Chen',
    callerPhone: '+61 4 6789 0123',
    patientName: 'Pepper',
    species: 'African Grey Parrot',
    receivedMinsAgo: 2,
    transcript:
      '"...Pepper just fell off her perch and she\'s breathing really fast with her mouth open. She can\'t stand up. We\'re getting in the car now..."',
    aiRiskLabel: 'CRITICAL',
    aiConfidence: 94,
    aiNextStep: 'Alert ER team. Prepare avian emergency protocol immediately.',
    status: 'NEW',
  },
  {
    id: 'call-2',
    callerName: 'Liam Park',
    callerPhone: '+61 4 8901 2345',
    patientName: 'Oscar',
    species: 'Maine Coon',
    receivedMinsAgo: 23,
    transcript:
      '"...Oscar keeps going to the litter box every few minutes and crying. He had a blockage six months ago, I\'m really worried it\'s happening again..."',
    aiRiskLabel: 'URGENT',
    aiConfidence: 87,
    aiNextStep: 'Triage immediately — history of urethral obstruction, high recurrence risk.',
    status: 'NEW',
  },
  {
    id: 'call-3',
    callerName: 'Maria Santos',
    callerPhone: '+61 4 3210 5678',
    patientName: 'Coco',
    species: 'Beagle',
    receivedMinsAgo: 47,
    transcript:
      '"...Coco got into the rubbish bin earlier tonight. She vomited twice but seems okay now. Should I bring her in or just watch her?..."',
    aiRiskLabel: 'GENERAL',
    aiConfidence: 72,
    aiNextStep: 'Advise owner to monitor. Schedule morning callback if symptoms persist.',
    status: 'REVIEWED',
  },
]

// ─── Clinicians ───────────────────────────────────────────────

export const CLINICIANS: Clinician[] = [
  { id: 'c1', name: 'Dr. Aris Thorne', role: 'DVM – Night Lead', available: true, avatar: 'DrArisThorne' },
  { id: 'c2', name: 'Dr. Sarah Smith', role: 'DVM – ER', available: true, avatar: 'DrSmith' },
  { id: 'c3', name: 'Dr. James Miller', role: 'DVM – Surgery', available: false, avatar: 'DrMiller' },
  { id: 'c4', name: 'LVT Sarah Nguyen', role: 'LVT – Triage', available: true, avatar: 'NurseSarah' },
  { id: 'c5', name: 'LVT Mike Patel', role: 'LVT – ICU', available: false, avatar: 'NurseMike' },
  { id: 'c6', name: 'LVT Jane Cooper', role: 'LVT – Ward', available: true, avatar: 'NurseJane' },
]

// ─── Capacity ─────────────────────────────────────────────────

export const INITIAL_CAPACITY: ClinicCapacity = {
  totalRooms: 6,
  occupiedRooms: 4,
  nextSlotTime: '2:30 PM',
  cliniciansOnDuty: 6,
  cliniciansAvailable: 2,
}

// ─── Activity Feed ────────────────────────────────────────────

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    message: 'Luna escalated to ER — cardiovascular compromise suspected',
    timestamp: new Date(Date.now() - 2 * 60000),
    type: 'escalation',
  },
  {
    id: 'a2',
    message: 'Sarah AI converted call to case — Oscar (Maine Coon, urinary)',
    timestamp: new Date(Date.now() - 8 * 60000),
    type: 'call',
  },
  {
    id: 'a3',
    message: 'Bella flagged for toxin ingestion — urgency score 7.4',
    timestamp: new Date(Date.now() - 15 * 60000),
    type: 'case',
  },
  {
    id: 'a4',
    message: 'Dr. Smith assigned to Oliver (VD-9922)',
    timestamp: new Date(Date.now() - 20 * 60000),
    type: 'assignment',
  },
  {
    id: 'a5',
    message: 'Emergency slot reserved — 2:30 PM',
    timestamp: new Date(Date.now() - 35 * 60000),
    type: 'system',
  },
  {
    id: 'a6',
    message: 'Callback marked complete — Coco (Beagle)',
    timestamp: new Date(Date.now() - 52 * 60000),
    type: 'call',
  },
]
