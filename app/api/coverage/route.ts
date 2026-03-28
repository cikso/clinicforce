import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// GET /api/coverage — return current coverage status for this clinic
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .select('status, reason, started_at, updated_at')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .single()

    if (error || !data) {
      return NextResponse.json({ status: 'INACTIVE', reason: null })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: 'INACTIVE', reason: null })
  }
}

// POST /api/coverage — activate coverage
// Body: { reason: CoverageReason }
export async function POST(req: Request) {
  try {
    const { reason } = await req.json()

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .upsert(
        {
          clinic_id:  DEMO_CLINIC_ID,
          status:     'ACTIVE',
          reason:     reason ?? 'MANUAL',
          started_at: new Date().toISOString(),
          ended_at:   null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clinic_id' },
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/coverage — deactivate coverage
export async function DELETE() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .update({
        status:     'INACTIVE',
        ended_at:   new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('clinic_id', DEMO_CLINIC_ID)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
