import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const preferredRegion = 'syd1'

// ElevenLabs Twilio inbound endpoint — set via env var so it matches your account region.
// Find yours: ElevenLabs → Phone Numbers → click your number → copy the webhook URL shown.
// Common values:
//   https://api.elevenlabs.io/v1/convai/twilio/inbound_call   (global)
//   https://api.us.elevenlabs.io/twilio/inbound_call           (US region)
const ELEVENLABS_INBOUND_URL =
  process.env.ELEVENLABS_INBOUND_URL ??
  'https://api.elevenlabs.io/v1/convai/twilio/inbound_call'

// ── Vertical metadata ─────────────────────────────────────────────────────────
// Maps the vertical key stored in Supabase → the label strings ElevenLabs needs
// for voice persona and subject references in the agent's first message / prompts.
const VERTICAL_META: Record<string, {
  verticalType:      string
  professionalTitle: string
  subjectLabel:      string  // "pet" / "patient"
  subjectName:       string  // "pet's name" / "patient's name"
}> = {
  vet:    { verticalType: 'Veterinary',   professionalTitle: 'Veterinarian',         subjectLabel: 'pet',     subjectName: "pet's name"     },
  dental: { verticalType: 'Dental',       professionalTitle: 'Dentist',              subjectLabel: 'patient', subjectName: "patient's name" },
  gp:     { verticalType: 'Medical',      professionalTitle: 'General Practitioner', subjectLabel: 'patient', subjectName: "patient's name" },
  chiro:  { verticalType: 'Chiropractic', professionalTitle: 'Chiropractor',         subjectLabel: 'patient', subjectName: "patient's name" },
}

// ── Hours formatter ───────────────────────────────────────────────────────────
// Produces a compact, voice-friendly string.
// e.g. "Monday–Friday 8:00am–8:00pm, Saturday 9:00am–5:00pm, Sunday 10:00am–3:00pm"
function formatHours(hours: Record<string, string>): string {
  const ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const DAY_SHORT: Record<string, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
  }

  // Group consecutive days with the same hours
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

// ── Build the full ElevenLabs redirect URL with all dynamic variables ─────────
function buildElevenLabsUrl(
  clinic: {
    name: string
    phone: string
    address: string
    suburb: string
    state: string
    postcode: string
    business_hours: Record<string, string> | null
    after_hours_partner: string | null
    after_hours_phone: string | null
    after_hours_address: string | null
    services: string[] | null
    vertical: string
  },
): string {
  const meta = VERTICAL_META[clinic.vertical] ?? VERTICAL_META.vet

  const vars: Record<string, string> = {
    clinic_name:               clinic.name,
    vertical_type:             meta.verticalType,
    professional_title:        meta.professionalTitle,
    clinic_address:            `${clinic.address ?? ''}, ${clinic.suburb ?? ''} ${clinic.state ?? ''} ${clinic.postcode ?? ''}`.trim(),
    clinic_phone:              clinic.phone ?? '',
    clinic_hours:              clinic.business_hours ? formatHours(clinic.business_hours) : '',
    emergency_partner_name:    clinic.after_hours_partner ?? '',
    emergency_partner_address: clinic.after_hours_address ?? '',
    emergency_partner_phone:   clinic.after_hours_phone ?? '',
    clinic_services:           (clinic.services ?? []).join(', '),
    subject_label:             meta.subjectLabel,
    subject_name:              meta.subjectName,
  }

  const qs = Object.entries(vars)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  return `${ELEVENLABS_INBOUND_URL}?${qs}`
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function twiml(xml: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

/**
 * POST /api/twilio/incoming
 *
 * Routing layer between Twilio and ElevenLabs.
 *
 * Flow:
 *   Incoming call → Twilio
 *     → resolve clinic from voice_agents by called number
 *     → checks coverage_sessions + clinic vertical in Supabase
 *     → if ACTIVE:   redirect to ElevenLabs with all dynamic vars → Sarah answers
 *     → if INACTIVE: dial real clinic number → desk phone rings
 *
 * Setup in Twilio Console:
 *   Phone Numbers → your number → Voice
 *   "A call comes in" → Webhook → POST
 *   URL: https://www.clinicforce.io/api/twilio/incoming
 */
export async function POST(req: NextRequest) {
  const clinicNumber = process.env.CLINIC_REAL_NUMBER

  try {
    const supabase = getSupabase()

    // Twilio sends form-encoded data including the called number (To)
    const formData = await req.formData().catch(() => null)
    const toNumber = formData?.get('To') as string | null

    if (!toNumber) {
      console.error('[twilio/incoming] No To number in Twilio request')
      // Safe fallback — better to handle than drop
      if (clinicNumber) {
        return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
      }
      return twiml(`<Response><Say>Sorry, we could not route your call. Please try again later.</Say></Response>`)
    }

    // Resolve clinic from the called Twilio number via voice_agents
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('clinic_id')
      .eq('twilio_phone_number', toNumber)
      .limit(1)
      .maybeSingle()

    if (!voiceAgent?.clinic_id) {
      console.error('[twilio/incoming] No voice_agent matched phone number:', toNumber)
      if (clinicNumber) {
        return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
      }
      return twiml(`<Response><Say>Sorry, we could not route your call. Please try again later.</Say></Response>`)
    }

    const clinicId = voiceAgent.clinic_id as string

    // Fetch coverage status and clinic details in parallel
    const [coverageResult, clinicResult] = await Promise.all([
      supabase
        .from('coverage_sessions')
        .select('status')
        .eq('clinic_id', clinicId)
        .single(),
      supabase
        .from('clinics')
        .select('name, phone, address, suburb, state, postcode, vertical, business_hours, after_hours_partner, after_hours_phone, after_hours_address, services')
        .eq('id', clinicId)
        .single(),
    ])

    const isActive = coverageResult.data?.status === 'ACTIVE'
    const clinic   = clinicResult.data

    if (isActive && clinic) {
      // ── Coverage ON → hand off to ElevenLabs (Sarah answers) ──
      // method="POST" is critical — Twilio defaults to GET which strips
      // the call params ElevenLabs needs to identify the agent by number
      return twiml(`
<Response>
  <Redirect method="POST">${buildElevenLabsUrl(clinic as Parameters<typeof buildElevenLabsUrl>[0])}</Redirect>
</Response>`)
    } else if (clinicNumber) {
      // ── Coverage OFF → ring real clinic number ──────────────
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
    } else if (clinic) {
      // No env fallback number but we have clinic data — try clinic phone
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinic.phone}</Number>
  </Dial>
</Response>`)
    } else {
      return twiml(`<Response><Say>Sorry, we could not route your call. Please try again later.</Say></Response>`)
    }

  } catch (err) {
    console.error('[twilio/incoming] Error:', err)
    // Safe fallback: if Supabase is unreachable, dial the clinic directly
    if (clinicNumber) {
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
    }
    return twiml(`<Response><Say>Sorry, we are experiencing technical difficulties. Please try again later.</Say></Response>`)
  }
}
