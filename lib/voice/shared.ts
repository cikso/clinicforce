import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// ── Supabase (service role) ──────────────────────────────────────────────────

export function getServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// ── Secret validation (tool-level: plain header) ────────────────────────────

export function validateSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-api-secret')
  return !!secret && secret === process.env.ELEVENLABS_TOOL_SECRET
}

// ── HMAC validation (post-call webhook) ─────────────────────────────────────

export async function validateWebhookHmac(
  signature: string | null,
  rawBody: string,
): Promise<boolean> {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET
  if (!secret || !signature) return false

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return expected === signature
  } catch {
    return false
  }
}

// ── Phone normalisation (Australian) ─────────────────────────────────────────

export function normaliseAustralianPhone(raw: string): string {
  if (!raw || raw === '—') return '—'
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('61') && digits.length === 11
    ? '0' + digits.slice(2)
    : digits
  if (local.startsWith('04') && local.length === 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
  }
  if (local.startsWith('0') && local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`
  }
  return local
}

// ── Clinic resolution ────────────────────────────────────────────────────────
// Resolves clinic_id from the request body. Checks clinic_id, then clinic_name,
// then returns null if unresolvable — no hardcoded fallback.

export async function resolveClinicId(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
): Promise<string | null> {
  // Direct clinic_id provided by ElevenLabs tool
  if (typeof body.clinic_id === 'string' && body.clinic_id) {
    return body.clinic_id
  }

  // Resolve by clinic_name
  if (typeof body.clinic_name === 'string' && body.clinic_name) {
    const { data } = await supabase
      .from('clinics')
      .select('id')
      .eq('name', body.clinic_name)
      .limit(1)
      .maybeSingle()
    if (data?.id) return data.id as string
  }

  return null
}

// ── Clinic fields used by voice endpoints ────────────────────────────────────

export const CLINIC_SELECT_FIELDS =
  'id, name, phone, address, suburb, vertical, clinic_hours, business_hours, ' +
  'after_hours_partner, after_hours_phone, emergency_partner_address, services, ' +
  'subject_label, professional_title, timezone'

// ── Vertical metadata ────────────────────────────────────────────────────────

export const VERTICAL_META: Record<string, {
  verticalType:      string
  professionalTitle: string
  subjectLabel:      string
  subjectName:       string
}> = {
  vet:    { verticalType: 'Veterinary',   professionalTitle: 'Veterinarian',         subjectLabel: 'pet',     subjectName: "pet's name"     },
  dental: { verticalType: 'Dental',       professionalTitle: 'Dentist',              subjectLabel: 'patient', subjectName: "patient's name" },
  gp:     { verticalType: 'Medical',      professionalTitle: 'General Practitioner', subjectLabel: 'patient', subjectName: "patient's name" },
  chiro:  { verticalType: 'Chiropractic', professionalTitle: 'Chiropractor',         subjectLabel: 'patient', subjectName: "patient's name" },
}

// ── Hours formatter ──────────────────────────────────────────────────────────

export function formatHours(hours: Record<string, string>): string {
  const ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const DAY_SHORT: Record<string, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
  }

  const groups: { days: string[]; hours: string }[] = []
  for (const day of ORDER) {
    const h = hours[day]
    if (!h) continue
    const last = groups[groups.length - 1]
    if (last && last.hours === h) {
      last.days.push(day)
    } else {
      groups.push({ days: [day], hours: h })
    }
  }

  return groups
    .map(g => {
      const label =
        g.days.length === 1
          ? DAY_SHORT[g.days[0]]
          : `${DAY_SHORT[g.days[0]]}–${DAY_SHORT[g.days[g.days.length - 1]]}`
      return `${label} ${g.hours}`
    })
    .join(', ')
}

// ── Build dynamic variables from a clinic record ─────────────────────────────

export function buildDynamicVariables(
  clinic: Record<string, unknown>,
): Record<string, string> {
  const meta = VERTICAL_META[String(clinic.vertical ?? 'vet')] ?? VERTICAL_META.vet
  return {
    clinic_name:               String(clinic.name ?? ''),
    clinic_id:                 String(clinic.id ?? ''),
    vertical_type:             meta.verticalType,
    professional_title:        String(clinic.professional_title ?? meta.professionalTitle),
    clinic_address:            [clinic.address, clinic.suburb].filter(Boolean).join(', '),
    clinic_phone:              String(clinic.phone ?? ''),
    clinic_hours:              clinic.business_hours
      ? formatHours(clinic.business_hours as Record<string, string>)
      : String(clinic.clinic_hours ?? ''),
    emergency_partner_name:    String(clinic.after_hours_partner ?? ''),
    emergency_partner_address: String(clinic.emergency_partner_address ?? ''),
    emergency_partner_phone:   String(clinic.after_hours_phone ?? ''),
    clinic_services:           String(clinic.services ?? ''),
    subject_label:             String(clinic.subject_label ?? meta.subjectLabel),
    subject_name:              meta.subjectName,
  }
}
