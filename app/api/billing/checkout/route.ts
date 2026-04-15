import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { getStripe, PLAN_TO_PRICE } from '@/lib/stripe'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import { parseJsonBody } from '@/lib/validation/respond'
import { enforceRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

const BodySchema = z.object({
  plan: z.enum(['starter', 'growth']),
})

export async function POST(req: NextRequest) {
  const blocked = await enforceRateLimit(req, {
    name: 'billing:checkout',
    max: 10,
    windowSec: 60,
  })
  if (blocked) return blocked

  const profile = await getClinicProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['clinic_admin', 'platform_owner'].includes(profile.userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = await parseJsonBody(req, BodySchema)
  if (!parsed.ok) return parsed.response
  const priceId = PLAN_TO_PRICE[parsed.data.plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Reuse existing Stripe customer if we have one on the subscription row.
  const { data: sub } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('clinic_id', profile.clinicId)
    .maybeSingle()

  const stripe = getStripe()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.clinicforce.io'

  let customerId = sub?.stripe_customer_id ?? null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: undefined, // email is not stored on the profile; user enters in Checkout
      name: profile.clinicName,
      metadata: { clinic_id: profile.clinicId },
    })
    customerId = customer.id
    // Upsert the subscriptions row with the customer id. Plan/status come later via webhook.
    await service.from('subscriptions').upsert(
      {
        clinic_id: profile.clinicId,
        stripe_customer_id: customerId,
        plan: 'trial',
        status: 'trialing',
      },
      { onConflict: 'clinic_id' },
    )
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    // Pass clinic_id through so the webhook can correlate back.
    client_reference_id: profile.clinicId,
    subscription_data: {
      metadata: { clinic_id: profile.clinicId },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    success_url: `${siteUrl}/settings/billing?checkout=success`,
    cancel_url: `${siteUrl}/settings/billing?checkout=cancelled`,
  })

  logAudit({
    action: 'billing.checkout.created',
    clinicId: profile.clinicId,
    actorId: profile.userId,
    resource: `stripe_session:${session.id}`,
    metadata: { plan: parsed.data.plan, price_id: priceId },
  }, req)

  return NextResponse.json({ url: session.url })
}
