import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getClinicConfig } from '@/lib/brain/clinic/get-clinic-config'

const DEMO_CLINIC_ID      = 'a1b2c3d4-0000-0000-0000-000000000001'
const DEMO_CLINIC_CFG_KEY = process.env.CLINIC_CONFIG_KEY ?? 'demo-clinic'

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

// ── Current mode: DAYTIME | LUNCH_OVERFLOW | AFTER_HOURS ─────────────────────
// Calculated against the clinic's local time so the Coverage Entry Router
// can select the correct greeting without any hardcoding.
function resolveCurrentMode(
  hours: Record<string, string>,
  timezone: string,
): 'DAYTIME' | 'LUNCH_OVERFLOW' | 'AFTER_HOURS' {
  try {
    const now     = new Date()
    const locale  = new Intl.DateTimeFormat('en-AU', {
      timeZone: timezone,
      weekday: 'long',
      hour:    'numeric',
      minute:  'numeric',
      hour12:  false,
    }).formatToParts(now)

    const dayPart    = locale.find(p => p.type === 'weekday')?.value?.toLowerCase() ?? ''
    const hourPart   = parseInt(locale.find(p => p.type === 'hour')?.value   ?? '0', 10)
    const minutePart = parseInt(locale.find(p => p.type === 'minute')?.value ?? '0', 10)
    const timeNow    = hourPart * 60 + minutePart

    // Parse stored hours string, e.g. "8:00am – 6:00pm"
    const dayHours = hours[dayPart]
    if (!dayHours) return 'AFTER_HOURS'

    const rangeMatch = dayHours.match(
      /(\d+)(?::(\d+))?\s*(am|pm)\s*[–\-]\s*(\d+)(?::(\d+))?\s*(am|pm)/i,
    )
    if (!rangeMatch) return 'AFTER_HOURS'

    const to24 = (h: number, m: number, meridiem: string) => {
      let hour = h
      if (meridiem.toLowerCase() === 'pm' && h !== 12) hour += 12
      if (meridiem.toLowerCase() === 'am' && h === 12) hour = 0
      return hour * 60 + m
    }

    const openMin  = to24(parseInt(rangeMatch[1]), parseInt(rangeMatch[2] ?? '0'), rangeMatch[3])
    const closeMin = to24(parseInt(rangeMatch[4]), parseInt(rangeMatch[5] ?? '0'), rangeMatch[6])

    if (timeNow < openMin || timeNow >= closeMin) return 'AFTER_HOURS'

    // Lunch overflow: 12:30pm – 1:30pm on weekdays only
    const LUNCH_START = 12 * 60 + 30
    const LUNCH_END   = 13 * 60 + 30
    const isWeekday   = !['saturday', 'sunday'].includes(dayPart)
    if (isWeekday && timeNow >= LUNCH_START && timeNow < LUNCH_END) return 'LUNCH_OVERFLOW'

    return 'DAYTIME'
  } catch {
    return 'DAYTIME' // safe default if timezone parse fails
  }
}

// ── Build the full ElevenLabs redirect URL with all dynamic variables ─────────
function buildElevenLabsUrl(vertical: string): string {
  const config = getClinicConfig(DEMO_CLINIC_CFG_KEY)
  const meta   = VERTICAL_META[vertical] ?? VERTICAL_META.vet

  const vars: Record<string, string> = {
    clinic_name:               config.clinic_name,
    vertical_type:             meta.verticalType,
    professional_title:        meta.professionalTitle,
    clinic_address:            `${config.address}, ${config.suburb} ${config.state} ${config.postcode}`,
    clinic_phone:              config.phone,
    clinic_hours:              formatHours(config.hours),
    emergency_partner_name:    config.after_hours.partner_name,
    emergency_partner_address: config.after_hours.address,
    emergency_partner_phone:   config.after_hours.phone,
    clinic_services:           config.services.join(', '),
    subject_label:             meta.subjectLabel,
    current_mode:              resolveCurrentMode(config.hours, config.timezone),
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
 *   Incoming call → Twilio (+61253005033)
 *     → checks coverage_sessions + clinic vertical in Supabase
 *     → if ACTIVE:   redirect to ElevenLabs with all dynamic vars → Sarah answers
 *     → if INACTIVE: dial real clinic number → desk phone rings
 *
 * Setup in Twilio Console:
 *   Phone Numbers → your number → Voice
 *   "A call comes in" → Webhook → POST
 *   URL: https://www.clinicforce.io/api/twilio/incoming
 */
export async function POST() {
  const clinicNumber = process.env.CLINIC_REAL_NUMBER

  if (!clinicNumber) {
    console.error('[twilio/incoming] Missing CLINIC_REAL_NUMBER env var')
    // Safe default — better Sarah answers than the call is dropped
    return twiml(`
<Response>
  <Redirect method="POST">${buildElevenLabsUrl('vet')}</Redirect>
</Response>`)
  }

  try {
    const supabase = getSupabase()

    // Fetch coverage status and clinic vertical in parallel
    const [coverageResult, clinicResult] = await Promise.all([
      supabase
        .from('coverage_sessions')
        .select('status')
        .eq('clinic_id', DEMO_CLINIC_ID)
        .single(),
      supabase
        .from('clinics')
        .select('vertical')
        .eq('id', DEMO_CLINIC_ID)
        .single(),
    ])

    const isActive = coverageResult.data?.status === 'ACTIVE'
    const vertical = (clinicResult.data?.vertical as string) ?? 'vet'

    if (isActive) {
      // ── Coverage ON → hand off to ElevenLabs (Sarah answers) ──
      // method="POST" is critical — Twilio defaults to GET which strips
      // the call params ElevenLabs needs to identify the agent by number
      return twiml(`
<Response>
  <Redirect method="POST">${buildElevenLabsUrl(vertical)}</Redirect>
</Response>`)
    } else {
      // ── Coverage OFF → ring real clinic number ──────────────
      return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
    }

  } catch (err) {
    console.error('[twilio/incoming] Error — defaulting to ElevenLabs:', err)
    // Safe fallback: if Supabase is unreachable, send to Sarah.
    return twiml(`
<Response>
  <Redirect method="POST">${buildElevenLabsUrl('vet')}</Redirect>
</Response>`)
  }
}
