import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated', authError: authError?.message })
    }

    // Check what the service role key looks like (first 40 chars only for safety)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const keyPreview = serviceRoleKey.slice(0, 80) + '...'

    // Decode the JWT payload to check the role claim
    let keyRole = 'unknown'
    try {
      const parts = serviceRoleKey.split('.')
      if (parts[1]) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        keyRole = payload.role ?? 'missing'
      }
    } catch { keyRole = 'parse-error' }

    // Now do the service role lookup
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: cu, error: cuError } = await service
      .from('clinic_users')
      .select('id, name, role, clinic_id, clinics(id, name, onboarding_completed)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      serviceRoleKey: {
        preview: keyPreview,
        decodedRole: keyRole,
      },
      clinicUser: cu ?? null,
      clinicUserError: cuError?.message ?? null,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
