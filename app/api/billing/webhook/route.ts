import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { getStripe, planForPriceId } from '@/lib/stripe'
import { logAudit } from '@/lib/audit'

// Stripe sends webhooks that must be verified using the raw request body.
// Do not parse .json() before calling constructEvent — it destroys the signature.
export const runtime = 'nodejs'

function getService() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

type SubRow = {
  clinic_id: string
  plan: string
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  monthly_price_aud: number | null
}

function subToRow(sub: Stripe.Subscription): Partial<SubRow> {
  const item = sub.items.data[0]
  const priceId = item?.price?.id
  const plan = planForPriceId(priceId) ?? 'starter'
  const unit = item?.price?.unit_amount ?? null

  // Stripe v2025 moved period to the item; fall back to the subscription for older data.
  const sAny = sub as unknown as { current_period_start?: number; current_period_end?: number }
  const iAny = item as unknown as { current_period_start?: number; current_period_end?: number } | undefined
  const periodStart = iAny?.current_period_start ?? sAny.current_period_start ?? null
  const periodEnd = iAny?.current_period_end ?? sAny.current_period_end ?? null

  const statusMap: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    paused: 'paused',
    incomplete: 'trialing',
    incomplete_expired: 'cancelled',
  }

  return {
    plan,
    status: statusMap[sub.status] ?? 'trialing',
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    monthly_price_aud: unit != null ? unit / 100 : null,
  }
}

async function resolveClinicId(sub: Stripe.Subscription): Promise<string | null> {
  // Preferred: subscription metadata.clinic_id (set at checkout)
  const metaClinic = sub.metadata?.clinic_id
  if (metaClinic) return metaClinic

  // Fallback: look up by stripe_customer_id
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const service = getService()
  const { data } = await service
    .from('subscriptions')
    .select('clinic_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return (data?.clinic_id as string | undefined) ?? null
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const clinicId = await resolveClinicId(sub)
  if (!clinicId) {
    console.error('[billing/webhook] cannot resolve clinic_id for subscription', sub.id)
    return
  }
  const row = subToRow(sub)
  const service = getService()
  const { error } = await service
    .from('subscriptions')
    .upsert({ clinic_id: clinicId, ...row }, { onConflict: 'clinic_id' })
  if (error) {
    console.error('[billing/webhook] upsert error', error.message)
    return
  }
  logAudit({
    action: `billing.subscription.${sub.status}`,
    clinicId,
    resource: `stripe_subscription:${sub.id}`,
    metadata: { plan: row.plan, stripe_status: sub.status },
  })
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[billing/webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const raw = await req.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[billing/webhook] bad signature', msg)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const subId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          await upsertFromSubscription(sub)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertFromSubscription(event.data.object as Stripe.Subscription)
        break
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        const subField = (inv as unknown as { subscription?: string | Stripe.Subscription }).subscription
        const subId = typeof subField === 'string' ? subField : subField?.id
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          await upsertFromSubscription(sub)
        }
        break
      }
      default:
        // Ignore everything else — be intentional about what we handle.
        break
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[billing/webhook] handler error for ${event.type}`, msg)
    // Return 500 so Stripe retries. The constructEvent already succeeded,
    // so this is a real internal failure, not a bad signature.
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
