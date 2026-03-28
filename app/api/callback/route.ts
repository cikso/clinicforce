import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { FollowUpItem, FollowUpType, Urgency } from '@/data/mock-dashboard'

// ─── Supabase client (service role bypasses RLS for server-side writes) ─────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

// ─── ElevenLabs create_callback_request payload ──────────────────────────────
export interface CallbackRequest {
  clinic_name?: string
  owner_name: string
  pet_name: string
  species: string
  phone_number: string
  urgency: string   // "CRITICAL" | "URGENT" | "ROUTINE" — from ElevenLabs tool
  summary: string
}

// Map ElevenLabs urgency string → our Urgency type
function mapUrgency(raw: string): Urgency {
  const u = raw?.toUpperCase()
  if (u === 'CRITICAL' || u === 'EMERGENCY') return 'CRITICAL'
  if (u === 'URGENT') return 'URGENT'
  return 'ROUTINE'
}

// Map urgency → follow-up type
function mapFollowUpType(urgency: Urgency): FollowUpType {
  if (urgency === 'CRITICAL' || urgency === 'URGENT') return 'URGENT_CALLBACK'
  return 'ROUTINE_CALLBACK'
}

// ─── POST — ElevenLabs webhook ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: CallbackRequest = await req.json()
    const { owner_name, pet_name, species, phone_number, urgency, summary } = body

    if (!owner_name || !phone_number || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()
    const mappedUrgency = mapUrgency(urgency)

    const { data, error } = await supabase
      .from('calls')
      .insert({
        clinic_id: DEMO_CLINIC_ID,
        caller_name: owner_name,
        caller_phone: phone_number,
        patient_name: pet_name || 'Unknown',
        species: species || 'Unknown',
        transcript: summary,
        ai_recommendation: summary,
        risk: mappedUrgency,
        ai_confidence: 0.9,
        status: 'NEW',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Callback insert error:', error)
      return NextResponse.json({ error: 'Failed to save callback' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Callback route error:', err)
    return NextResponse.json({ error: 'Callback request failed' }, { status: 500 })
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
      console.error('Callback fetch error:', error)
      return NextResponse.json([])
    }

    const followUps: FollowUpItem[] = data.map((row) => {
      const urgency = mapUrgency(row.risk as string)
      return {
        id: row.id as string,
        callerName: (row.caller_name as string) ?? 'Unknown',
        petName: (row.patient_name as string) ?? 'Unknown',
        species: (row.species as string) ?? '',
        summary: (row.transcript as string) ?? '',
        urgency,
        type: mapFollowUpType(urgency),
        receivedAt: new Date(row.started_at as string).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        phone: (row.caller_phone as string) ?? '',
      }
    })

    return NextResponse.json(followUps)
  } catch (err) {
    console.error('Callback GET error:', err)
    return NextResponse.json([])
  }
}
