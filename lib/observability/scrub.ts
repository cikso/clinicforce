import type { ErrorEvent, EventHint } from '@sentry/nextjs'

/**
 * Strip PII from Sentry events before they leave the app.
 *
 * ClinicForce handles Australian caller phone numbers, patient names, and
 * voice-call transcripts. None of that belongs in Sentry — we want the stack
 * and a few tags, not the data. This scrubber runs in `beforeSend` on both
 * browser and server. If it throws we drop the event rather than risk
 * leaking unscrubbed data.
 *
 * Conservative rules:
 *   • Drop request cookies + body entirely (session tokens, form payloads).
 *   • Mask Authorization / x-twilio-signature / xi-api-key headers.
 *   • Replace phone-number and email literals in message + breadcrumbs.
 *   • Trim long strings in breadcrumbs (transcripts can run thousands of chars).
 */

// Australian mobile / landline or E.164 — match broadly then redact
const PHONE_RE = /(\+?61[\s-]?)?\(?0?[2-478][\s-]?\)?[\s-]?\d{3,4}[\s-]?\d{3,4}|\+?\d{10,15}/g
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const MAX_BREADCRUMB_STRING = 500

function redactString(input: unknown): unknown {
  if (typeof input !== 'string') return input
  let out = input.replace(PHONE_RE, '[phone]').replace(EMAIL_RE, '[email]')
  if (out.length > MAX_BREADCRUMB_STRING) {
    out = out.slice(0, MAX_BREADCRUMB_STRING) + '…[truncated]'
  }
  return out
}

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'x-twilio-signature',
  'xi-api-key',
  'elevenlabs-signature',
  'x-api-secret',
])

export function scrubEvent(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
  try {
    // Request — drop cookies + body, mask sensitive headers, redact URL query
    if (event.request) {
      delete event.request.cookies
      delete event.request.data
      if (event.request.headers) {
        for (const key of Object.keys(event.request.headers)) {
          if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
            event.request.headers[key] = '[redacted]'
          }
        }
      }
      if (typeof event.request.query_string === 'string') {
        event.request.query_string = redactString(event.request.query_string) as string
      }
    }

    // User — keep id/role only, drop email/ip/name
    if (event.user) {
      const { id, segment } = event.user
      event.user = { id, segment }
    }

    // Message
    if (typeof event.message === 'string') {
      event.message = redactString(event.message) as string
    }

    // Exception values
    for (const ex of event.exception?.values ?? []) {
      if (typeof ex.value === 'string') {
        ex.value = redactString(ex.value) as string
      }
    }

    // Breadcrumbs — scrub message + stringified data
    for (const b of event.breadcrumbs ?? []) {
      if (typeof b.message === 'string') {
        b.message = redactString(b.message) as string
      }
      if (b.data) {
        for (const k of Object.keys(b.data)) {
          b.data[k] = redactString(b.data[k])
        }
      }
    }

    return event
  } catch {
    // If the scrubber itself breaks, drop the event — safer than leaking raw.
    return null
  }
}
