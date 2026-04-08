import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const preferredRegion = 'syd1'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// ── Agent → vertical mapping ──────────────────────────────────────────────────
// ElevenLabs sends `agent_id` at the top level of every webhook payload.
// Add a key per agent using env vars — never hardcode IDs in source.
// Fallback: 'vet' (safe default if agent_id is missing or unmapped).
const AGENT_VERTICAL_MAP: Record<string, string> = {
  ...(process.env.ELEVENLABS_AGENT_ID_VET    ? { [process.env.ELEVENLABS_AGENT_ID_VET]:    'vet'    } : {}),
  ...(process.env.ELEVENLABS_AGENT_ID_DENTAL ? { [process.env.ELEVENLABS_AGENT_ID_DENTAL]: 'dental' } : {}),
  ...(process.env.ELEVENLABS_AGENT_ID_GP     ? { [process.env.ELEVENLABS_AGENT_ID_GP]:     'gp'     } : {}),
  ...(process.env.ELEVENLABS_AGENT_ID_CHIRO  ? { [process.env.ELEVENLABS_AGENT_ID_CHIRO]:  'chiro'  } : {}),
}

function resolveVertical(agentId: string | null | undefined): string {
  if (!agentId) return 'vet'
  return AGENT_VERTICAL_MAP[agentId] ?? 'vet'
}

// ─── Phone normalisation ──────────────────────────────────────────────────────
function normaliseAustralianPhone(raw: string): string {
  if (!raw || raw === '—') return '—'
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('61') && digits.length === 11
    ? '0' + digits.slice(2)
    : digits
  if (local.startsWith('04') && local.length === 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
  }
  if (local.startsWith('0') && local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`
  }
  return local
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase env vars are not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 🛑 THE SMART TRAFFIC COP 🛑
  // Ignore audio and ping webhooks to prevent duplicate blank rows,
  // but let the post_call_transcription through to update the summary!
  if (body.type === 'ping' || body.type === 'post_call_audio') {
    console.log('[inbox/webhook] Ignored background webhook:', body.type)
    return NextResponse.json({ ok: true, action: 'ignored' })
  }

  // agent_id is top-level in the ElevenLabs payload (same level as `type`)
  const agentId      = (body.agent_id as string) ?? null
  const vertical     = resolveVertical(agentId)

  const payload      = (body.data as Record<string, unknown>) ?? body
  const conversationId = (payload.conversation_id as string) ?? null
  const metadata     = (payload.metadata as Record<string, unknown>) ?? {}
  const phoneCall    = (metadata.phone_call as Record<string, unknown>) ?? {}
  const analysis     = (payload.analysis as Record<string, unknown>) ?? {}
  const transcript   = (payload.transcript as Array<{ role: string; message: string }>) ?? []

  // ── Resolve clinic from the Twilio "To" number ────────────────────────────
  // ElevenLabs includes the called Twilio number in phone_call.to (E.164).
  // We use this to look up which clinic owns that number in voice_agents.
  const toNumber = (phoneCall.to as string) ?? (body.to as string) ?? null

  if (!toNumber) {
    console.error('[inbox/webhook] No Twilio To number found in payload')
    return NextResponse.json({ error: 'Unknown agent phone number' }, { status: 400 })
  }

  const { data: voiceAgent, error: vaError } = await supabase
    .from('voice_agents')
    .select('clinic_id')
    .eq('twilio_phone_number', toNumber)
    .limit(1)
    .maybeSingle()

  if (vaError || !voiceAgent?.clinic_id) {
    console.error('[inbox/webhook] No voice_agent matched phone number:', toNumber)
    return NextResponse.json({ error: 'Unknown agent phone number' }, { status: 400 })
  }

  const clinicId = voiceAgent.clinic_id

  const callDurationSecs =
    (metadata.call_duration_secs as number) ??
    (body.call_duration_secs as number) ??
    null

  const aiSummary =
    (analysis.transcript_summary as string) ||
    buildFallbackSummary(transcript)

  // ── Urgency: only check USER speech, not agent or AI summary ──
  const urgency = detectUrgency(transcript)

  // ── Step 1: Exact conversation_id match ───────────────────────
  if (conversationId) {
    const { data: exactMatch } = await supabase
      .from('call_inbox')
      .select('id')
      .eq('elevenlabs_conversation_id', conversationId)
      .eq('clinic_id', clinicId)
      .maybeSingle()

    if (exactMatch) {
      const enriched = extractCallerInfo(transcript, '—')
      await supabase
        .from('call_inbox')
        .update({
          summary:               aiSummary.slice(0, 300),
          ai_detail:             aiSummary,
          call_duration_seconds: callDurationSecs,
          urgency,
          vertical,
          ...(enriched.petName    !== '—' ? { pet_name:    enriched.petName }    : {}),
          ...(enriched.petSpecies !== '—' ? { pet_species: enriched.petSpecies } : {}),
        })
        .eq('id', exactMatch.id)

      console.log('[inbox/webhook] Enriched exact match row:', exactMatch.id, '| vertical:', vertical)
      return NextResponse.json({ ok: true, action: 'updated_exact' })
    }

    // ── Step 2: Recent tool-created row (no conversation_id, within 10 mins) ──
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data: recentMatch } = await supabase
      .from('call_inbox')
      .select('id')
      .eq('clinic_id', clinicId)
      .is('elevenlabs_conversation_id', null)
      .gte('created_at', tenMinsAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentMatch) {
      const enriched = extractCallerInfo(transcript, '—')
      await supabase
        .from('call_inbox')
        .update({
          summary:                    aiSummary.slice(0, 300),
          ai_detail:                  aiSummary,
          call_duration_seconds:      callDurationSecs,
          urgency,
          vertical,
          elevenlabs_conversation_id: conversationId,
          ...(enriched.petName    !== '—' ? { pet_name:    enriched.petName }    : {}),
          ...(enriched.petSpecies !== '—' ? { pet_species: enriched.petSpecies } : {}),
        })
        .eq('id', recentMatch.id)

      console.log('[inbox/webhook] Enriched recent tool-created row:', recentMatch.id, '| vertical:', vertical)
      return NextResponse.json({ ok: true, action: 'updated_recent' })
    }
  }

  // ── Step 3: No match — insert new row (tool never fired) ──────
  const rawPhone   =
    (phoneCall.caller_id as string) ??
    extractPhone(transcript.map(t => t.message).join(' ')) ??
    '—'
  const callerPhone = normaliseAustralianPhone(rawPhone)
  const callerInfo  = extractCallerInfo(transcript, callerPhone)

  const actionRequired =
    urgency === 'CRITICAL' ? 'Urgent callback required — same-day assessment'
    : urgency === 'URGENT'  ? 'Call back today to follow up'
    :                         'Review and action when available'

  const { error } = await supabase
    .from('call_inbox')
    .insert({
      clinic_id:                  clinicId,
      caller_name:                callerInfo.name,
      caller_phone:               callerInfo.phone,
      pet_name:                   callerInfo.petName,
      pet_species:                callerInfo.petSpecies,
      summary:                    aiSummary.slice(0, 300),
      ai_detail:                  aiSummary,
      action_required:            actionRequired,
      urgency,
      vertical,
      status:                     'UNREAD',
      call_duration_seconds:      callDurationSecs,
      elevenlabs_conversation_id: conversationId,
    })

  if (error) {
    console.error('[inbox/webhook] Insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[inbox/webhook] Created new row (tool never fired)')
  return NextResponse.json({ ok: true, action: 'inserted' })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  // "my dog Max" / "my cat, Bella" / "our rabbit named Thumper"
  let m = text.match(
    /\b(?:my|our|their)\s+(?:dog|cat|pet|rabbit|bird|puppy|kitten|guinea pig|hamster|horse|fish|lizard|snake|turtle)[,]?\s+(?:named?|called|is)?\s*([A-Z][a-zA-Z]+)/i,
  )
  if (m) return m[1]
  // "his/her/its name is X" / "pet's name is X" / "the dog's name is X"
  m = text.match(
    /\b(?:his|her|its|the (?:dog|cat|bird|rabbit|pet|guinea pig|animal)'?s?)\s+name(?:\s+is)?\s+([A-Z][a-zA-Z]+)/i,
  )
  if (m) return m[1]
  // "named X" or "called X" near a species word
  m = text.match(/\b(?:named?|called)\s+([A-Z][a-zA-Z]+)/i)
  if (m) return m[1]
  // "their bird, Papppar" — animal followed by comma and capitalised name
  m = text.match(
    /\b(?:dog|cat|pet|rabbit|bird|puppy|kitten|guinea pig|hamster|horse)[,]\s+([A-Z][a-zA-Z]+)/i,
  )
  if (m) return m[1]
  return null
}

function extractPetSpecies(text: string): string | null {
  if (/\bdog\b|\bcanine\b|\bpuppy\b|\bpuppies\b/i.test(text)) return 'Canine'
  if (/\bcat\b|\bfeline\b|\bkitten\b/i.test(text))             return 'Feline'
  if (/\brabbit\b|\bbunny\b/i.test(text))                      return 'Rabbit'
  if (/\bbird\b|\bparrot\b|\bcockatiel\b/i.test(text))         return 'Avian'
  if (/\bguinea pig\b/i.test(text))                            return 'Guinea pig'
  return null
}

// ── Urgency detection — USER speech only, not agent or AI summary ─────────────
function detectUrgency(
  transcript: Array<{ role: string; message: string }>,
): 'CRITICAL' | 'URGENT' | 'ROUTINE' {
  const userText = transcript
    .filter(t => t.role === 'user')
    .map(t => t.message)
    .join(' ')
    .toLowerCase()

  const criticalKeywords = [
    'collapse', 'collapsed', 'unconscious', 'not breathing', 'seizure', 'convuls',
    'pale gums', 'bleeding heavily', 'hit by car', 'poisoned', 'toxic',
    'dying', "can't breathe", 'cannot breathe', 'unresponsive', 'swallowed something',
  ]
  const urgentKeywords = [
    'not eating', 'not drinking', 'vomiting', 'vomit', 'diarrhea', 'diarrhoea',
    'limping', 'lethargic', 'swollen', 'painful', 'in pain', 'crying out',
    'hiding', 'very worried', 'really concerned', 'same day', 'blood in',
  ]

  if (criticalKeywords.some(k => userText.includes(k))) return 'CRITICAL'
  if (urgentKeywords.some(k => userText.includes(k)))   return 'URGENT'
  return 'ROUTINE'
}
