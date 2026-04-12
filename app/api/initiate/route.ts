import { NextRequest, NextResponse } from 'next/server'
import {
  getServiceSupabase,
  buildDynamicVariables,
  CLINIC_SELECT_FIELDS,
} from '@/lib/voice/shared'
import { withRetry } from '@/lib/utils/withRetry'

export const preferredRegion = 'syd1'

/**
 * POST /api/initiate
 *
 * ElevenLabs conversation initiation webhook. Called by ElevenLabs before
 * every inbound call to fetch dynamic variables for the agent prompt.
 *
 * ElevenLabs sends { agent_id, ... } in the body. We look up the clinic
 * via voice_agents.elevenlabs_agent_id and return the clinic's variables.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json().catch(() => ({}))
  } catch {
    body = {}
  }

  // ElevenLabs may send the called number under different keys
  const toNumber = (
    (body.to as string) ||
    (body.called_number as string) ||
    (body.phone_number as string) ||
    (body.caller_id as string) ||
    null
  )

  console.log('[/api/initiate] Webhook called — full body:', JSON.stringify(body))
  console.log('[/api/initiate] Resolved toNumber:', toNumber)

  const supabase = getServiceSupabase()

  // Resolve clinic from Twilio To number → voice_agents → clinics
  let clinic: Record<string, unknown> | null = null

  if (toNumber) {
    clinic = await withRetry(async () => {
      const { data: voiceAgent } = await supabase
        .from('voice_agents')
        .select('clinic_id')
        .eq('twilio_phone_number', toNumber)
        .limit(1)
        .maybeSingle()

      if (!voiceAgent?.clinic_id) return null

      const { data } = await supabase
        .from('clinics')
        .select(`${CLINIC_SELECT_FIELDS}, coverage_mode, reception_number`)
        .eq('id', voiceAgent.clinic_id)
        .single()
      return data as Record<string, unknown> | null
    }, { label: 'initiate/clinic-lookup' }).catch(() => null)
  }

  if (!clinic) {
    console.log('[/api/initiate] Unknown number:', toNumber)
    return NextResponse.json({
      type: 'conversation_initiation_client_data',
      dynamic_variables: {},
    })
  }

  // ── AI Off: override agent to transfer immediately to reception ─────
  const coverageMode = String(clinic.coverage_mode ?? 'after_hours')
  const receptionNumber = String(clinic.reception_number ?? clinic.phone ?? '')

  if (coverageMode === 'off' && receptionNumber) {
    console.log(`[/api/initiate] AI OFF — overriding agent to transfer to ${receptionNumber}`)

    const dynamicVars = buildDynamicVariables(clinic)
    dynamicVars.reception_number = receptionNumber

    return NextResponse.json({
      type: 'conversation_initiation_client_data',
      dynamic_variables: dynamicVars,
      conversation_config_override: {
        agent: {
          first_message: `Thank you for calling ${String(clinic.name ?? '')}. Please hold for just a moment while I connect you to our team.`,
          prompt: {
            prompt: `You have ONE job only. Immediately call the transfer_call tool to transfer this call to {{reception_number}}. Do not greet the caller again. Do not wait for them to speak. Do not say anything else. Call transfer_call NOW.`,
          },
        },
      },
    })
  }

  // ── Normal mode: return dynamic variables only ────────────────────────
  return NextResponse.json({
    type: 'conversation_initiation_client_data',
    dynamic_variables: buildDynamicVariables(clinic),
  })
}
