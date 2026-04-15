import { describe, it, expect, beforeEach } from 'vitest'
import { enforceRateLimit, clientIp } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

function makeReq(ip: string): NextRequest {
  // Minimal NextRequest-shaped object — enforceRateLimit only reads headers.
  const headers = new Headers({ 'x-forwarded-for': ip })
  return new Request('https://example.com', { headers }) as unknown as NextRequest
}

describe('rate limit (in-memory fallback)', () => {
  beforeEach(() => {
    // Each describe gets a fresh bucket name so previous test state can't leak.
  })

  it('allows up to `max` requests per window, then blocks with 429 + Retry-After', async () => {
    const req = makeReq('10.0.0.1')
    const opts = { name: `test:burst-${Math.random()}`, max: 3, windowSec: 60 }

    for (let i = 0; i < 3; i++) {
      expect(await enforceRateLimit(req, opts)).toBeNull()
    }

    const blocked = await enforceRateLimit(req, opts)
    expect(blocked).not.toBeNull()
    expect(blocked!.status).toBe(429)
    expect(blocked!.headers.get('Retry-After')).toMatch(/^\d+$/)
  })

  it('tracks IPs independently', async () => {
    const a = makeReq('10.0.0.2')
    const b = makeReq('10.0.0.3')
    const opts = { name: `test:isolation-${Math.random()}`, max: 1, windowSec: 60 }

    expect(await enforceRateLimit(a, opts)).toBeNull()
    // Same IP on a second hit is blocked
    expect(await enforceRateLimit(a, opts)).not.toBeNull()
    // Different IP is independent
    expect(await enforceRateLimit(b, opts)).toBeNull()
  })

  it('supports an explicit key (e.g. per-email limit)', async () => {
    const req = makeReq('10.0.0.4')
    const opts = { name: `test:key-${Math.random()}`, max: 1, windowSec: 60 }

    expect(await enforceRateLimit(req, opts, 'alice@example.com')).toBeNull()
    expect(await enforceRateLimit(req, opts, 'alice@example.com')).not.toBeNull()
    // Different key from the same IP is independent
    expect(await enforceRateLimit(req, opts, 'bob@example.com')).toBeNull()
  })
})

describe('clientIp', () => {
  it('extracts the left-most IP from x-forwarded-for', () => {
    const req = makeReq('1.1.1.1, 2.2.2.2, 3.3.3.3')
    expect(clientIp(req)).toBe('1.1.1.1')
  })

  it('falls back to x-real-ip then "unknown"', () => {
    const r1 = new Request('https://x.com', {
      headers: { 'x-real-ip': '9.9.9.9' },
    }) as unknown as NextRequest
    expect(clientIp(r1)).toBe('9.9.9.9')
    const r2 = new Request('https://x.com') as unknown as NextRequest
    expect(clientIp(r2)).toBe('unknown')
  })
})
