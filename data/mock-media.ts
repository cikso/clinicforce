import type { MediaItem } from '@/lib/types'
import { mockPatients } from './mock-patients'

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000).toISOString()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400 * 1000).toISOString()

export const mockMedia: MediaItem[] = [
  {
    id: 'm1',
    patient: mockPatients[2], // Archie
    uploadedAt: minsAgo(18),
    fileType: 'image',
    fileName: 'archie_rr_limb_lateral_view.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
    status: 'PENDING_REVIEW',
    reviewNote: null,
    linkedCaseId: 'case-q2',
    tags: ['Limb — Right Rear', 'Lateral View'],
    patientHistory: '2-year-old male Border Collie. Presenting with acute non-weight-bearing right rear limb. No reported trauma. Mild vocalisation on palpation.',
    aiInsights: [
      { type: 'flag', text: 'Abnormal joint angle detected in lateral view' },
      { type: 'ok', text: 'No visible fracture line on initial scan' },
    ],
  },
  {
    id: 'm2',
    patient: mockPatients[2], // Archie
    uploadedAt: minsAgo(16),
    fileType: 'image',
    fileName: 'archie_rr_limb_ap_view.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
    status: 'PENDING_REVIEW',
    reviewNote: null,
    linkedCaseId: 'case-q2',
    tags: ['Limb — Right Rear', 'AP View'],
    patientHistory: '2-year-old male Border Collie. Second view requested to rule out occult fracture.',
    aiInsights: [
      { type: 'ok', text: 'Bone density appears within normal range' },
      { type: 'flag', text: 'Soft tissue swelling present around stifle joint' },
    ],
  },
  {
    id: 'm3',
    patient: mockPatients[8], // Bella
    uploadedAt: hoursAgo(1),
    fileType: 'image',
    fileName: 'bella_incision_day7_ventral.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
    status: 'FLAGGED',
    reviewNote: 'Mild erythema noted around cranial suture line — owner to be contacted for in-person assessment.',
    linkedCaseId: null,
    tags: ['Incision — Ventral', 'Post-Op Day 7'],
    patientHistory: '5-year-old female Cavalier King Charles. Post-op day 7 following splenectomy. Owner reports mild redness, no drainage.',
    aiInsights: [
      { type: 'ok', text: 'No active drainage detected' },
      { type: 'flag', text: 'Mild erythema localised to cranial suture line' },
    ],
  },
  {
    id: 'm4',
    patient: mockPatients[7], // Oscar
    uploadedAt: hoursAgo(2),
    fileType: 'image',
    fileName: 'oscar_bladder_ultrasound_followup.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    status: 'REVIEWED',
    reviewNote: 'Bladder wall within normal limits. No residual thickening. Cleared.',
    linkedCaseId: 'case-q7',
    tags: ['Bladder Ultrasound', 'Post-Obstruction'],
    patientHistory: '7-year-old male Maine Coon. 7-day post-discharge following urinary obstruction. Owner reports normal voiding.',
    aiInsights: [
      { type: 'ok', text: 'Bladder wall thickness within normal limits' },
      { type: 'ok', text: 'No residual sediment or thickening detected' },
    ],
  },
  {
    id: 'm5',
    patient: mockPatients[0], // Baxter
    uploadedAt: minsAgo(30),
    fileType: 'document',
    fileName: 'baxter_toxin_ingestion_record.pdf',
    thumbnailUrl: '',
    status: 'PENDING_REVIEW',
    reviewNote: null,
    linkedCaseId: 'case-q1',
    tags: ['Toxicology', 'Incident Report'],
    patientHistory: '6-year-old male Labrador Retriever. Suspected xylitol ingestion. Owner brought product packaging.',
    aiInsights: [],
  },
  {
    id: 'm6',
    patient: mockPatients[9], // Ziggy
    uploadedAt: hoursAgo(3),
    fileType: 'image',
    fileName: 'ziggy_husbandry_setup_owner_photo.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400',
    status: 'PENDING_REVIEW',
    reviewNote: null,
    linkedCaseId: 'case-q6',
    tags: ['Husbandry Review', 'Enclosure Setup'],
    patientHistory: '2-year-old male Bearded Dragon. Presenting with lethargy and anorexia for 3 days. UVB and basking temps provided by owner.',
    aiInsights: [
      { type: 'flag', text: 'UVB bulb placement appears suboptimal for basking zone' },
    ],
  },
  {
    id: 'm7',
    patient: mockPatients[4], // Milo
    uploadedAt: hoursAgo(4),
    fileType: 'video',
    fileName: 'milo_respiratory_episode_owner_video.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
    status: 'FLAGGED',
    reviewNote: 'Video shows audible stertor and visible abdominal effort. Requires vet review before consultation.',
    linkedCaseId: 'case-q3',
    tags: ['Respiratory — Stertor', 'Video Evidence'],
    patientHistory: '4-year-old male French Bulldog. Laboured breathing post-exercise. Brachycephalic. SpO2 not yet recorded.',
    aiInsights: [
      { type: 'flag', text: 'Audible stertor and visible abdominal effort detected in video' },
      { type: 'flag', text: 'Open-mouth breathing pattern noted at 0:14' },
    ],
  },
  {
    id: 'm8',
    patient: mockPatients[6], // Ruby
    uploadedAt: daysAgo(1),
    fileType: 'document',
    fileName: 'ruby_preop_bloodwork_results.pdf',
    thumbnailUrl: '',
    status: 'REVIEWED',
    reviewNote: 'All panels within acceptable pre-anaesthetic range. Surgery cleared to proceed.',
    linkedCaseId: 'case-q5',
    tags: ['Pre-Op Bloods', 'Cleared'],
    patientHistory: '9-month-old female Golden Retriever. Elective desexing tomorrow. Fasting confirmed.',
    aiInsights: [
      { type: 'ok', text: 'All haematology values within reference range' },
      { type: 'ok', text: 'Biochemistry panel clear — anaesthetic risk low' },
    ],
  },
]
