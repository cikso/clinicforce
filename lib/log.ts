/**
 * Redacted logger.
 *
 * Two helpers used in webhook + auth hot paths to avoid PII landing in
 * Vercel logs (which are visible to anyone with project access).
 *
 *   redactPhone('+61412345678')      → '+61***5678'
 *   redactEmail('jane@example.com')  → 'j***@example.com'
 *
 * Also exposes `safeStringify` which strips a known set of PII keys before
 * JSON-encoding an object for log output.
 */

const PII_KEYS = new Set([
  'caller_name',
  'caller_phone',
  'phone',
  'phone_number',
  'pet_name',
  'patient_name',
  'patient_phone',
  'email',
  'full_name',
  'fullname',
  'name',
  'address',
  'transcript',
  'transcript_summary',
  'summary',
  'call_summary',
  'ai_detail',
  'message',
  'follow_up_text',
  'comment',
  'staff_notes',
])

export function redactPhone(raw: string | null | undefined): string {
  if (!raw) return ''
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length < 4) return '***'
  return `${raw.startsWith('+') ? '+' : ''}***${digits.slice(-4)}`
}

export function redactEmail(raw: string | null | undefined): string {
  if (!raw || !raw.includes('@')) return '***'
  const [user, domain] = raw.split('@')
  return `${user.charAt(0)}***@${domain}`
}

/** Recursively replace any value at a known PII key with the string '[redacted]'. */
export function redactPii<T>(input: T): T {
  if (input === null || input === undefined) return input
  if (Array.isArray(input)) return input.map(redactPii) as unknown as T
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (PII_KEYS.has(k.toLowerCase())) {
        out[k] = '[redacted]'
      } else {
        out[k] = redactPii(v)
      }
    }
    return out as unknown as T
  }
  return input
}

/** JSON.stringify with PII redaction. Always safe to put in console.log. */
export function safeStringify(input: unknown): string {
  try {
    return JSON.stringify(redactPii(input))
  } catch {
    return '[unserialisable]'
  }
}
