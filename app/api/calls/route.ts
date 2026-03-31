import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CoveredInteraction, Urgency, InteractionStatus, EnquiryType, CoverageReason } from '@/data/mock-dashboard'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

function mapUrgency(raw: string | undefined): Urgency {
  const u = (raw ?? '').toUpperCase()
  if (u === 'CRITICAL') return 'CRITICAL'
  if (u === 'URGENT')   return 'URGENT'
  return 'ROUTINE'
}

function mapStatus(urgency: Urgency, status: string | undefined): InteractionStatus {
  const s = (status ?? '').toUpperCase()
  if (s === 'ACTIONED') return 'HANDLED'
  if (urgency === 'CRITICAL' || urgency === 'URGENT') return 'CALLBACK_REQUIRED'
  return 'HANDLED'
}

function mapEnquiryType(summary: string): EnquiryType {
  const s = summary.toLowerCase()
  if (s.includes('emergency') || s.includes('collapse') || s.includes('seizure')) return 'EMERGENCY'
  if (s.includes('appointment') || s.includes('book'))                             return 'APPOINTMENT'
  if (s.includes('medication') || s.includes('prescription') || s.includes('refill')) return 'MEDICATION'
  if (s.includes('price') || s.includes('cost') || s.includes('fee'))             return 'PRICING'
  if (s.includes('urgent') || s.includes('worried') || s.includes('concern'))     return 'URGENT_CONCERN'
  if (s.includes('callback') || s.includes('call back'))                          return 'CALLBACK_REQUEST'
  return 'GENERAL_ENQUIRY'
}

const VALID_COVERAGE_REASONS: CoverageReason[] = ['LUNCH_BREAK', 'MEETING', 'SICK_LEAVE', 'OVERFLOW', 'AFTER_HOURS', 'MORNING_RUSH']

function mapCoverageReason(raw: string | undefined): CoverageReason {
  if ((VALID_COVERAGE_REASONS as string[]).includes(raw ?? '')) return raw as CoverageReason
  return 'AFTER_HOURS'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// GET /api/calls — returns recent call_inbox rows as CoveredInteraction[]
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('call_inbox')
      .select('id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, coverage_reason, call_duration_seconds, created_at')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error || !data) {
      console.error('[/api/calls] Supabase error:', error)
      return NextResponse.json([])
    }

    const interactions: CoveredInteraction[] = data.map((row, i) => {
      const urgency      = mapUrgency(row.urgency as string)
      const summary      = (row.summary as string) || (row.ai_detail as string) || 'Call handled by AI'
      const status       = mapStatus(urgency, row.status as string)
      const enquiryType  = mapEnquiryType(summary)

      return {
        id:             row.id as string,
        ref:            `VC-${String(1000 + i).padStart(4, '0')}`,
        callerName:     (row.caller_name    as string) || 'Unknown Caller',
        callerPhone:    (row.caller_phone   as string) || '',
        petName:        (row.pet_name       as string) || 'Unknown',
        species:        (row.pet_species    as string) || 'Unknown',
        breed:          '',
        enquiryType,
        urgency,
        source:         'VOICE_AI',
        summary,
        aiDetail:       (row.ai_detail      as string) || summary,
        status,
        nextAction:     (row.action_required as string) || (urgency === 'ROUTINE' ? 'No follow-up required' : 'Review and call back'),
        coverageReason: mapCoverageReason(row.coverage_reason as string),
        createdAt:      timeAgo(row.created_at as string),
      }
    })

    return NextResponse.json(interactions)
  } catch (err) {
    console.error('[/api/calls] Unexpected error:', err)
    return NextResponse.json([])
  }
}

// PATCH /api/calls — update inbox item status
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from('call_inbox')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('clinic_id', DEMO_CLINIC_ID)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
