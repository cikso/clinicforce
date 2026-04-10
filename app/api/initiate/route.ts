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

  console.log('[/api/initiate] Webhook called:', JSON.stringify({
    agent_id: body.agent_id ?? null,
    phone_number_id: body.phone_number_id ?? null,
  }))

  const supabase = getServiceSupabase()
  const agentId = (body.agent_id as string) ?? null

  // Resolve clinic from agent_id → voice_agents → clinics
  let clinic: Record<string, unknown> | null = null

  if (agentId) {
    clinic = await withRetry(async () => {
      const { data: voiceAgent } = await supabase
        .from('voice_agents')
        .select('clinic_id')
        .eq('elevenlabs_agent_id', agentId)
        .limit(1)
        .maybeSingle()

      if (!voiceAgent?.clinic_id) return null

      const { data } = await supabase
        .from('clinics')
        .select(CLINIC_SELECT_FIELDS)
        .eq('id', voiceAgent.clinic_id)
        .single()
      return data as Record<string, unknown> | null
    }, { label: 'initiate/clinic-lookup' }).catch(() => null)
  }

  if (!clinic) {
    console.error('[/api/initiate] Could not resolve clinic for agent_id:', agentId)
    return NextResponse.json({
      type: 'conversation_initiation_client_data',
      dynamic_variables: {},
    })
  }

  return NextResponse.json({
    type: 'conversation_initiation_client_data',
    dynamic_variables: buildDynamicVariables(clinic),
  })
}
