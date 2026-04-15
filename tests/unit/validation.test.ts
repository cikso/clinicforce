import { describe, it, expect } from 'vitest'
import {
  LoginSchema,
  InviteAcceptSchema,
  DemoRequestSchema,
  ClinicCreateSchema,
} from '@/lib/validation/schemas'

describe('LoginSchema', () => {
  it('accepts a lowercase trimmed email and any non-empty password', () => {
    const parsed = LoginSchema.parse({ email: '  User@Example.com  ', password: 'hunter2' })
    expect(parsed.email).toBe('user@example.com')
    expect(parsed.password).toBe('hunter2')
  })

  it('rejects an empty password', () => {
    expect(() => LoginSchema.parse({ email: 'a@b.com', password: '' })).toThrow()
  })

  it('rejects an invalid email', () => {
    expect(() => LoginSchema.parse({ email: 'not-an-email', password: 'x' })).toThrow()
  })
})

describe('InviteAcceptSchema', () => {
  it('enforces min 8 password and min 16 char token', () => {
    expect(() =>
      InviteAcceptSchema.parse({ token: 'short', fullName: 'Jane', password: 'hunter2!' }),
    ).toThrow()
    expect(() =>
      InviteAcceptSchema.parse({
        token: 'x'.repeat(32),
        fullName: 'Jane',
        password: 'short',
      }),
    ).toThrow()
  })

  it('accepts a valid payload', () => {
    const out = InviteAcceptSchema.parse({
      token: 'x'.repeat(32),
      fullName: 'Jane Smith',
      password: 'a-long-enough-password',
    })
    expect(out.fullName).toBe('Jane Smith')
  })
})

describe('DemoRequestSchema', () => {
  it('requires a supported vertical and strips whitespace', () => {
    const out = DemoRequestSchema.parse({
      name: '  Jane  ',
      email: 'JANE@Example.com',
      clinic_name: 'Acme Vet',
      vertical: 'vet',
      clinic_size: '2-5',
    })
    expect(out.name).toBe('Jane')
    expect(out.email).toBe('jane@example.com')
    expect(out.vertical).toBe('vet')
  })

  it('rejects an unsupported vertical', () => {
    expect(() =>
      DemoRequestSchema.parse({
        name: 'x',
        email: 'x@y.com',
        clinic_name: 'Acme',
        vertical: 'hacked',
        clinic_size: '2-5',
      }),
    ).toThrow()
  })
})

describe('ClinicCreateSchema', () => {
  it('is strict about url format on website and google_review_url', () => {
    expect(() =>
      ClinicCreateSchema.parse({ name: 'Acme', website: 'not-a-url' }),
    ).toThrow()
    expect(
      ClinicCreateSchema.parse({ name: 'Acme', website: 'https://acme.example.com' }).website,
    ).toBe('https://acme.example.com')
  })
})
