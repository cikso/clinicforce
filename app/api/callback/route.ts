import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { FollowUpItem, FollowUpType, Urgency } from '@/data/mock-dashboard'

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

function mapFollowUpType(urgency: Urgency): FollowUpType {
  if (urgency === 'CRITICAL' || urgency === 'URGENT') return 'URGENT_CALLBACK'
  return 'ROUTINE_CALLBACK'
}

function mapEnquiryType(reason: string | undefined): string {
  if (!reason) return 'GENERAL_ENQUIRY'
  const r = reason.toUpperCase()
  if (r.includes('EMERGENCY') || r.includes('BLEED') || r.includes('COLLAPSE')) return 'EMERGENCY'
  if (r.includes('APPOINTMENT') || r.includes('BOOK')) return 'APPOINTMENT'
  if (r.includes('MEDICATION') || r.includes('PRESCRIPTION')) return 'MEDICATION'
  if (r.includes('PRICE') || r.includes('COST') || r.includes('FEE')) return 'PRICING'
  if (r.includes('URGENT') || r.includes('SICK') || r.includes('VOMIT') || r.includes('PAIN')) return 'URGENT_CONCERN'
  if (r.includes('CALLBACK') || r.includes('CALL BACK')) return 'CALLBACK_REQUEST'
  return 'GENERAL_ENQUIRY'
}

// ─── POST — ElevenLabs webhook (handles both formats) ────────────────────────
// Format 1: ElevenLabs post-call webhook (analysis.data_collection_results)
// Format 2: Direct tool call payload (owner_name, pet_name, etc.)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let caller_name: string
    let caller_phone: string
    let patient_name: string
    let species: string
    let urgency_raw: string
    let summary: string
    let call_reason: string
    let conversation_id: string | undefined
    let enquiry_type: string

    // ── ElevenLabs post-call webhook format ──────────────────────────────────
    if (body.type === 'post_call_transcription' && body.data) {
      const data = body.data
      const collected = data.analysis?.data_collection_results ?? {}
      const get = (key: string) => collected[key]?.value ?? ''

      caller_name    = get('owner_name') || get('caller_name') || 'Unknown'
      caller_phone   = get('phone_number') || get('caller_phone') || ''
      patient_name   = get('pet_name') || get('patient_name') || 'Unknown'
      species        = get('species') || get('animal_type') || 'Unknown'
      urgency_raw    = get('urgency') || get('priority') || 'ROUTINE'
      call_reason    = get('call_reason') || get('reason') || get('concern') || ''
      summary        = data.analysis?.transcript_summary || call_reason || 'Call completed'
      conversation_id = data.conversation_id
      enquiry_type   = mapEnquiryType(call_reason)
    }
    // ── Direct tool call format ──────────────────────────────────────────────
    else if (body.owner_name || body.caller_name) {
      caller_name    = body.owner_name || body.caller_name || 'Unknown'
      caller_phone   = body.phone_number || body.caller_phone || ''
      patient_name   = body.pet_name || body.patient_name || 'Unknown'
      species        = body.species || 'Unknown'
      urgency_raw    = body.urgency || 'ROUTINE'
      call_reason    = body.call_reason || body.reason || ''
      summary        = body.summary || call_reason || 'Call completed'
      conversation_id = body.conversation_id
      enquiry_type   = mapEnquiryType(call_reason || summary)
    } else {
      return NextResponse.json({ error: 'Unrecognised payload format' }, { status: 400 })
    }

    if (!caller_name || caller_name === 'Unknown') {
      caller_name = 'Unknown Caller'
    }

    const urgency = mapUrgency(urgency_raw)
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('calls')
      .insert({
        clinic_id:        DEMO_CLINIC_ID,
        conversation_id,
        caller_name,
        caller_phone,
        patient_name,
        species,
        enquiry_type,
        call_reason,
        transcript:        summary,
        ai_recommendation: summary,
        risk:              urgency,
        ai_confidence:     0.9,
        status:            'NEW',
        started_at:        new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Callback insert error:', error)
      return NextResponse.json({ error: 'Failed to save call', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Callback route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ─── GET — fetch pending callbacks for Follow-Up Queue ───────────────────────
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('calls')
      .select('id, caller_name, caller_phone, patient_name, species, transcript, risk, started_at')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .eq('status', 'NEW')
      .order('started_at', { ascending: false })
      .limit(20)

    if (error || !data) {
      return NextResponse.json([])
    }

    const followUps: FollowUpItem[] = data.map((row) => {
      const urgency = mapUrgency(row.risk as string)
      return {
        id:          row.id as string,
        callerName:  (row.caller_name as string) || 'Unknown',
        petName:     (row.patient_name as string) || 'Unknown',
        species:     (row.species as string) || '',
        summary:     (row.transcript as string) || '',
        urgency,
        type:        mapFollowUpType(urgency),
        receivedAt:  new Date(row.started_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phone:       (row.caller_phone as string) || '',
      }
    })

    return NextResponse.json(followUps)
  } catch {
    return NextResponse.json([])
  }
}
