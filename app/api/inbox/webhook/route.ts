import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

// ── POST /api/inbox/webhook ────────────────────────────────────
// Called by ElevenLabs when a conversation ends.
// Configure in ElevenLabs → Agent → Post-call webhook → this URL.
//
// ElevenLabs payload shape (simplified):
// {
//   conversation_id: string,
//   agent_id: string,
//   call_duration_secs: number,
//   transcript: [{ role: 'agent'|'user', message: string }],
//   analysis: {
//     transcript_summary: string,
//     custom_llm_extra_body: { ... }   // if you use structured output
//   },
//   metadata: { ... }
// }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Extract key fields from ElevenLabs payload ──────────────
  const conversationId   = (body.conversation_id as string) ?? null
  const callDurationSecs = (body.call_duration_secs as number) ?? null
  const analysis         = (body.analysis as Record<string, unknown>) ?? {}
  const transcript       = (body.transcript as Array<{ role: string; message: string }>) ?? []

  // Summary from ElevenLabs analysis (if available)
  const aiSummary = (analysis.transcript_summary as string) ?? buildFallbackSummary(transcript)

  // Try to extract structured data from the transcript
  const callerInfo = extractCallerInfo(transcript)

  // Determine urgency from the conversation
  const urgency = detectUrgency(transcript, aiSummary)

  // Build action required based on urgency
  const actionRequired = urgency === 'CRITICAL'
    ? 'Urgent callback required — same-day assessment'
    : urgency === 'URGENT'
    ? 'Call back today to follow up'
    : 'Review and action when available'

  // ── Insert into Supabase ────────────────────────────────────
  const { error } = await supabase
    .from('call_inbox')
    .insert({
      clinic_id:                  DEMO_CLINIC_ID,
      caller_name:                callerInfo.name,
      caller_phone:               callerInfo.phone,
      pet_name:                   callerInfo.petName,
      pet_species:                callerInfo.petSpecies,
      summary:                    aiSummary.slice(0, 200),   // short preview
      ai_detail:                  aiSummary,
      action_required:            actionRequired,
      urgency,
      status:                     'UNREAD',
      call_duration_seconds:      callDurationSecs,
      elevenlabs_conversation_id: conversationId,
    })

  if (error) {
    console.error('[inbox/webhook] Insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// ── Helpers ────────────────────────────────────────────────────

function buildFallbackSummary(transcript: Array<{ role: string; message: string }>): string {
  const userLines = transcript
    .filter(t => t.role === 'user')
    .map(t => t.message)
    .join(' ')
  return userLines.slice(0, 500) || 'Call summary not available.'
}

function extractCallerInfo(transcript: Array<{ role: string; message: string }>) {
  const fullText = transcript.map(t => t.message).join(' ').toLowerCase()

  // Basic extraction heuristics — in production, use structured LLM output
  return {
    name:       extractName(transcript)       ?? 'Unknown caller',
    phone:      extractPhone(fullText)        ?? '—',
    petName:    extractPetName(fullText)      ?? '—',
    petSpecies: extractPetSpecies(fullText)   ?? '—',
  }
}

function extractName(transcript: Array<{ role: string; message: string }>): string | null {
  // Look for "my name is X" or "this is X" in user messages
  for (const t of transcript) {
    if (t.role !== 'user') continue
    const m = t.message.match(/(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
    if (m) return m[1]
  }
  return null
}

function extractPhone(text: string): string | null {
  const m = text.match(/(\+?[\d\s\-()]{8,15})/)
  return m ? m[1].trim() : null
}

function extractPetName(text: string): string | null {
  const m = text.match(/(?:my (?:dog|cat|pet|rabbit|bird) is called|my (?:dog|cat|pet|rabbit|bird)'s name is|called)\s+([A-Z][a-z]+)/i)
  return m ? m[1] : null
}

function extractPetSpecies(text: string): string | null {
  if (/\bdog\b|\bcanine\b|\bpuppy\b/i.test(text)) return 'Canine'
  if (/\bcat\b|\bfeline\b|\bkitten\b/i.test(text)) return 'Feline'
  if (/\brabbit\b/i.test(text)) return 'Rabbit'
  if (/\bbird\b|\bparrot\b/i.test(text)) return 'Avian'
  return null
}

function detectUrgency(
  transcript: Array<{ role: string; message: string }>,
  summary: string,
): 'CRITICAL' | 'URGENT' | 'ROUTINE' {
  const combined = [...transcript.map(t => t.message), summary].join(' ').toLowerCase()

  const criticalKeywords = [
    'collapse', 'collapsed', 'unconscious', 'not breathing', 'seizure', 'convuls',
    'pale gums', 'blood', 'bleeding', 'hit by', 'poisoned', 'toxic', 'emergency',
    'dying', 'can\'t breathe', 'cannot breathe', 'unresponsive',
  ]
  const urgentKeywords = [
    'not eating', 'not drinking', 'vomiting', 'vomit', 'diarrhea', 'diarrhoea',
    'limping', 'lethargic', 'lethargic', 'swollen', 'painful', 'pain', 'crying',
    'hiding', 'very worried', 'really concerned', 'same day',
  ]

  if (criticalKeywords.some(k => combined.includes(k))) return 'CRITICAL'
  if (urgentKeywords.some(k => combined.includes(k)))   return 'URGENT'
  return 'ROUTINE'
}
