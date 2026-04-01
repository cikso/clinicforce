import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = (body.data as Record<string, unknown>) ?? body
  const conversationId = (payload.conversation_id as string) ?? null
  const metadata = (payload.metadata as Record<string, unknown>) ?? {}
  const analysis = (payload.analysis as Record<string, unknown>) ?? {}
  const transcript = (payload.transcript as Array<{ role: string; message: string }>) ?? []

  const callDurationSecs =
    (metadata.call_duration_secs as number) ??
    (body.call_duration_secs as number) ??
    null

  const aiSummary =
    (analysis.transcript_summary as string) ||
    buildFallbackSummary(transcript)

  const urgency = detectUrgency(transcript, aiSummary)

  // ── Try to UPDATE existing row created by create_callback_request tool ──
  // Match on conversation_id if available, otherwise fall back to insert
  if (conversationId) {
    const { data: existing } = await supabase
      .from('call_inbox')
      .select('id')
      .eq('elevenlabs_conversation_id', conversationId)
      .eq('clinic_id', DEMO_CLINIC_ID)
      .limit(1)
      .single()

    if (existing) {
      // Row already exists from tool call — just enrich it with webhook data
      await supabase
        .from('call_inbox')
        .update({
          ai_detail:             aiSummary,
          call_duration_seconds: callDurationSecs,
          urgency,
        })
        .eq('id', existing.id)

      console.log('[inbox/webhook] Enriched existing row:', existing.id)
      return NextResponse.json({ ok: true, action: 'updated' })
    }
  }

  // ── No existing row — create one (call ended without tool being invoked) ──
  const phoneCall = (metadata.phone_call as Record<string, unknown>) ?? {}
  const callerPhone =
    (phoneCall.caller_id as string) ??
    extractPhone(transcript.map(t => t.message).join(' ')) ??
    '—'

  const callerInfo = extractCallerInfo(transcript, callerPhone)

  const actionRequired =
    urgency === 'CRITICAL' ? 'Urgent callback required — same-day assessment'
    : urgency === 'URGENT'  ? 'Call back today to follow up'
    :                         'Review and action when available'

  const { error } = await supabase
    .from('call_inbox')
    .insert({
      clinic_id:                  DEMO_CLINIC_ID,
      caller_name:                callerInfo.name,
      caller_phone:               callerInfo.phone,
      pet_name:                   callerInfo.petName,
      pet_species:                callerInfo.petSpecies,
      summary:                    aiSummary.slice(0, 300),
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

  console.log('[inbox/webhook] Created new row (no tool call found)')
  return NextResponse.json({ ok: true, action: 'inserted' })
}

// ── Helpers ────────────────────────────────────────────────────

function buildFallbackSummary(transcript: Array<{ role: string; message: string }>): string {
  const userLines = transcript
    .filter(t => t.role === 'user')
    .map(t => t.message)
    .join(' ')
  return userLines.slice(0, 500) || 'No summary available.'
}

function extractCallerInfo(
  transcript: Array<{ role: string; message: string }>,
  callerPhone: string,
) {
  const fullText = transcript.map(t => t.message).join(' ')
  return {
    name:       extractName(transcript) ?? 'Unknown caller',
    phone:      callerPhone,
    petName:    extractPetName(fullText) ?? '—',
    petSpecies: extractPetSpecies(fullText) ?? '—',
  }
}

function extractName(transcript: Array<{ role: string; message: string }>): string | null {
  for (const t of transcript) {
    if (t.role !== 'user') continue
    const m = t.message.match(
      /(?:my name is|this is|i'm|i am|it'?s|it is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    )
    if (m) return m[1].trim()
  }
  return null
}

function extractPhone(text: string): string | null {
  const m = text.match(/(\+?[\d][\d\s\-()]{7,14}[\d])/)
  return m ? m[1].trim() : null
}

function extractPetName(text: string): string | null {
  const m = text.match(
    /(?:(?:my |our )(?:dog|cat|pet|rabbit|bird|puppy|kitten)(?:'s name)? is(?: called)?|called)\s+([A-Z][a-z]+)/i,
  )
  return m ? m[1] : null
}

function extractPetSpecies(text: string): string | null {
  if (/\bdog\b|\bcanine\b|\bpuppy\b|\bpuppies\b/i.test(text)) return 'Canine'
  if (/\bcat\b|\bfeline\b|\bkitten\b/i.test(text))             return 'Feline'
  if (/\brabbit\b|\bbunny\b/i.test(text))                      return 'Rabbit'
  if (/\bbird\b|\bparrot\b|\bcockatiel\b/i.test(text))         return 'Avian'
  if (/\bguinea pig\b/i.test(text))                            return 'Guinea pig'
  return null
}

function detectUrgency(
  transcript: Array<{ role: string; message: string }>,
  summary: string,
): 'CRITICAL' | 'URGENT' | 'ROUTINE' {
  const combined = [...transcript.map(t => t.message), summary].join(' ').toLowerCase()
  const criticalKeywords = [
    'collapse', 'collapsed', 'unconscious', 'not breathing', 'seizure', 'convuls',
    'pale gums', 'bleeding heavily', 'hit by car', 'poisoned', 'toxic', 'emergency',
    'dying', "can't breathe", 'cannot breathe', 'unresponsive', 'swallowed something',
  ]
  const urgentKeywords = [
    'not eating', 'not drinking', 'vomiting', 'vomit', 'diarrhea', 'diarrhoea',
    'limping', 'lethargic', 'swollen', 'painful', 'in pain', 'crying out',
    'hiding', 'very worried', 'really concerned', 'same day', 'blood in',
  ]
  if (criticalKeywords.some(k => combined.includes(k))) return 'CRITICAL'
  if (urgentKeywords.some(k => combined.includes(k)))   return 'URGENT'
  return 'ROUTINE'
}
