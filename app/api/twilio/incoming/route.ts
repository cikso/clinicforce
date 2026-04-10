import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const preferredRegion = 'syd1'

// ElevenLabs Register Call API — the authenticated way to start a Twilio call
// with dynamic variables. Replaces the old unauthenticated redirect approach.
const ELEVENLABS_REGISTER_CALL_URL =
  'https://api.elevenlabs.io/v1/convai/twilio/register-call'

// ── Vertical metadata ─────────────────────────────────────────────────────────
const VERTICAL_META: Record<string, {
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

// ── Hours formatter ───────────────────────────────────────────────────────────
function formatHours(hours: Record<string, string>): string {
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

// ── Build dynamic variables from clinic record ────────────────────────────────
function buildDynamicVariables(
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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
 *   Incoming call -> Twilio
 *     -> resolve clinic + ElevenLabs agent from voice_agents by called number
 *     -> check coverage_sessions in Supabase
 *     -> if ACTIVE:   call ElevenLabs Register Call API with dynamic variables
 *                     -> returns TwiML -> Sarah answers with full clinic context
 *     -> if INACTIVE: dial real clinic number -> desk phone rings
 *
 * Setup in Twilio Console:
 *   Phone Numbers -> your number -> Voice
 *   "A call comes in" -> Webhook -> POST
 *   URL: https://app.clinicforce.io/api/twilio/incoming
 */
export async function POST(req: NextRequest) {
  const clinicNumber = process.env.CLINIC_REAL_NUMBER

  try {
    const supabase = getSupabase()

    // Twilio sends form-encoded data including the called number (To) and caller (From)
    const formData = await req.formData().catch(() => null)
    const toNumber   = formData?.get('To')   as string | null
    const fromNumber = formData?.get('From') as string | null

    if (!toNumber) {
      console.error('[twilio/incoming] No To number in Twilio request')
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

    // Resolve clinic AND ElevenLabs agent ID from the called Twilio number
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('clinic_id, elevenlabs_agent_id')
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
    const agentId  = voiceAgent.elevenlabs_agent_id as string | null

    // Fetch coverage status and clinic details in parallel
    const [coverageResult, clinicResult] = await Promise.all([
      supabase
        .from('coverage_sessions')
        .select('status')
        .eq('clinic_id', clinicId)
        .single(),
      supabase
        .from('clinics')
        .select('id, name, phone, address, suburb, vertical, clinic_hours, business_hours, after_hours_partner, after_hours_phone, emergency_partner_address, services, subject_label, professional_title')
        .eq('id', clinicId)
        .single(),
    ])

    const isActive = coverageResult.data?.status === 'ACTIVE'
    const clinic   = clinicResult.data

    if (isActive && clinic && agentId) {
      // ── Coverage ON -> register call with ElevenLabs (authenticated + dynamic vars)
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        console.error('[twilio/incoming] ELEVENLABS_API_KEY not set — cannot register call')
        if (clinicNumber) {
          return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
        }
        return twiml(`<Response><Say>Sorry, we are experiencing technical difficulties.</Say></Response>`)
      }

      const dynamicVars = buildDynamicVariables(clinic as Record<string, unknown>)

      console.log('[twilio/incoming] Registering call with ElevenLabs:', {
        agent_id: agentId,
        from: fromNumber,
        to: toNumber,
        vars: Object.keys(dynamicVars),
      })

      const registerResponse = await fetch(ELEVENLABS_REGISTER_CALL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          agent_id: agentId,
          from_number: fromNumber ?? '',
          to_number: toNumber,
          direction: 'inbound',
          conversation_initiation_client_data: {
            dynamic_variables: dynamicVars,
          },
        }),
      })

      if (!registerResponse.ok) {
        const errText = await registerResponse.text().catch(() => 'unknown error')
        console.error(
          '[twilio/incoming] ElevenLabs register-call failed:',
          registerResponse.status,
          errText,
        )
        // Fallback: dial the clinic directly
        if (clinicNumber) {
          return twiml(`
<Response>
  <Dial timeout="30" action="/api/twilio/status">
    <Number>${clinicNumber}</Number>
  </Dial>
</Response>`)
        }
        return twiml(`<Response><Say>Sorry, we are experiencing technical difficulties.</Say></Response>`)
      }

      // ElevenLabs returns TwiML XML — pass it directly to Twilio
      const twimlBody = await registerResponse.text()
      console.log('[twilio/incoming] ElevenLabs register-call success, returning TwiML')

      return new NextResponse(twimlBody, {
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      })

    } else if (clinicNumber) {
      // ── Coverage OFF -> ring real clinic number ──────────────
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
