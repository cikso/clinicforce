import { describe, it, expect } from 'vitest'
import { PLAN_LIMITS, planLimit, monthStart } from '@/lib/billing/usage'

describe('PLAN_LIMITS', () => {
  it('escalates as you move up the ladder', () => {
    expect(PLAN_LIMITS.trial).toBeLessThan(PLAN_LIMITS.starter)
    expect(PLAN_LIMITS.starter).toBeLessThan(PLAN_LIMITS.growth)
    expect(PLAN_LIMITS.growth).toBeLessThan(PLAN_LIMITS.enterprise)
    expect(PLAN_LIMITS.enterprise).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('planLimit', () => {
  it('falls back to trial for null/undefined/unknown plans', () => {
    expect(planLimit(null)).toBe(PLAN_LIMITS.trial)
    expect(planLimit(undefined)).toBe(PLAN_LIMITS.trial)
    expect(planLimit('unknown')).toBe(PLAN_LIMITS.trial)
  })
  it('returns the configured limit for known plans', () => {
    expect(planLimit('starter')).toBe(PLAN_LIMITS.starter)
    expect(planLimit('growth')).toBe(PLAN_LIMITS.growth)
    expect(planLimit('enterprise')).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('monthStart', () => {
  it('returns the first of the UTC month at 00:00:00', () => {
    const d = monthStart(new Date('2026-04-15T13:37:00Z'))
    expect(d.toISOString()).toBe('2026-04-01T00:00:00.000Z')
  })
  it('handles year boundary correctly', () => {
    const d = monthStart(new Date('2026-01-03T00:00:00Z'))
    expect(d.toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })
})
