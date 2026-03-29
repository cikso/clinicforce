// ─────────────────────────────────────────────────────────────
// VetForce — Coverage Console Mock Data
// ─────────────────────────────────────────────────────────────

export type Urgency = 'CRITICAL' | 'URGENT' | 'ROUTINE'
export type InboxStatus = 'UNREAD' | 'READ' | 'ACTIONED'
export type InteractionStatus = 'HANDLED' | 'CALLBACK_REQUIRED' | 'ESCALATED' | 'PENDING' | 'BOOKING_REQUESTED'
export type EnquiryType = 'APPOINTMENT' | 'URGENT_CONCERN' | 'GENERAL_ENQUIRY' | 'CALLBACK_REQUEST' | 'EMERGENCY' | 'PRICING' | 'MEDICATION'
export type IntakeSource = 'VOICE_AI' | 'WEB_CHAT' | 'PHONE' | 'FRONT_DESK' | 'REFERRAL'
export type CoverageReason = 'LUNCH_BREAK' | 'MEETING' | 'SICK_LEAVE' | 'OVERFLOW' | 'AFTER_HOURS' | 'MORNING_RUSH'
export type CoverageStatus = 'ACTIVE' | 'INACTIVE'
export type FollowUpType = 'URGENT_CALLBACK' | 'ROUTINE_CALLBACK' | 'BOOKING_REQUEST' | 'MESSAGE_REVIEW'
export type HandoverType = 'handled' | 'callback' | 'booking' | 'escalation' | 'coverage'

// Legacy type aliases for backward compat with any remaining components
export type CaseUrgency = Urgency
export type CaseStatus = InteractionStatus
export type CallStatus = 'NEW' | 'REVIEWED' | 'CASE_CREATED' | 'QUEUED' | 'CALLBACK_MARKED' | 'ESCALATED'
export type CallRisk = 'CRITICAL' | 'URGENT' | 'GENERAL'
export type ActivityType = HandoverType

export interface CoveredInteraction {
  id: string
  ref: string
  callerName: string
  callerPhone: string
  petName: string
  species: string
  breed: string
  enquiryType: EnquiryType
  urgency: Urgency
  source: IntakeSource
  summary: string
  aiDetail: string
  status: InteractionStatus
  nextAction: string
  coverageReason: CoverageReason
  createdAt: string
}

export interface CoverageSession {
  status: CoverageStatus
  reason: CoverageReason
  startTime: string
  durationMinutes: number
  endsAt: string
  clinicName: string
  location: string
  interactionsHandled: number
}

export interface FollowUpItem {
  id: string
  callerName: string
  petName: string
  species: string
  summary: string
  urgency: Urgency
  type: FollowUpType
  receivedAt: string
  phone: string
}

export interface CallInboxItem {
  id:              string
  callerName:      string
  callerPhone:     string
  petName:         string
  petSpecies:      string
  summary:         string
  aiDetail:        string
  actionRequired:  string
  urgency:         Urgency
  status:          InboxStatus
  coverageReason:  CoverageReason
  createdAt:       string
  callDurationSeconds?: number
}

export interface HandoverItem {
  id: string
  message: string
  timestamp: Date
  type: HandoverType
}

export interface CoverageUsage {
  reason: CoverageReason
  label: string
  minutes: number
  color: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  available: boolean
  avatar: string
}

// Legacy interface aliases for backward compat
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

export interface DashboardCase extends CoveredInteraction {
  caseRef: string
  patientName: string
  issue: string
  waitMinutes: number
  aiSummary: string
  clinician: string | null
  clinicianAvatar: string | null
  riskFactor: string
  urgencyScore: number
  aiJustification: string
  ownerName: string
  ownerPhone: string
  ownerAddress: string
  ownerAvatar: string
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

export interface ActivityItem {
  id: string
  message: string
  timestamp: Date
  type: ActivityType
}

// ─── Coverage Session ─────────────────────────────────────────

export const INITIAL_COVERAGE_SESSION: CoverageSession = {
  status: 'ACTIVE',
  reason: 'LUNCH_BREAK',
  startTime: '12:00 PM',
  durationMinutes: 23,
  endsAt: '1:30 PM',
  clinicName: 'Baulkham Hills Pet Clinic',
  location: 'Main Reception',
  interactionsHandled: 9,
}

// ─── Covered Interactions ────────────────────────────────────

export const INITIAL_INTERACTIONS: CoveredInteraction[] = [
  {
    id: 'int-1',
    ref: 'VD-1041',
    callerName: 'Karen Watson',
    callerPhone: '+61 4 1234 5678',
    petName: 'Buddy',
    species: 'Canine',
    breed: 'Labrador',
    enquiryType: 'APPOINTMENT',
    urgency: 'ROUTINE',
    source: 'VOICE_AI',
    summary: 'Requesting annual check-up for 3yr Labrador. Flexible on timing.',
    aiDetail: 'Routine wellness enquiry. Owner happy to book at next available slot. No clinical concern raised.',
    status: 'BOOKING_REQUESTED',
    nextAction: 'Book appointment',
    coverageReason: 'LUNCH_BREAK',
    createdAt: '8m ago',
  },
  {
    id: 'int-2',
    ref: 'VD-1042',
    callerName: 'Tom Rafferty',
    callerPhone: '+61 4 2345 6789',
    petName: 'Whiskers',
    species: 'Feline',
    breed: 'Domestic Shorthair',
    enquiryType: 'URGENT_CONCERN',
    urgency: 'URGENT',
    source: 'PHONE',
    summary: 'Cat not eating for 2 days. Hiding under bed. Caller very concerned.',
    aiDetail: 'Anorexia for 48+ hours with behavioural changes. Could indicate systemic illness, pain, or stress. Recommend same-day assessment.',
    status: 'CALLBACK_REQUIRED',
    nextAction: 'Call back — same-day triage',
    coverageReason: 'LUNCH_BREAK',
    createdAt: '14m ago',
  },
  {
    id: 'int-3',
    ref: 'VD-1043',
    callerName: 'Sarah Mitchell',
    callerPhone: '+61 4 3456 7890',
    petName: '—',
    species: '—',
    breed: '—',
    enquiryType: 'PRICING',
    urgency: 'ROUTINE',
    source: 'WEB_CHAT',
    summary: 'Asked about desexing costs for a 6-month-old female cat.',
    aiDetail: 'General pricing enquiry. Caller provided contact details. No pet health concern.',
    status: 'HANDLED',
    nextAction: '—',
    coverageReason: 'LUNCH_BREAK',
    createdAt: '18m ago',
  },
  {
    id: 'int-4',
    ref: 'VD-1044',
    callerName: 'James Park',
    callerPhone: '+61 4 4567 8901',
    petName: 'Max',
    species: 'Canine',
    breed: 'Border Collie',
    enquiryType: 'EMERGENCY',
    urgency: 'CRITICAL',
    source: 'VOICE_AI',
    summary: 'Dog collapsed in backyard. Not responding normally. Gums pale.',
    aiDetail: 'Suspected cardiovascular or toxic emergency. Pale gums and sudden collapse. Owner driving in now — estimated 10 mins. Prepare for urgent intake.',
    status: 'ESCALATED',
    nextAction: 'Prepare for urgent intake',
    coverageReason: 'LUNCH_BREAK',
    createdAt: '21m ago',
  },
  {
    id: 'int-5',
    ref: 'VD-1045',
    callerName: 'Lisa Chen',
    callerPhone: '+61 4 5678 9012',
    petName: 'Mochi',
    species: 'Feline',
    breed: 'British Shorthair',
    enquiryType: 'MEDICATION',
    urgency: 'ROUTINE',
    source: 'PHONE',
    summary: "Querying whether to give this morning's flea treatment before tonight's scheduled appointment.",
    aiDetail: 'Routine pre-appointment question. Advised to hold treatment until after the visit. Message captured for vet to confirm.',
    status: 'HANDLED',
    nextAction: '—',
    coverageReason: 'LUNCH_BREAK',
    createdAt: '29m ago',
  },
]

// ─── Follow-Up Queue ─────────────────────────────────────────

export const INITIAL_FOLLOWUPS: FollowUpItem[] = [
  {
    id: 'f1',
    callerName: 'James Park',
    petName: 'Max',
    species: 'Canine',
    summary: 'Collapsed — pale gums. Owner en route.',
    urgency: 'CRITICAL',
    type: 'URGENT_CALLBACK',
    receivedAt: '21m ago',
    phone: '+61 4 4567 8901',
  },
  {
    id: 'f2',
    callerName: 'Tom Rafferty',
    petName: 'Whiskers',
    species: 'Feline',
    summary: 'Not eating 2 days. Hiding. Same-day assessment needed.',
    urgency: 'URGENT',
    type: 'URGENT_CALLBACK',
    receivedAt: '14m ago',
    phone: '+61 4 2345 6789',
  },
  {
    id: 'f3',
    callerName: 'Karen Watson',
    petName: 'Buddy',
    species: 'Canine',
    summary: 'Annual check-up requested. Flexible on time.',
    urgency: 'ROUTINE',
    type: 'BOOKING_REQUEST',
    receivedAt: '8m ago',
    phone: '+61 4 1234 5678',
  },
  {
    id: 'f4',
    callerName: 'Sarah Mitchell',
    petName: '—',
    species: '—',
    summary: 'Desexing price enquiry. Wants a callback with quote.',
    urgency: 'ROUTINE',
    type: 'ROUTINE_CALLBACK',
    receivedAt: '18m ago',
    phone: '+61 4 3456 7890',
  },
]

// ─── Handover Feed ────────────────────────────────────────────

export const INITIAL_HANDOVER: HandoverItem[] = [
  {
    id: 'h1',
    message: 'James Park / Max — collapse reported. Escalated. Owner driving in now.',
    timestamp: new Date(Date.now() - 2 * 60000),
    type: 'escalation',
  },
  {
    id: 'h2',
    message: 'Tom Rafferty / Whiskers — urgent concern captured. Callback required today.',
    timestamp: new Date(Date.now() - 8 * 60000),
    type: 'callback',
  },
  {
    id: 'h3',
    message: 'Karen Watson / Buddy — booking request received. Check-up appointment needed.',
    timestamp: new Date(Date.now() - 12 * 60000),
    type: 'booking',
  },
  {
    id: 'h4',
    message: 'Coverage activated — Lunch Break. 12:00 PM, Main Reception.',
    timestamp: new Date(Date.now() - 23 * 60000),
    type: 'coverage',
  },
  {
    id: 'h5',
    message: 'Sarah Mitchell — pricing enquiry handled. No callback needed.',
    timestamp: new Date(Date.now() - 18 * 60000),
    type: 'handled',
  },
  {
    id: 'h6',
    message: 'Lisa Chen / Mochi — medication question handled. Message left for vet.',
    timestamp: new Date(Date.now() - 29 * 60000),
    type: 'handled',
  },
]

// ─── Coverage Usage ───────────────────────────────────────────

export const COVERAGE_USAGE: CoverageUsage[] = [
  { reason: 'LUNCH_BREAK', label: 'Lunch Break', minutes: 83, color: '#0ea5e9' },
  { reason: 'MEETING', label: 'Team Meeting', minutes: 45, color: '#8b5cf6' },
  { reason: 'MORNING_RUSH', label: 'Morning Rush', minutes: 30, color: '#f59e0b' },
  { reason: 'AFTER_HOURS', label: 'After Hours', minutes: 0, color: '#64748b' },
]

// ─── Staff ────────────────────────────────────────────────────

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 's1', name: 'Dr. Aris Thorne', role: 'Lead Veterinarian', available: true, avatar: 'DrArisThorne' },
  { id: 's2', name: 'Sarah Kim', role: 'Head Receptionist', available: false, avatar: 'SarahKim' },
  { id: 's3', name: 'Dr. James Miller', role: 'Veterinarian', available: true, avatar: 'DrMiller' },
  { id: 's4', name: 'Priya Nguyen', role: 'Veterinary Nurse', available: true, avatar: 'PriyaNguyen' },
]

// ─── Call Inbox ───────────────────────────────────────────────

export const INITIAL_INBOX: CallInboxItem[] = [
  {
    id:             'ci-1',
    callerName:     'James Park',
    callerPhone:    '+61 4 4567 8901',
    petName:        'Max',
    petSpecies:     'Canine',
    summary:        'Dog collapsed in backyard. Not responding normally. Gums pale.',
    aiDetail:       'Caller reported Max (Border Collie, approx. 4 years) collapsed suddenly in the backyard and is not responding normally. Caller noted gums appear pale. Suspected cardiovascular or toxic emergency. Owner is driving in now — estimated arrival 10 minutes. Clinic should prepare for urgent intake.',
    actionRequired: 'Prepare for urgent intake — owner en route (~10 mins)',
    urgency:        'CRITICAL',
    status:         'UNREAD',
    coverageReason: 'LUNCH_BREAK',
    createdAt:      '21m ago',
    callDurationSeconds: 148,
  },
  {
    id:             'ci-2',
    callerName:     'Tom Rafferty',
    callerPhone:    '+61 4 2345 6789',
    petName:        'Whiskers',
    petSpecies:     'Feline',
    summary:        'Cat not eating for 2 days. Hiding under bed. Caller very concerned.',
    aiDetail:       'Whiskers (Domestic Shorthair, ~4 years) has not eaten for approximately 48 hours and has been hiding under the bed — a change from her normal behaviour. Caller Tom is very concerned. Anorexia combined with behavioural withdrawal could indicate systemic illness, pain, dental disease, or stress response. Same-day assessment recommended.',
    actionRequired: 'Call back — same-day triage appointment',
    urgency:        'URGENT',
    status:         'UNREAD',
    coverageReason: 'LUNCH_BREAK',
    createdAt:      '14m ago',
    callDurationSeconds: 203,
  },
  {
    id:             'ci-3',
    callerName:     'Karen Watson',
    callerPhone:    '+61 4 1234 5678',
    petName:        'Buddy',
    petSpecies:     'Canine',
    summary:        'Requesting annual check-up for 3yr Labrador. Flexible on timing.',
    aiDetail:       'Karen is requesting an annual wellness check-up for Buddy, a 3-year-old male Labrador. No clinical concerns raised. Owner is flexible on appointment time and happy to take the next available slot. Contact details captured.',
    actionRequired: 'Book annual check-up — any available slot',
    urgency:        'ROUTINE',
    status:         'UNREAD',
    coverageReason: 'LUNCH_BREAK',
    createdAt:      '8m ago',
    callDurationSeconds: 87,
  },
  {
    id:             'ci-4',
    callerName:     'Sarah Mitchell',
    callerPhone:    '+61 4 3456 7890',
    petName:        '—',
    petSpecies:     '—',
    summary:        'Asked about desexing costs for a 6-month-old female cat.',
    aiDetail:       'General pricing enquiry. Sarah is considering desexing her 6-month-old female cat and wanted to know the approximate cost. No pet health concern raised. Contact details captured. Caller is happy to receive a callback with a quote.',
    actionRequired: 'Call back with desexing quote',
    urgency:        'ROUTINE',
    status:         'READ',
    coverageReason: 'LUNCH_BREAK',
    createdAt:      '18m ago',
    callDurationSeconds: 64,
  },
  {
    id:             'ci-5',
    callerName:     'Lisa Chen',
    callerPhone:    '+61 4 5678 9012',
    petName:        'Mochi',
    petSpecies:     'Feline',
    summary:        'Querying whether to give flea treatment before tonight\'s appointment.',
    aiDetail:       'Lisa is calling about Mochi (British Shorthair), who has a scheduled appointment tonight. She wanted to know whether to administer the monthly flea treatment this morning as usual, or hold it until after the visit. AI advised to hold the treatment and let the vet confirm at the appointment. Message flagged for vet.',
    actionRequired: 'Confirm with vet — hold flea treatment until appointment',
    urgency:        'ROUTINE',
    status:         'ACTIONED',
    coverageReason: 'LUNCH_BREAK',
    createdAt:      '29m ago',
    callDurationSeconds: 55,
  },
]

// ─── Legacy exports (for backward compat) ────────────────────

export const INITIAL_CASES: DashboardCase[] = INITIAL_INTERACTIONS.map((i) => ({
  ...i,
  caseRef: i.ref,
  patientName: i.petName,
  issue: i.summary,
  waitMinutes: 0,
  aiSummary: i.summary,
  clinician: null,
  clinicianAvatar: null,
  riskFactor: i.enquiryType,
  urgencyScore: i.urgency === 'CRITICAL' ? 9 : i.urgency === 'URGENT' ? 6 : 2,
  aiJustification: i.aiDetail,
  ownerName: i.callerName,
  ownerPhone: i.callerPhone,
  ownerAddress: '',
  ownerAvatar: i.callerName.replace(/\s/g, ''),
}))

export const INITIAL_CALLS: DashboardCall[] = []
export const CLINICIANS: Clinician[] = STAFF_MEMBERS.map((s) => ({ id: s.id, name: s.name, role: s.role, available: s.available, avatar: s.avatar }))
export const INITIAL_CAPACITY: ClinicCapacity = { totalRooms: 6, occupiedRooms: 2, nextSlotTime: '1:30 PM', cliniciansOnDuty: 3, cliniciansAvailable: 2 }
export const INITIAL_ACTIVITY: ActivityItem[] = INITIAL_HANDOVER
