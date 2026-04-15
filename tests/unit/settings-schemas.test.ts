import { describe, it, expect } from 'vitest'
import {
  SETTINGS_TABLE_SCHEMAS,
  SettingsRequestSchema,
} from '@/lib/validation/schemas'

describe('SETTINGS_TABLE_SCHEMAS — privilege escalation guard', () => {
  it('clinic_users role enum forbids platform_owner and clinic_admin', () => {
    const schema = SETTINGS_TABLE_SCHEMAS.clinic_users
    // Allowed: lateral moves between staff roles
    expect(schema.parse({ role: 'receptionist' }).role).toBe('receptionist')
    expect(schema.parse({ role: 'staff' }).role).toBe('staff')
    expect(schema.parse({ role: 'nurse' }).role).toBe('nurse')
    expect(schema.parse({ role: 'vet' }).role).toBe('vet')
    // Blocked: privilege escalation through this endpoint
    expect(() => schema.parse({ role: 'platform_owner' })).toThrow()
    expect(() => schema.parse({ role: 'clinic_admin' })).toThrow()
    // Garbage input is rejected
    expect(() => schema.parse({ role: 'admin' })).toThrow()
  })

  it('clinic_invites role enum allows clinic_admin (intentional)', () => {
    // Note: this is fine — invites still require clinic_admin/platform_owner
    // to send. The route enforces that gate, the schema just shapes the data.
    const schema = SETTINGS_TABLE_SCHEMAS.clinic_invites
    expect(schema.parse({ email: 'a@b.com', role: 'clinic_admin' }).role).toBe('clinic_admin')
    expect(() => schema.parse({ email: 'a@b.com', role: 'platform_owner' })).toThrow()
  })

  it('clinics schema rejects unknown fields silently (zod default strip)', () => {
    const schema = SETTINGS_TABLE_SCHEMAS.clinics
    const out = schema.parse({
      name: 'Acme',
      // attempt to write to a sensitive column that is NOT in the allowlist
      onboarding_completed: true,
      industry_config: { evil: true },
    } as Record<string, unknown>) as Record<string, unknown>
    expect(out.name).toBe('Acme')
    expect(out.onboarding_completed).toBeUndefined()
    expect(out.industry_config).toBeUndefined()
  })

  it('voice_agents schema only allows the listed columns', () => {
    const schema = SETTINGS_TABLE_SCHEMAS.voice_agents
    const out = schema.parse({
      mode: 'DAYTIME',
      // not in allowlist
      clinic_id: 'cba0...',
    } as Record<string, unknown>) as Record<string, unknown>
    expect(out.mode).toBe('DAYTIME')
    expect(out.clinic_id).toBeUndefined()
  })
})

describe('SettingsRequestSchema — outer envelope', () => {
  it('rejects unknown table names', () => {
    expect(() =>
      SettingsRequestSchema.parse({ table: 'audit_log', data: {} }),
    ).toThrow()
  })

  it('requires a uuid id when supplied', () => {
    expect(() =>
      SettingsRequestSchema.parse({ table: 'clinics', data: {}, id: 'not-a-uuid' }),
    ).toThrow()
  })

  it('accepts a minimal valid payload', () => {
    const out = SettingsRequestSchema.parse({
      table: 'clinics',
      data: { name: 'Acme' },
    })
    expect(out.table).toBe('clinics')
  })
})
