import { NextRequest } from 'next/server'
import twilio from 'twilio'

/**
 * Twilio request signature verification — uses Twilio's official SDK
 * validator so there's zero chance of a subtle divergence from how
 * Twilio's server signed the request.
 *
 * URL reconstruction:
 *   Twilio signs the EXACT URL configured in its console. Behind Vercel's
 *   edge the incoming req.url can differ from the public URL (internal
 *   rewrites). We try a set of likely-correct URLs — pinned env base,
 *   req.url, and x-forwarded-proto/host reconstructions — and accept if
 *   any yields a matching HMAC. The auth token gate is unchanged.
 *
 * Regional auth tokens: phone numbers using regional routing (AU1, IE1)
 * are signed with that region's auth token, NOT the US1 token shown on
 * the default console page. `TWILIO_AUTH_TOKEN` must be the regional
 * token matching the number's active routing region.
 */

export type VerifyResult =
  | { valid: true;  params: URLSearchParams }
  | { valid: false; reason: string }

export async function verifyTwilioRequest(req: NextRequest): Promise<VerifyResult> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const skip = process.env.TWILIO_SKIP_SIGNATURE_VALIDATION === 'true'
  const expectedAccountSid = process.env.TWILIO_ACCOUNT_SID

  const rawBody = await req.text()
  const params  = new URLSearchParams(rawBody)

  // Defense-in-depth: always require the webhook body's AccountSid to match
  // our env TWILIO_ACCOUNT_SID. Not as strong as HMAC verification, but
  // stops the common "attacker hit the webhook URL with random form data"
  // class of abuse even when signature verification is disabled.
  if (expectedAccountSid) {
    const bodyAccountSid = params.get('AccountSid')
    if (!bodyAccountSid || bodyAccountSid !== expectedAccountSid) {
      console.error('[verifyTwilioRequest] AccountSid mismatch', {
        expectedPrefix: expectedAccountSid.slice(0, 10),
        gotPrefix:      (bodyAccountSid ?? '').slice(0, 10),
        path:           req.nextUrl.pathname,
      })
      return { valid: false, reason: 'AccountSid mismatch' }
    }
  }

  if (skip) {
    console.warn('[verifyTwilioRequest] TWILIO_SKIP_SIGNATURE_VALIDATION=true — skipping HMAC check (AccountSid still enforced)')
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

  // Build the params object Twilio's validator expects (decoded key/value map).
  const paramMap: Record<string, string> = {}
  for (const [k, v] of params.entries()) {
    paramMap[k] = v
  }

  // Build candidate URLs Twilio might have signed with.
  const base = (process.env.TWILIO_WEBHOOK_BASE_URL ?? '').replace(/\/+$/, '')
  const pathname = req.nextUrl.pathname
  const search   = req.nextUrl.search
  const fwdHost  = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const fwdProto = req.headers.get('x-forwarded-proto') ?? 'https'

  const pathVariants = new Set<string>([
    pathname,
    pathname.endsWith('/') ? pathname.slice(0, -1) : pathname + '/',
  ])

  const urls = new Set<string>()
  for (const p of pathVariants) {
    if (base)    urls.add(`${base}${p}${search}`)
    if (fwdHost) urls.add(`${fwdProto}://${fwdHost}${p}${search}`)
  }
  urls.add(req.url)

  // Try both raw and trimmed auth tokens (covers silent whitespace issues).
  const tokens = authToken === authToken.trim()
    ? [authToken]
    : [authToken, authToken.trim()]

  let matched: string | null = null
  outer: for (const token of tokens) {
    for (const url of urls) {
      if (twilio.validateRequest(token, signature, url, paramMap)) {
        matched = url
        break outer
      }
    }
  }

  if (matched) {
    return { valid: true, params }
  }

  console.error('[verifyTwilioRequest] signature mismatch', {
    triedUrls: Array.from(urls),
    pathname,
    fwdHost,
    fwdProto,
    providedHead: signature.slice(0, 12),
    accountSidPrefix: (paramMap.AccountSid ?? '').slice(0, 10),
    paramCount: Object.keys(paramMap).length,
  })

  return { valid: false, reason: 'Signature mismatch' }
}
