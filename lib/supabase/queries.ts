import { createClient } from './server'
import type { DashboardCase, DashboardCall, CallStatus } from '@/data/mock-dashboard'

function mapCallStatus(s: string): CallStatus {
  if (s === 'NEW') return 'NEW'
  if (s === 'REVIEWED' || s === 'ACTIONED') return 'REVIEWED'
  if (s === 'CONVERTED') return 'CASE_CREATED'
  if (s === 'ESCALATED') return 'ESCALATED'
  if (s === 'CALLBACK_SCHEDULED') return 'CALLBACK_MARKED'
  return 'REVIEWED'
}

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export async function fetchDashboardCases(): Promise<DashboardCase[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cases')
    .select(`
      id, case_number, presenting_issue, urgency, status, intake_source,
      ai_summary, ai_justification, ai_risk_factor, urgency_score, opened_at, created_at,
      pets ( name, species, breed, age ),
      owners ( name, phone, address ),
      staff ( name, avatar_seed )
    `)
    .eq('clinic_id', DEMO_CLINIC_ID)
    .is('closed_at', null)
    .order('opened_at', { ascending: true })

  if (error || !data) {
    console.error('fetchDashboardCases error:', error)
    return []
  }

  return data.map((row) => {
    const pet = Array.isArray(row.pets) ? row.pets[0] : row.pets
    const owner = Array.isArray(row.owners) ? row.owners[0] : row.owners
    const staffMember = Array.isArray(row.staff) ? row.staff[0] : row.staff
    const waitMinutes = Math.floor(
      (Date.now() - new Date(row.opened_at as string).getTime()) / 60000
    )

    const ownerName: string = owner?.name ?? ''
    const caseRef: string = row.case_number as string
    const petName: string = pet?.name ?? 'Unknown'
    return {
      id: row.id as string,
      // CoveredInteraction base fields
      ref: caseRef,
      callerName: ownerName,
      callerPhone: owner?.phone ?? '',
      petName,
      enquiryType: 'URGENT_CONCERN' as DashboardCase['enquiryType'],
      urgency: row.urgency as DashboardCase['urgency'],
      source: row.intake_source as DashboardCase['source'],
      summary: row.presenting_issue as string,
      aiDetail: (row.ai_justification as string) ?? '',
      status: 'PENDING' as DashboardCase['status'],
      nextAction: '',
      coverageReason: 'OVERFLOW' as DashboardCase['coverageReason'],
      createdAt: row.created_at as string,
      // DashboardCase extension fields
      caseRef,
      patientName: petName,
      species: pet?.species ?? 'Unknown',
      breed: pet?.breed ?? '',
      issue: row.presenting_issue as string,
      waitMinutes,
      aiSummary: (row.ai_summary as string) ?? '',
      clinician: staffMember?.name ?? null,
      clinicianAvatar: staffMember?.avatar_seed
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.avatar_seed}`
        : null,
      riskFactor: (row.ai_risk_factor as string) ?? '',
      urgencyScore: (row.urgency_score as number) ?? 0,
      aiJustification: (row.ai_justification as string) ?? '',
      ownerName,
      ownerPhone: owner?.phone ?? '',
      ownerAddress: owner?.address ?? '',
      ownerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerName || 'unknown'}`,
    }
  })
}

export async function fetchDashboardCalls(): Promise<DashboardCall[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('calls')
    .select('id, caller_name, caller_phone, patient_name, species, transcript, risk, ai_recommendation, ai_confidence, status, started_at')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .order('started_at', { ascending: false })
    .limit(10)

  if (error || !data) {
    console.error('fetchDashboardCalls error:', error)
    return []
  }

  return data.map((row) => {
    const receivedMinsAgo = Math.floor(
      (Date.now() - new Date(row.started_at as string).getTime()) / 60000
    )
    return {
      id: row.id as string,
      callerName: (row.caller_name as string) ?? 'Unknown',
      callerPhone: (row.caller_phone as string) ?? '',
      patientName: (row.patient_name as string) ?? 'Unknown',
      species: (row.species as string) ?? '',
      receivedMinsAgo,
      transcript: (row.transcript as string) ?? '',
      aiRiskLabel: (row.risk as DashboardCall['aiRiskLabel']) ?? 'GENERAL',
      aiConfidence: (row.ai_confidence as number) ?? 0,
      aiNextStep: (row.ai_recommendation as string) ?? '',
      status: mapCallStatus(row.status as string),
    }
  })
}
