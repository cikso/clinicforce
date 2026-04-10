import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

export async function POST(req: NextRequest) {
  const profile = await getClinicProfile()
  if (!profile?.isPlatformOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.clinicId) {
    return NextResponse.json({ error: 'clinicId required' }, { status: 400 })
  }

  // Validate clinic exists
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('id', body.clinicId)
    .maybeSingle()

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  cookieStore.set('cf_active_clinic', body.clinicId, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: true,
    httpOnly: true,
  })

  return NextResponse.json({ ok: true })
}
