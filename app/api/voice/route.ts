import { NextRequest, NextResponse } from 'next/server'
import { classifyTriage } from '@/lib/brain/triage/classify'
import { retrieveKbContext } from '@/lib/brain/kb/retrieve'
import { getClinicConfig, formatClinicContext } from '@/lib/brain/clinic/get-clinic-config'
import { sharedRules } from '@/lib/brain/prompts/shared-rules'
import { validateSecret } from '@/lib/voice/shared'
import OpenAI from 'openai'

function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) }

// ElevenLabs calls this as a server tool during the conversation
// Input: caller's message + clinic_id
// Output: triage level + recommended response for the agent to use

export interface VoiceToolRequest {
  message: string
  clinic_id: string
}

export interface VoiceToolResponse {
  triage_level: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'CLINIC_INFO'
  is_emergency: boolean
  recommended_response: string
  emergency_number: string
  clinic_phone: string
}

export async function POST(req: NextRequest) {
  if (!validateSecret(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: VoiceToolRequest = await req.json()
    const { message, clinic_id } = body

    if (!message || !clinic_id) {
      return NextResponse.json({ error: 'Missing message or clinic_id' }, { status: 400 })
    }

    // Load clinic and KB
    const config = getClinicConfig(clinic_id)
    const clinicContext = formatClinicContext(config)
    const kbContext = retrieveKbContext(clinic_id, message)

    // Classify triage level
    const triage = classifyTriage(message)
    const isEmergency = triage === 'EMERGENCY'

    // Build a concise voice-optimised prompt
    const systemPrompt = `
You are Sarah, a veterinary AI triage assistant. You are helping route a phone call.
The caller has described a concern. Based on their message, provide a SHORT spoken response (2-3 sentences max).
The response will be read aloud by a voice agent — write it as spoken words, no lists or formatting.

Triage classification: ${triage}

Clinic information:
${clinicContext}

Relevant clinic knowledge:
${kbContext}

Rules:
${sharedRules}
    `.trim()

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.2,
      max_tokens: 150,
    })

    const recommended_response =
      completion.choices[0]?.message?.content ??
      'I recommend calling the clinic directly for guidance on this concern.'

    const result: VoiceToolResponse = {
      triage_level: triage,
      is_emergency: isEmergency,
      recommended_response,
      emergency_number: config.after_hours.phone,
      clinic_phone: config.phone,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Voice tool error:', err)
    return NextResponse.json({ error: 'Voice triage failed' }, { status: 500 })
  }
}
