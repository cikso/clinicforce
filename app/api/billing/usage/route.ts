import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { getMonthlyUsage } from '@/lib/billing/usage'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const blocked = await enforceRateLimit(req, {
    name: 'billing:usage',
    max: 60,
    windowSec: 60,
  })
  if (blocked) return blocked

  const profile = await getClinicProfile()
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const snapshot = await getMonthlyUsage(service, profile.clinicId)

  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  })
}
