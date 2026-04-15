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
