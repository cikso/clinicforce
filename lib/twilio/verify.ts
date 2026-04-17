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
 *   incoming req.url can differ from the public URL (internal rewrites,
 *   localhost, etc). We try a set of likely-correct URLs — pinned env base,
 *   req.url, and x-forwarded-proto/host reconstructions — and accept if any
 *   yields a matching HMAC. This tolerates different proxy setups without
 *   opening a hole (the auth token is still required to match Twilio's).
 */

export type VerifyResult =
  | { valid: true;  params: URLSearchParams }
  | { valid: false; reason: string }

function eq(a: string, b: string): boolean {
  const A = Buffer.from(a)
  const B = Buffer.from(b)
  return A.length === B.length && timingSafeEqual(A, B)
}

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

  // Canonicalise the body per Twilio's spec: sort form params alphabetically
  // by name, then concatenate name+value pairs with no separator.
  const entries = Array.from(params.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const joined = entries.map(([k, v]) => `${k}${v}`).join('')

  // Build the set of candidate URLs Twilio might have signed with.
  const base = (process.env.TWILIO_WEBHOOK_BASE_URL ?? '').replace(/\/+$/, '')
  const pathname = req.nextUrl.pathname
  const search   = req.nextUrl.search
  const fwdHost  = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const fwdProto = req.headers.get('x-forwarded-proto') ?? 'https'

  // Pathname variants — trailing slash matters to Twilio's signer but the
  // slash must sit between the path and the query string, not at the end of
  // the whole URL. Toggle on the pathname only, then append the search string.
  const pathVariants = new Set<string>([
    pathname,
    pathname.endsWith('/') ? pathname.slice(0, -1) : pathname + '/',
  ])

  const urls = new Set<string>()
  for (const p of pathVariants) {
    if (base)    urls.add(`${base}${p}${search}`)
    if (fwdHost) urls.add(`${fwdProto}://${fwdHost}${p}${search}`)
  }
  // req.url is already formed with its own path+query; include verbatim.
  urls.add(req.url)

  let matched: string | null = null

  // Copy-pasting the token through Vercel's env UI can leave a trailing
  // newline or whitespace. Try both the raw and trimmed values before
  // rejecting — if the trimmed one succeeds, the user has a silent env
  // var hygiene problem and we self-heal until they clean it up.
  const tokens = authToken === authToken.trim()
    ? [authToken]
    : [authToken, authToken.trim()]

  for (const token of tokens) {
    for (const url of urls) {
      const expected = createHmac('sha1', token).update(`${url}${joined}`).digest('base64')
      if (eq(expected, signature)) {
        matched = url
        break
      }
    }
    if (matched) break
  }

  if (matched) {
    return { valid: true, params }
  }

  // Diagnostic log — never includes the token or full body. Safe to keep on.
  const keyList = entries.map(([k]) => k).join(',')
  console.error('[verifyTwilioRequest] signature mismatch', JSON.stringify({
    triedUrls: Array.from(urls),
    pathname,
    fwdHost,
    fwdProto,
    providedHead: signature.slice(0, 12),
    tokenConfigured: true,
    tokenLen: authToken.length,
    tokenTrimmedLen: authToken.trim().length,
    tokenHasSurroundingWhitespace: authToken !== authToken.trim(),
    accountSidPrefix: (params.get('AccountSid') ?? '').slice(0, 10),
    paramKeys: keyList,
    paramCount: entries.length,
  }))

  return { valid: false, reason: 'Signature mismatch' }
}
