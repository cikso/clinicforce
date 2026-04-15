/**
 * Rate limiter for API routes.
 *
 * Backends (picked automatically):
 *   - Upstash Redis (when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set)
 *   - In-memory LRU-ish map (fallback — safe for dev/single-instance only)
 *
 * The in-memory backend is a BEST EFFORT layer because Vercel runs multiple
 * serverless instances. Configure Upstash in production.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// ── Shared in-memory store (survives hot reload but not cold start) ─────────
type MemEntry = { count: number; resetAt: number }
const memStore = new Map<string, MemEntry>()

function sweep(now: number) {
  for (const [k, v] of memStore) if (v.resetAt < now) memStore.delete(k)
}

// ── Upstash lazy init ───────────────────────────────────────────────────────
let upstash: Redis | null | undefined

function getUpstash(): Redis | null {
  if (upstash !== undefined) return upstash
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    upstash = null
    return null
  }
  upstash = new Redis({ url, token })
  return upstash
}

// ── Public API ──────────────────────────────────────────────────────────────

export type RateLimitOpts = {
  /** Unique identifier for this limiter (e.g. "auth:login") */
  name: string
  /** Max requests per window */
  max: number
  /** Window length (seconds). For Upstash this is a sliding window. */
  windowSec: number
}

const upstashCache = new Map<string, Ratelimit>()
function getUpstashLimiter(opts: RateLimitOpts, redis: Redis): Ratelimit {
  const key = `${opts.name}:${opts.max}:${opts.windowSec}`
  const cached = upstashCache.get(key)
  if (cached) return cached
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.max, `${opts.windowSec} s`),
    prefix: `rl:${opts.name}`,
    analytics: false,
  })
  upstashCache.set(key, limiter)
  return limiter
}

export function clientIp(req: NextRequest): string {
  // x-forwarded-for may be comma-separated. Take the left-most, which is the
  // client per RFC 7239. On Vercel this header is set by the edge network.
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

/**
 * Returns null if allowed, or a 429 NextResponse if blocked.
 *
 * @example
 *   const blocked = await enforceRateLimit(req, { name: 'auth:login', max: 5, windowSec: 900 })
 *   if (blocked) return blocked
 */
export async function enforceRateLimit(
  req: NextRequest,
  opts: RateLimitOpts,
  key?: string,
): Promise<NextResponse | null> {
  const id = key ?? clientIp(req)
  const redis = getUpstash()

  if (redis) {
    const limiter = getUpstashLimiter(opts, redis)
    try {
      const { success, reset, limit, remaining } = await limiter.limit(`${opts.name}:${id}`)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
            },
          },
        )
      }
      return null
    } catch (err) {
      // If Upstash is unreachable, fall through to in-memory rather than fail open
      console.error('[rate-limit] upstash error — falling back to memory:', err)
    }
  }

  // In-memory fallback
  const now = Date.now()
  sweep(now)
  const memKey = `${opts.name}:${id}`
  const entry = memStore.get(memKey)
  if (entry && entry.resetAt > now) {
    if (entry.count >= opts.max) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          },
        },
      )
    }
    entry.count += 1
    return null
  }
  memStore.set(memKey, { count: 1, resetAt: now + opts.windowSec * 1000 })
  return null
}
