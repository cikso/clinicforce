/**
 * Twilio request signature validation.
 *
 * Twilio signs every webhook with HMAC-SHA1 over:
 *   <fullUrl> + <sortedFormParamsConcatenated>
 *
 * Reference: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 *
 * We avoid the `twilio` SDK's validateRequest in favour of a tiny handwritten
 * verifier so the Vercel bundle stays lean and Edge-runtime compatible if we
 * ever migrate this route.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

const TWILIO_SIG_HEADER = 'X-Twilio-Signature'

/**
 * @returns true if the signature is valid (or validation is disabled in dev),
 *          false if it should be rejected.
 */
export function validateTwilioSignature(
  req: NextRequest,
  fullUrl: string,
  params: Record<string, string>,
): { valid: boolean; reason?: string } {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    // In production this must be set. In dev we log and allow so localhost
    // tunnelling against real Twilio still works.
    if (process.env.NODE_ENV === 'production') {
      return { valid: false, reason: 'TWILIO_AUTH_TOKEN not set in production' }
    }
    console.warn('[twilio-auth] TWILIO_AUTH_TOKEN not set — skipping validation (dev only)')
    return { valid: true }
  }

  const provided = req.headers.get(TWILIO_SIG_HEADER) ?? req.headers.get('x-twilio-signature')
  if (!provided) return { valid: false, reason: 'missing signature header' }

  // Build signed payload: URL concatenated with sorted key/value pairs.
  const sortedKeys = Object.keys(params).sort()
  const concatenated =
    fullUrl + sortedKeys.map(k => k + params[k]).join('')

  const expected = createHmac('sha1', authToken).update(concatenated).digest('base64')

  const expBuf = Buffer.from(expected)
  const provBuf = Buffer.from(provided)
  if (expBuf.length !== provBuf.length) {
    return { valid: false, reason: 'length mismatch' }
  }
  if (!timingSafeEqual(expBuf, provBuf)) {
    return { valid: false, reason: 'signature mismatch' }
  }
  return { valid: true }
}

/**
 * Reconstruct the original URL Twilio signed. Honours x-forwarded-proto/host
 * (Vercel always sets these) so we validate against the public hostname, not
 * the internal one.
 */
export function reconstructRequestUrl(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!host) return req.url // best effort; will typically fail validation
  const url = new URL(req.url)
  return `${proto}://${host}${url.pathname}${url.search}`
}
