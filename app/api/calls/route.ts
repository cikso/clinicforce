import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CoveredInteraction, Urgency, InteractionStatus, EnquiryType } from '@/data/mock-dashboard'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

function mapUrgency(raw: string | undefined): Urgency {
  const u = (raw ?? '').toUpperCase()
  if (u === 'CRITICAL' || u === 'EMERGENCY') return 'CRITICAL'
  if (u === 'URGENT') return 'URGENT'
  return 'ROUTINE'
}

function mapStatus(dbStatus: string | undefined, urgency: Urgency): InteractionStatus {
  const s = (dbStatus ?? '').toUpperCase()
  if (s === 'ESCALATED') return 'ESCALATED'
  if (s === 'CALLBACK_MARKED') return 'CALLBACK_REQUIRED'
  if (s === 'REVIEWED' || s === 'CASE_CREATED') return 'HANDLED'
  if (urgency === 'CRITICAL') return 'CALLBACK_REQUIRED'
  if (urgency === 'URGENT') return 'CALLBACK_REQUIRED'
  return 'HANDLED'
}

function mapEnquiryType(raw: string | undefined): EnquiryType {
  const e = (raw ?? '').toUpperCase()
  if (e === 'EMERGENCY') return 'EMERGENCY'
  if (e === 'APPOINTMENT') return 'APPOINTMENT'
  if (e === 'MEDICATION') return 'MEDICATION'
  if (e === 'PRICING') return 'PRICING'
  if (e === 'URGENT_CONCERN') return 'URGENT_CONCERN'
  if (e === 'CALLBACK_REQUEST') return 'CALLBACK_REQUEST'
  return 'GENERAL_ENQUIRY'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// GET /api/calls — returns all recent calls as CoveredInteraction[]
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('calls')
      .select('id, caller_name, caller_phone, patient_name, species, enquiry_type, call_reason, transcript, ai_recommendation, risk, status, started_at')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .order('started_at', { ascending: false })
      .limit(50)

    if (error || !data) {
      return NextResponse.json([])
    }

    const interactions: CoveredInteraction[] = data.map((row, i) => {
      const urgency = mapUrgency(row.risk as string)
      const status = mapStatus(row.status as string, urgency)
      const enquiryType = mapEnquiryType(row.enquiry_type as string)
      const summary = (row.call_reason as string) || (row.transcript as string) || 'Call handled by AI'

      return {
        id:             row.id as string,
        ref:            `VC-${String(1000 + i).padStart(4, '0')}`,
        callerName:     (row.caller_name as string) || 'Unknown Caller',
        callerPhone:    (row.caller_phone as string) || '',
        petName:        (row.patient_name as string) || 'Unknown',
        species:        (row.species as string) || 'Unknown',
        breed:          '',
        enquiryType,
        urgency,
        source:         'VOICE_AI',
        summary,
        aiDetail:       (row.ai_recommendation as string) || summary,
        status,
        nextAction:     urgency === 'ROUTINE' ? 'No follow-up required' : 'Review and call back',
        coverageReason: 'AFTER_HOURS',
        createdAt:      timeAgo(row.started_at as string),
      }
    })

    return NextResponse.json(interactions)
  } catch {
    return NextResponse.json([])
  }
}

// PATCH /api/calls — update call status
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

    const supabase = getSupabase()
    const { error } = await supabase
      .from('calls')
      .update({ status })
      .eq('id', id)
      .eq('clinic_id', DEMO_CLINIC_ID)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
