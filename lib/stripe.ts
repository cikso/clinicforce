/**
 * Stripe server-side client + price <-> plan mapping.
 *
 * Price IDs come from STRIPE env vars rather than being hardcoded, so you can
 * swap prices per environment without a code change. Defaults fall back to the
 * live prices created on 2026-04-15 in the ClinicForce account.
 */

import Stripe from 'stripe'

let cachedClient: Stripe | null = null

export function getStripe(): Stripe {
  if (cachedClient) return cachedClient
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  cachedClient = new Stripe(key, { typescript: true })
  return cachedClient
}

// ── Plan configuration ───────────────────────────────────────────────────────
// Maps our internal plan key (matches `subscriptions.plan` enum) to the
// Stripe price id used for checkout. Set the STRIPE_PRICE_* envs in Vercel
// if you want to override the defaults.

export type PlanKey = 'starter' | 'growth' | 'enterprise'

export const PLAN_TO_PRICE: Record<Exclude<PlanKey, 'enterprise'>, string> = {
  starter: process.env.STRIPE_PRICE_STARTER ?? 'price_1TL09eJ08Msrl6WLqARehvJ0',
  growth: process.env.STRIPE_PRICE_GROWTH ?? 'price_1TL09gJ08Msrl6WL9yq6KSSF',
}

// Reverse map: Stripe price id -> plan key. Used in webhook handler.
export function planForPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null
  for (const [plan, id] of Object.entries(PLAN_TO_PRICE)) {
    if (id === priceId) return plan as PlanKey
  }
  return null
}
