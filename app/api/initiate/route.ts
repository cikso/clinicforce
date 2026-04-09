import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getVertical, VerticalKey } from '@/lib/verticals'

export const preferredRegion = 'syd1'

// ─────────────────────────────────────────────────────────────
// All 14 dynamic variables the ElevenLabs agent expects.
// These defaults mirror the agent's dynamic_variable_placeholders
// and are used when no clinic record is matched.
// ─────────────────────────────────────────────────────────────
const DEFAULTS: DynamicVariables = {
  clinic_name:                'Baulkham Hills Veterinary Hospital',
  clinic_id:                  'demo-clinic',
  clinic_address:             '332 Windsor Rd, Baulkham Hills NSW 2153',
  clinic_phone:               '02 9639 6399',
  clinic_hours:               'Monday to Friday 8am to 7pm, Saturday 9am to 5pm, Sunday and Public Holidays 9am to 5pm',
  emergency_partner_name:     'Animal Referral Hospital',
  emergency_partner_address:  '19 Old Northern Road, Baulkham Hills',
  emergency_partner_phone:    '0296397744',
  clinic_services:            'wellness consultations, vaccinations, microchipping, desexing, dental care, digital X-ray',
  vertical_type:              'Veterinary',
  professional_title:         'Veterinarian',
  subject_label:              'pet',
  subject_name:               "pet's name",
  subject_type:               'species and breed',
}

type DynamicVariables = {
  clinic_name: string
  clinic_id: string
  clinic_address: string
  clinic_phone: string
  clinic_hours: string
  emergency_partner_name: string
  emergency_partner_address: string
  emergency_partner_phone: string
  clinic_services: string
  vertical_type: string
  professional_title: string
  subject_label: string
  subject_name: string
  subject_type: string
}

// ─────────────────────────────────────────────────────────────
// Vertical-specific voice variables
// ─────────────────────────────────────────────────────────────
function getVerticalVariables(verticalKey: string): Pick<
  DynamicVariables,
  'vertical_type' | 'professional_title' | 'subject_label' | 'subject_name' | 'subject_type'
> {
  const v = getVertical(verticalKey)
  switch (v.key as VerticalKey) {
    case 'vet':
      return {
        vertical_type:      'Veterinary',
        professional_title: 'Veterinarian',
        subject_label:      'pet',
        subject_name:       "pet's name",
        subject_type:       'species and breed',
      }
    case 'dental':
      return {
        vertical_type:      'Dental',
        professional_title: 'Dentist',
        subject_label:      'patient',
        subject_name:       "patient's name",
        subject_type:       'date of birth',
      }
    case 'gp':
      return {
        vertical_type:      'Medical',
        professional_title: 'General Practitioner',
        subject_label:      'patient',
        subject_name:       "patient's name",
        subject_type:       'date of birth and Medicare number',
      }
    case 'chiro':
      return {
        vertical_type:      'Chiropractic',
        professional_title: 'Chiropractor',
        subject_label:      'patient',
        subject_name:       "patient's name",
        subject_type:       'date of birth',
      }
    default:
      return {
        vertical_type:      'Healthcare',
        professional_title: 'Clinician',
        subject_label:      'patient',
        subject_name:       "patient's name",
        subject_type:       'date of birth',
      }
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  // +61253005033 → 0253005033
  if (digits.startsWith('61') && digits.length >= 11) return `0${digits.slice(2)}`
  return digits
}

function buildAddress(clinic: Record<string, unknown>): string {
  const parts = [clinic.address, clinic.suburb]
    .filter(Boolean)
    .join(', ')
  return parts || String(clinic.name ?? '')
}

async function extractToNumber(req: NextRequest): Promise<string | null> {
  const queryTo =
    req.nextUrl.searchParams.get('called_number') ??
    req.nextUrl.searchParams.get('calledNumber') ??
    req.nextUrl.searchParams.get('to') ??
    req.nextUrl.searchParams.get('To')

  if (queryTo) return queryTo

  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const body = (await req.json()) as Record<string, unknown>
      // ElevenLabs sends { "call": { "to_number": "..." } } for inbound Twilio calls
      const call = body.call as Record<string, unknown> | undefined
      const value =
        call?.to_number ??
        call?.phone_number ??
        body.called_number ??
        body.calledNumber ??
        body.to ??
        body.To
      return typeof value === 'string' ? value : null
    } catch {
      return null
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await req.formData()
    const value =
      form.get('called_number') ??
      form.get('calledNumber') ??
      form.get('to') ??
      form.get('To')
    return typeof value === 'string' ? value : null
  }

  return null
}

// ─────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────
async function handleInitiate(req: NextRequest): Promise<NextResponse> {
  const rawTo = await extractToNumber(req)
  let dynamic_variables: DynamicVariables = DEFAULTS

  try {
    const normalisedTo = rawTo ? normalisePhone(rawTo) : ''

    if (normalisedTo) {
      const supabase = getSupabase()
      const { data: clinics, error } = await supabase
        .from('clinics')
        .select(
          'id, slug, name, phone, address, suburb, clinic_hours, after_hours_partner, after_hours_phone, emergency_partner_address, vertical, services, voice_phone, subject_label, professional_title',
        )

      if (error) {
        console.error('[/api/initiate] Supabase error:', error)
      } else {
        // Match on voice_phone (ElevenLabs number) first, then fall back to clinic phone
        const clinic = (clinics ?? []).find((row) => {
          const voicePhone = typeof row.voice_phone === 'string' ? normalisePhone(row.voice_phone) : ''
          const clinicPhone = typeof row.phone === 'string' ? normalisePhone(row.phone) : ''
          return voicePhone === normalisedTo || clinicPhone === normalisedTo
        })

        if (clinic) {
          const vertVars = getVerticalVariables(clinic.vertical ?? 'vet')
          dynamic_variables = {
            clinic_name:               String(clinic.name               ?? DEFAULTS.clinic_name),
            clinic_id:                 String(clinic.slug               ?? DEFAULTS.clinic_id),
            clinic_address:            buildAddress(clinic as Record<string, unknown>),
            clinic_phone:              String(clinic.phone              ?? DEFAULTS.clinic_phone),
            clinic_hours:              String(clinic.clinic_hours       ?? DEFAULTS.clinic_hours),
            // DB column → ElevenLabs variable name mapping:
            // after_hours_partner → emergency_partner_name
            // after_hours_phone   → emergency_partner_phone
            emergency_partner_name:    String(clinic.after_hours_partner        ?? DEFAULTS.emergency_partner_name),
            emergency_partner_address: String(clinic.emergency_partner_address  ?? DEFAULTS.emergency_partner_address),
            emergency_partner_phone:   String(clinic.after_hours_phone          ?? DEFAULTS.emergency_partner_phone),
            clinic_services:           String(clinic.services           ?? DEFAULTS.clinic_services),
            // Vertical-derived defaults for subject/professional vars
            ...vertVars,
            // Per-clinic DB overrides take precedence when set
            // (subject_label and professional_title are new columns — null means use vertical default)
            ...(clinic.subject_label      ? { subject_label:      String(clinic.subject_label)      } : {}),
            ...(clinic.professional_title ? { professional_title: String(clinic.professional_title) } : {}),
          }
        } else {
          console.warn(
            `[/api/initiate] No clinic matched voice_phone or phone for: ${rawTo} (normalised: ${normalisedTo})`,
          )
        }
      }
    } else {
      console.warn('[/api/initiate] No to-number in request — responding with defaults')
    }
  } catch (err) {
    console.error('[/api/initiate] Unexpected error:', err)
  }

  return new NextResponse(
    JSON.stringify({
      type: 'conversation_initiation_client_data',
      dynamic_variables,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export async function GET(req: NextRequest) {
  return handleInitiate(req)
}

export async function POST(req: NextRequest) {
  return handleInitiate(req)
}
