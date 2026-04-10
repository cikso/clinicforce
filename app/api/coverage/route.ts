import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// GET /api/coverage — return current coverage status for this clinic
export async function GET() {
  try {
    const profile = await getClinicProfile()
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .select('status, reason, started_at, updated_at')
      .eq('clinic_id', profile.clinicId)
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
    const profile = await getClinicProfile()
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await req.json()

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .upsert(
        {
          clinic_id:  profile.clinicId,
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
      console.error('[/api/coverage] POST Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/coverage — deactivate coverage
export async function DELETE() {
  try {
    const profile = await getClinicProfile()
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('coverage_sessions')
      .update({
        status:     'INACTIVE',
        ended_at:   new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('clinic_id', profile.clinicId)
      .select()
      .single()

    if (error) {
      console.error('[/api/coverage] DELETE Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
