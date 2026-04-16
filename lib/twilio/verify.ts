import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Twilio request signature verification.
 *
 * Twilio signs every webhook POST with X-Twilio-Signature:
 *   base64( HMAC-SHA1( authToken, fullUrl + sortedConcatenatedPostParams ) )
 *
 * Reference: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 *
 * Because reading a request body consumes the stream, we read the raw text
 * here (once) and return the parsed params so route handlers can reuse them.
 * This replaces the old `await req.formData()` call.
 *
 * URL reconstruction:
 *   Twilio signs the EXACT URL configured in its console. Behind Vercel the
 *   incoming req.url is already the public URL, but we allow an override via
 *   TWILIO_WEBHOOK_BASE_URL for environments where forwarding rewrites the
 *   host (e.g. tunnel URLs for local testing).
 */

export type VerifyResult =
  | { valid: true;  params: URLSearchParams }
  | { valid: false; reason: string }

export async function verifyTwilioRequest(req: NextRequest): Promise<VerifyResult> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const skip = process.env.TWILIO_SKIP_SIGNATURE_VALIDATION === 'true'

  const rawBody = await req.text()
  const params  = new URLSearchParams(rawBody)

  if (skip) {
    console.warn('[verifyTwilioRequest] TWILIO_SKIP_SIGNATURE_VALIDATION=true — skipping validation (dev only)')
    return { valid: true, params }
  }

  if (!authToken) {
    console.error('[verifyTwilioRequest] TWILIO_AUTH_TOKEN not set — rejecting webhook')
    return { valid: false, reason: 'TWILIO_AUTH_TOKEN not configured' }
  }

  const signature = req.headers.get('x-twilio-signature')
  if (!signature) {
    return { valid: false, reason: 'Missing X-Twilio-Signature header' }
  }

  // Reconstruct the URL Twilio used to compute the signature.
  // Prefer explicit base URL — it removes any ambiguity from proxy headers.
  const base = (process.env.TWILIO_WEBHOOK_BASE_URL ?? '').replace(/\/+$/, '')
  const url  = base
    ? `${base}${req.nextUrl.pathname}${req.nextUrl.search}`
    : req.url

  // Canonicalise the body per Twilio's spec: sort form params alphabetically
  // by name, then concatenate name+value pairs with no separator. A form may
  // legitimately contain repeated keys (e.g. MediaUrl0 / MediaUrl1, or any
  // key posted twice) — `params.get(key)` only returns the first value, so we
  // iterate entries and sort stably by key to preserve every value.
  const entries = Array.from(params.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const joined = entries.map(([k, v]) => `${k}${v}`).join('')
  const signingString = `${url}${joined}`

  const expected = createHmac('sha1', authToken).update(signingString).digest('base64')

  const expectedBuf = Buffer.from(expected)
  const providedBuf = Buffer.from(signature)
  if (expectedBuf.length !== providedBuf.length) {
    return { valid: false, reason: 'Signature length mismatch' }
  }
  if (!timingSafeEqual(expectedBuf, providedBuf)) {
    return { valid: false, reason: 'Signature mismatch' }
  }

  return { valid: true, params }
}
