import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'
const VALID_MODES    = ['DAYTIME', 'LUNCH', 'AFTER_HOURS'] as const

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// GET /api/clinic/[clinicId]/mode
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .select('status, reason, started_at')
      .eq('clinic_id', DEMO_CLINIC_ID)
      .single()

    if (error || !data || data.status !== 'ACTIVE') {
      return NextResponse.json({ mode: null, activatedAt: null })
    }

    const mode = (VALID_MODES as readonly string[]).includes(data.reason)
      ? data.reason
      : null

    return NextResponse.json({ mode, activatedAt: data.started_at ?? null })
  } catch {
    return NextResponse.json({ mode: null, activatedAt: null })
  }
}

// PATCH /api/clinic/[clinicId]/mode
// Body: { mode: 'DAYTIME' | 'LUNCH' | 'AFTER_HOURS' | null }
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const mode: string | null = body?.mode ?? null
  const now  = new Date().toISOString()
  const supabase = getSupabase()

  if (mode === null) {
    const { error } = await supabase
      .from('coverage_sessions')
      .update({ status: 'INACTIVE', ended_at: now, updated_at: now })
      .eq('clinic_id', DEMO_CLINIC_ID)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ mode: null, activatedAt: null })
  }

  if (!(VALID_MODES as readonly string[]).includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }

  const { error } = await supabase
    .from('coverage_sessions')
    .upsert(
      {
        clinic_id:  DEMO_CLINIC_ID,
        status:     'ACTIVE',
        reason:     mode,
        started_at: now,
        ended_at:   null,
        updated_at: now,
      },
      { onConflict: 'clinic_id' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ mode, activatedAt: now })
}
