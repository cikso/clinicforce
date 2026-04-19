import type { NextRequest } from 'next/server'

const buckets = new Map<string, Map<string, { count: number; resetAt: number }>>()

function getBucket(name: string) {
  let bucket = buckets.get(name)
  if (!bucket) {
    bucket = new Map()
    buckets.set(name, bucket)
  }
  return bucket
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  bucketName: string,
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const bucket = getBucket(bucketName)
  const now = Date.now()

  for (const [k, entry] of bucket) {
    if (entry.resetAt < now) bucket.delete(k)
  }

  const entry = bucket.get(key)
  if (entry && entry.resetAt > now) {
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }
    entry.count += 1
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
  }

  const resetAt = now + windowMs
  bucket.set(key, { count: 1, resetAt })
  return { allowed: true, remaining: limit - 1, resetAt }
}
