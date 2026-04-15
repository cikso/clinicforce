import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { parseJsonBody } from '@/lib/validation/respond'
import { logAudit } from '@/lib/audit'
import { enforceRateLimit } from '@/lib/rate-limit'

const Body = z.object({ clinicId: z.string().uuid() })

export async function POST(req: NextRequest) {
  const blocked = await enforceRateLimit(req, {
    name: 'clinic-switch',
    max: 30,
    windowSec: 60,
  })
  if (blocked) return blocked

  const profile = await getClinicProfile()
  if (!profile?.isPlatformOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = await parseJsonBody(req, Body)
  if (!parsed.ok) return parsed.response
  const { clinicId } = parsed.data

  // Validate clinic exists
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('id', clinicId)
    .maybeSingle()

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  cookieStore.set('cf_active_clinic', clinicId, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: true,
    httpOnly: true,
  })

  logAudit({
    action: 'admin.clinic.switched',
    clinicId,
    actorId: profile.userId,
    resource: `clinic:${clinicId}`,
  }, req)

  return NextResponse.json({ ok: true })
}
