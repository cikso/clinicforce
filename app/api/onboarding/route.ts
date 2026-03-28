import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Service role bypasses RLS — safe server-side only
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabaseUser = await createServerClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clinicName, phone, email, suburb, state } = await req.json()
    if (!clinicName) {
      return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Insert clinic name only — other fields saved via Settings
    const { data: clinic, error: clinicErr } = await admin
      .from('clinics')
      .insert({ name: clinicName })
      .select('id')
      .single()

    if (clinicErr || !clinic) {
      console.error('Clinic insert error:', clinicErr)
      return NextResponse.json({ error: clinicErr?.message ?? 'Failed to create clinic' }, { status: 500 })
    }

    // Link user to clinic
    const { error: linkErr } = await admin
      .from('clinic_users')
      .insert({
        user_id: user.id,
        clinic_id: clinic.id,
        name: user.user_metadata?.full_name ?? user.email,
        role: 'admin',
      })

    if (linkErr) {
      console.error('Clinic user link error:', linkErr)
      return NextResponse.json({ error: linkErr.message }, { status: 500 })
    }

    return NextResponse.json({ clinicId: clinic.id })
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: 'Onboarding failed' }, { status: 500 })
  }
}
