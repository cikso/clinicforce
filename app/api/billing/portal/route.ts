import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { enforceRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const blocked = await enforceRateLimit(req, {
    name: 'billing:portal',
    max: 20,
    windowSec: 60,
  })
  if (blocked) return blocked

  const profile = await getClinicProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['clinic_admin', 'platform_owner'].includes(profile.userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data: sub } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('clinic_id', profile.clinicId)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer on file. Start a subscription first.' },
      { status: 400 },
    )
  }

  const stripe = getStripe()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.clinicforce.io'
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl}/settings/billing`,
  })

  logAudit({
    action: 'billing.portal.opened',
    clinicId: profile.clinicId,
    actorId: profile.userId,
  }, req)

  return NextResponse.json({ url: session.url })
}
