import { describe, it, expect } from 'vitest'
import { redactPhone, redactEmail, redactPii, safeStringify } from '@/lib/log'

describe('redactPhone', () => {
  it('keeps only the last four digits', () => {
    expect(redactPhone('+61412345678')).toBe('+***5678')
    expect(redactPhone('0412345678')).toBe('***5678')
  })
  it('returns empty for falsy input', () => {
    expect(redactPhone(null)).toBe('')
    expect(redactPhone(undefined)).toBe('')
    expect(redactPhone('')).toBe('')
  })
  it('returns *** for very short input', () => {
    expect(redactPhone('12')).toBe('***')
  })
})

describe('redactEmail', () => {
  it('reveals only the first character of the local part', () => {
    expect(redactEmail('jane@example.com')).toBe('j***@example.com')
  })
  it('returns *** when missing @', () => {
    expect(redactEmail('not-an-email')).toBe('***')
    expect(redactEmail(null)).toBe('***')
  })
})

describe('redactPii', () => {
  it('replaces known PII keys at any depth', () => {
    const input = {
      ok: true,
      caller_phone: '+61412345678',
      payload: {
        transcript: [{ role: 'user', message: 'My pet is sick' }],
        analysis: { transcript_summary: 'Caller worried about their dog' },
        keep: 'this is fine',
      },
    }
    const out = redactPii(input)
    expect(out.ok).toBe(true)
    expect(out.caller_phone).toBe('[redacted]')
    expect(out.payload.transcript).toBe('[redacted]')
    expect(out.payload.analysis.transcript_summary).toBe('[redacted]')
    expect(out.payload.keep).toBe('this is fine')
  })

  it('handles arrays', () => {
    const out = redactPii([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 40 },
    ])
    expect(out[0].name).toBe('[redacted]')
    expect(out[0].age).toBe(30)
  })

  it('passes primitives through', () => {
    expect(redactPii('hello')).toBe('hello')
    expect(redactPii(42)).toBe(42)
    expect(redactPii(null)).toBe(null)
  })
})

describe('safeStringify', () => {
  it('serialises after redacting PII', () => {
    const json = safeStringify({ caller_name: 'Jane', ok: true })
    const parsed = JSON.parse(json)
    expect(parsed.caller_name).toBe('[redacted]')
    expect(parsed.ok).toBe(true)
  })
})
