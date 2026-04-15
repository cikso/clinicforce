import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { validateTwilioSignature } from '@/lib/voice/twilio-auth'
import type { NextRequest } from 'next/server'

function reqWithSig(sig: string | null): NextRequest {
  const headers = new Headers()
  if (sig) headers.set('X-Twilio-Signature', sig)
  return new Request('https://example.com/twilio', { headers }) as unknown as NextRequest
}

function sign(secret: string, url: string, params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort()
  const body = url + sortedKeys.map(k => k + params[k]).join('')
  return createHmac('sha1', secret).update(body).digest('base64')
}

describe('validateTwilioSignature', () => {
  const originalEnv = { ...process.env }
  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = 'test-token'
    ;(process.env as Record<string, string>).NODE_ENV = 'production'
  })
  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('accepts a correctly-signed request', () => {
    const url = 'https://app.example.com/api/twilio/incoming'
    const params = { From: '+14155551234', To: '+14155555555', CallSid: 'CA123' }
    const signature = sign('test-token', url, params)

    const result = validateTwilioSignature(reqWithSig(signature), url, params)
    expect(result.valid).toBe(true)
  })

  it('rejects when the signature does not match', () => {
    const url = 'https://app.example.com/api/twilio/incoming'
    const params = { From: '+14155551234', To: '+14155555555' }
    const signature = sign('wrong-token', url, params)

    const result = validateTwilioSignature(reqWithSig(signature), url, params)
    expect(result.valid).toBe(false)
    expect(result.reason).toMatch(/signature mismatch|length/)
  })

  it('rejects when the signature header is missing', () => {
    const result = validateTwilioSignature(reqWithSig(null), 'https://x', { a: 'b' })
    expect(result.valid).toBe(false)
  })

  it('fails closed in production when TWILIO_AUTH_TOKEN is not set', () => {
    delete process.env.TWILIO_AUTH_TOKEN
    const result = validateTwilioSignature(reqWithSig('sig'), 'https://x', { a: 'b' })
    expect(result.valid).toBe(false)
  })

  it('does not leak info via length-based comparison (timing safety)', () => {
    const url = 'https://x/y'
    const params = { a: '1' }
    const correct = sign('test-token', url, params)
    // Same length but wrong — must be rejected
    const tampered = correct.slice(0, -1) + (correct.slice(-1) === 'A' ? 'B' : 'A')
    expect(tampered.length).toBe(correct.length)
    const result = validateTwilioSignature(reqWithSig(tampered), url, params)
    expect(result.valid).toBe(false)
  })
})
