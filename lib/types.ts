// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type TriageLevel = 'URGENT' | 'HIGH' | 'ROUTINE' | 'FOLLOW_UP'
export type Species = 'Canine' | 'Feline' | 'Avian' | 'Exotic'
export type CallStatus = 'UNREAD' | 'READ' | 'ACTIONED'
export type BookingStatus =
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
export type MediaStatus = 'PENDING_REVIEW' | 'REVIEWED' | 'FLAGGED'
export type QueueStatus = 'WAITING' | 'WITH_VET' | 'PENDING_DISCHARGE'
export type CaseEventType =
  | 'CHECKED_IN'
  | 'TRIAGE_ASSESSED'
  | 'VET_ASSIGNED'
  | 'CALL_LOGGED'
  | 'REFERRAL_SENT'
  | 'FOLLOW_UP_SCHEDULED'
  | 'NOTE_ADDED'
  | 'DISCHARGED'
export type ReferralStatus = 'NOTIFIED' | 'CASE_SENT' | 'ACKNOWLEDGED' | 'ARRIVED'
export type TaskColumn = 'POST_CALL' | 'TRIAGE_REVIEW' | 'OWNER_CHECKIN'
export type TaskPriority = 'HIGH' | 'ROUTINE' | 'CRITICAL'

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Patient {
  id: string
  name: string
  species: Species
  breed: string
  age: string           // e.g. "4 years", "8 months"
  ownerName: string
  ownerPhone: string
  ownerAddress?: string
}

export interface QueueEntry {
  id: string
  patient: Patient
  triageLevel: TriageLevel
  queueStatus: QueueStatus
  chiefConcern: string   // triage / next-step language only — no diagnosis
  arrivalTime: string    // ISO string
  waitMinutes: number
  assignedTo: string | null
  assignedAvatar?: string | null  // DiceBear seed
  room: string | null
  notes: string
  caseId: string | null
  // AI triage fields (from Google design)
  aiSummary: string      // short AI-generated triage note shown in table
  urgencyScore: number   // 1–10 operational urgency score
  riskFactor: string     // e.g. "Nephrotoxicity risk", "GI Obstruction possible"
  aiJustification: string // reasoning shown in case drawer
}

export interface UrgentAlert {
  id: string
  patient: Patient
  message: string        // operational alert text, no diagnosis
  triageLevel: TriageLevel
  createdAt: string
  acknowledged: boolean
}

export interface Call {
  id: string
  callerName: string
  callerPhone: string
  petName: string
  petSpecies: string
  summary: string
  aiDetail: string
  actionRequired: string
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'
  status: CallStatus
  callDurationSeconds: number | null
  createdAt: string
}

export interface Booking {
  id: string
  patient: Patient
  appointmentType: string  // "Annual Wellness", "Recheck", "Urgent Care"
  scheduledAt: string
  status: BookingStatus
  assignedVet: string
  notes: string
  triageReason?: string    // owner-submitted triage reason for new requests
  isNewRequest?: boolean   // pending approval
  submittedAt?: string     // when request was submitted
}

export interface MediaItem {
  id: string
  patient: Patient
  uploadedAt: string
  fileType: 'image' | 'video' | 'document'
  fileName: string
  thumbnailUrl: string
  status: MediaStatus
  reviewNote: string | null
  linkedCaseId: string | null
  tags: string[]           // e.g. ["Wound - Left Hind", "Post-Op Check"]
  patientHistory?: string  // context shown in review panel
  aiInsights?: { type: 'ok' | 'flag'; text: string }[]
}

export interface CaseEvent {
  id: string
  type: CaseEventType
  timestamp: string
  actor: string             // staff name or "System"
  note: string
}

export interface Referral {
  id: string
  patient: Patient
  referredTo: string        // clinic/specialist name
  reason: string
  sentAt: string
  status: ReferralStatus
  progressStep: number      // 0=Notified, 1=Case Sent, 2=Acknowledged, 3=Arrived
  etaMinutes?: number
  clinicPhone?: string
  clinicDistance?: string
  clinicWaitMinutes?: number
  urgencyLevel: 'STAT' | 'URGENT' | 'ROUTINE'
}

export interface PartnerClinic {
  id: string
  name: string
  phone: string
  distanceMiles: number
  driveMinutes: number
  waitMinutes: number | null  // null = at capacity
  isOpen: boolean
  isAtCapacity: boolean
}

export interface FollowUpTask {
  id: string
  patient: Patient
  patientSpecies?: string
  dueDate: string
  dueTime: string            // e.g. "2:00 PM"
  task: string
  assignedTo: string
  assignedAvatars: string[]  // DiceBear seeds
  completed: boolean
  column: TaskColumn
  priority: TaskPriority
  caseId: string
  label: string              // e.g. "Urgent Recovery", "High Priority"
}

export interface Case {
  id: string
  patient: Patient
  openedAt: string
  lastUpdated: string
  triageLevel: TriageLevel
  chiefConcern: string
  aiSummary: string
  urgencyScore: number
  riskFactor: string
  aiJustification: string
  timeline: CaseEvent[]
  referral: Referral | null
  followUpTasks: FollowUpTask[]
  mediaAssets?: MediaItem[]
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardStats {
  patientsInQueue: number
  urgentAlerts: number
  callsUnreviewed: number
  bookingsToday: number
  mediaAwaitingReview: number
  avgWaitMinutes: number
  emergencyLevel: number
  cliniciansOnDuty: number
  totalQueueVolume: number
  queueResponseRate: number
}
