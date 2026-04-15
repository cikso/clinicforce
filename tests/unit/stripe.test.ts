import { describe, it, expect } from 'vitest'
import { PLAN_TO_PRICE, planForPriceId } from '@/lib/stripe'

describe('Stripe price <-> plan mapping', () => {
  it('maps every configured plan to a non-empty price id', () => {
    for (const [plan, priceId] of Object.entries(PLAN_TO_PRICE)) {
      expect(typeof priceId).toBe('string')
      expect(priceId.length).toBeGreaterThan(0)
      expect(priceId.startsWith('price_')).toBe(true)
      expect(plan).toMatch(/^(starter|growth)$/)
    }
  })

  it('round-trips: planForPriceId(PLAN_TO_PRICE[plan]) === plan', () => {
    for (const plan of Object.keys(PLAN_TO_PRICE) as Array<keyof typeof PLAN_TO_PRICE>) {
      expect(planForPriceId(PLAN_TO_PRICE[plan])).toBe(plan)
    }
  })

  it('returns null for unknown or null price ids', () => {
    expect(planForPriceId(null)).toBeNull()
    expect(planForPriceId('price_notreal')).toBeNull()
    expect(planForPriceId('')).toBeNull()
  })
})
