import { getClinicConfig, formatClinicContext } from './clinic/get-clinic-config'
import { retrieveKbContext } from './kb/retrieve'
import { classifyTriage, TriageLevel } from './triage/classify'
import { buildChatSystemPrompt } from './prompts/chat-system'
import { buildVoiceSystemPrompt } from './prompts/voice-system'

export type Channel = 'chat' | 'voice'

export interface BrainContext {
  clinicId: string
  clinicName: string
  triage: TriageLevel
  systemPrompt: string
}

export function buildBrainContext(
  clinicId: string,
  userMessage: string,
  channel: Channel = 'chat'
): BrainContext {
  // Load clinic config
  const config = getClinicConfig(clinicId)
  const clinicContext = formatClinicContext(config)

  // Retrieve relevant knowledge base content
  const kbContext = retrieveKbContext(clinicId, userMessage)

  // Classify triage level from the user's message
  const triage = classifyTriage(userMessage)

  // Build the appropriate system prompt for the channel
  const systemPrompt =
    channel === 'voice'
      ? buildVoiceSystemPrompt(clinicContext, kbContext)
      : buildChatSystemPrompt(clinicContext, kbContext)

  return {
    clinicId,
    clinicName: config.clinic_name,
    triage,
    systemPrompt,
  }
}
