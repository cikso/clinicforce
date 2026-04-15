/**
 * Zod schemas for validated request bodies across the API surface.
 *
 * Usage:
 *   const parsed = LoginSchema.safeParse(await request.json().catch(() => null))
 *   if (!parsed.success) return badRequest(parsed.error)
 */

import { z } from 'zod'

// ── Primitives ───────────────────────────────────────────────────────────────

export const nonEmptyString = z.string().trim().min(1)
export const email = z.string().trim().toLowerCase().email().max(254)
export const password = z.string().min(8).max(512)
export const phone = z.string().trim().min(6).max(32).optional().nullable()
export const uuid = z.string().uuid()

// ── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email,
  password: z.string().min(1).max(512), // don't enforce min-8 on sign-in; only on create
})
export type LoginInput = z.infer<typeof LoginSchema>

export const InviteAcceptSchema = z.object({
  token: z.string().trim().min(16).max(256),
  fullName: nonEmptyString.max(120),
  password,
})
export type InviteAcceptInput = z.infer<typeof InviteAcceptSchema>

// ── Public demo request ──────────────────────────────────────────────────────

export const DemoRequestSchema = z.object({
  name: nonEmptyString.max(120),
  email,
  phone: z.string().trim().max(32).optional().nullable(),
  clinic_name: nonEmptyString.max(200),
  vertical: z.enum(['vet', 'dental', 'gp', 'chiro']),
  clinic_size: nonEmptyString.max(50),
  message: z.string().trim().max(2000).optional().nullable(),
  source: z.string().trim().max(100).default('landing_page').optional(),
  website: z.string().optional(), // honeypot — should be empty
})
export type DemoRequestInput = z.infer<typeof DemoRequestSchema>

// ── Admin: clinic management ─────────────────────────────────────────────────

export const ClinicCreateSchema = z.object({
  name: nonEmptyString.max(200),
  phone: z.string().trim().max(32).optional().nullable(),
  email: email.optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  suburb: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(20).optional().nullable(),
  postcode: z.string().trim().max(20).optional().nullable(),
  website: z.string().trim().url().max(500).optional().nullable(),
  vertical: z.enum(['vet', 'dental', 'gp', 'chiro']).optional(),
  services: z.string().trim().max(2000).optional().nullable(),
  clinic_hours: z.string().trim().max(500).optional().nullable(),
  after_hours_partner: z.string().trim().max(200).optional().nullable(),
  after_hours_phone: z.string().trim().max(32).optional().nullable(),
  emergency_partner_address: z.string().trim().max(500).optional().nullable(),
  voice_phone: z.string().trim().max(32).optional().nullable(),
  timezone: z.string().trim().max(64).optional(),
  google_review_url: z.string().trim().url().max(500).optional().nullable(),
})
export type ClinicCreateInput = z.infer<typeof ClinicCreateSchema>

export const ClinicUpdateSchema = ClinicCreateSchema.partial()
export type ClinicUpdateInput = z.infer<typeof ClinicUpdateSchema>

// ── /api/settings — generic update endpoint ──────────────────────────────────
//
// The route accepts { table, data, id?, clinicId? } and used to forward `data`
// straight to .update(...). That allowed a receptionist to POST
// {table: 'clinic_users', data: {role: 'platform_owner'}} and self-promote.
//
// These per-table schemas define exactly which fields are mutable through this
// endpoint. Anything not listed is silently dropped before hitting the DB.

const SettingsClinicSchema = z.object({
  name: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(32).optional().nullable(),
  email: email.optional().nullable(),
  website: z.string().trim().url().max(500).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  suburb: z.string().trim().max(120).optional().nullable(),
  postcode: z.string().trim().max(20).optional().nullable(),
  vertical: z.enum(['vet', 'dental', 'gp', 'chiro', 'allied_health', 'specialist']).optional(),
  services: z.string().trim().max(2000).optional().nullable(),
  clinic_hours: z.string().trim().max(500).optional().nullable(),
  business_hours: z.record(z.string(), z.string()).optional().nullable(),
  call_handling_prefs: z.record(z.string(), z.unknown()).optional().nullable(),
  urgent_rules: z.record(z.string(), z.unknown()).optional().nullable(),
  after_hours_partner: z.string().trim().max(200).optional().nullable(),
  after_hours_phone: z.string().trim().max(32).optional().nullable(),
  emergency_partner_address: z.string().trim().max(500).optional().nullable(),
  google_review_url: z.string().trim().url().max(500).optional().nullable(),
  timezone: z.string().trim().max(64).optional(),
  subject_label: z.enum(['pet', 'patient', 'client']).optional(),
  professional_title: z.string().trim().max(120).optional().nullable(),
})

const SettingsVoiceAgentSchema = z.object({
  is_active: z.boolean().optional(),
  mode: z.enum(['DAYTIME', 'AFTER_HOURS', 'EMERGENCY_ONLY', 'OFF']).optional(),
  // elevenlabs_agent_id is platform_owner-only — see route.ts for the gate
  elevenlabs_agent_id: z.string().trim().max(120).optional().nullable(),
  twilio_phone_number: z.string().trim().max(32).optional().nullable(),
  system_prompt_override: z.string().max(8000).optional().nullable(),
})

// Receptionist <-> staff <-> nurse renames are fine. Promotion to clinic_admin
// or platform_owner must NOT be possible through this endpoint — the admin
// route handles those with stricter checks.
const SettingsClinicUserSchema = z.object({
  name: z.string().trim().max(120).optional(),
  role: z.enum(['receptionist', 'staff', 'nurse', 'vet']).optional(),
})

const SettingsClinicInviteSchema = z.object({
  email,
  role: z.enum(['clinic_admin', 'staff', 'receptionist']).default('clinic_admin'),
})

const SettingsNotificationSchema = z.object({
  email_alerts_enabled: z.boolean().optional(),
  sms_alerts_enabled: z.boolean().optional(),
  alert_email: email.optional().nullable(),
  alert_phone: z.string().trim().max(32).optional().nullable(),
  slack_webhook_url: z.string().trim().url().max(500).optional().nullable(),
  notify_on_critical: z.boolean().optional(),
  notify_on_urgent: z.boolean().optional(),
  notify_on_missed_call: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
})

export const SETTINGS_TABLE_SCHEMAS = {
  clinics: SettingsClinicSchema,
  voice_agents: SettingsVoiceAgentSchema,
  clinic_users: SettingsClinicUserSchema,
  clinic_invites: SettingsClinicInviteSchema,
  notification_settings: SettingsNotificationSchema,
} as const

export type SettingsTable = keyof typeof SETTINGS_TABLE_SCHEMAS

export const SettingsRequestSchema = z.object({
  table: z.enum(
    Object.keys(SETTINGS_TABLE_SCHEMAS) as [SettingsTable, ...SettingsTable[]],
  ),
  data: z.record(z.string(), z.unknown()),
  id: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
})
export type SettingsRequestInput = z.infer<typeof SettingsRequestSchema>

// ── /api/clinic-switch — platform owner only ─────────────────────────────────

export const ClinicSwitchSchema = z.object({
  clinic_id: z.string().uuid(),
})
export type ClinicSwitchInput = z.infer<typeof ClinicSwitchSchema>

// ── ElevenLabs inbox webhook envelope ────────────────────────────────────────
// Intentionally lenient — ElevenLabs evolves its payload shape; we only need
// to assert the top-level structure so the rest of the handler can run.

export const ElevenLabsWebhookSchema = z.object({
  type: z.string().optional(),
  agent_id: z.string().optional(),
  conversation_id: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  analysis: z.record(z.string(), z.unknown()).optional(),
  transcript: z
    .array(z.object({ role: z.string(), message: z.string() }))
    .optional(),
  to: z.string().optional(),
  call_duration_secs: z.number().optional(),
  summary: z.string().optional(),
  call_summary: z.string().optional(),
}).passthrough()
export type ElevenLabsWebhookInput = z.infer<typeof ElevenLabsWebhookSchema>
