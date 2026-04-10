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

// ── Coverage reason labels ───────────────────────────────────────────────────
const COVERAGE_LABELS: Record<string, string> = {
  all_calls:      'All Calls',
  after_hours:    'After Hours',
  overflow:       'Overflow',
  emergency_only: 'Emergency Only',
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

  // Ignore audio and ping webhooks
  if (body.type === 'ping' || body.type === 'post_call_audio') {
    return NextResponse.json({ ok: true, action: 'ignored' })
  }

  const agentId      = (body.agent_id as string) ?? null
  const vertical     = resolveVertical(agentId)

  const payload      = (body.data as Record<string, unknown>) ?? body
  const conversationId = (payload.conversation_id as string) ?? null
  const metadata     = (payload.metadata as Record<string, unknown>) ?? {}
  const phoneCall    = (metadata.phone_call as Record<string, unknown>) ?? {}
  const analysis     = (payload.analysis as Record<string, unknown>) ?? {}
  const transcript   = (payload.transcript as Array<{ role: string; message: string }>) ?? []

  // ── Resolve clinic from Twilio "To" number ────────────────────────────────
  const toNumber = (phoneCall.to as string) ?? (body.to as string) ?? null

  if (!toNumber) {
    console.error('[inbox/webhook] No Twilio To number found in payload')
    return NextResponse.json({ error: 'Unknown agent phone number' }, { status: 400 })
  }

  const { data: voiceAgent, error: vaError } = await supabase
    .from('voice_agents')
    .select('clinic_id, mode')
    .eq('twilio_phone_number', toNumber)
    .limit(1)
    .maybeSingle()

  if (vaError || !voiceAgent?.clinic_id) {
    console.error('[inbox/webhook] No voice_agent matched phone number:', toNumber, vaError)
    return NextResponse.json({ error: 'Unknown agent phone number' }, { status: 400 })
  }

  const clinicId = voiceAgent.clinic_id
  const coverageReason = COVERAGE_LABELS[voiceAgent.mode as string] ?? null

  const callDurationSecs =
    (metadata.call_duration_secs as number) ??
    (body.call_duration_secs as number) ??
    null

  const aiSummary =
    (analysis.transcript_summary as string) ||
    buildFallbackSummary(transcript)

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
      const industryData = buildIndustryData(transcript)
      const { error: updateErr } = await supabase
        .from('call_inbox')
        .update({
          summary:               aiSummary.slice(0, 300),
          ai_detail:             aiSummary,
          call_duration_seconds: callDurationSecs,
          urgency,
          vertical,
          coverage_reason:       coverageReason,
          industry_data:         industryData,
          ...(enriched.petName    !== '—' ? { pet_name:    enriched.petName }    : {}),
          ...(enriched.petSpecies !== '—' ? { pet_species: enriched.petSpecies } : {}),
        })
        .eq('id', exactMatch.id)

      if (updateErr) {
        console.error('[inbox/webhook] Update error (exact match):', updateErr)
      }
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
      const industryData = buildIndustryData(transcript)
      const { error: updateErr } = await supabase
        .from('call_inbox')
        .update({
          summary:                    aiSummary.slice(0, 300),
          ai_detail:                  aiSummary,
          call_duration_seconds:      callDurationSecs,
          urgency,
          vertical,
          coverage_reason:            coverageReason,
          industry_data:              industryData,
          elevenlabs_conversation_id: conversationId,
          ...(enriched.petName    !== '—' ? { pet_name:    enriched.petName }    : {}),
          ...(enriched.petSpecies !== '—' ? { pet_species: enriched.petSpecies } : {}),
        })
        .eq('id', recentMatch.id)

      if (updateErr) {
        console.error('[inbox/webhook] Update error (recent match):', updateErr)
      }
      return NextResponse.json({ ok: true, action: 'updated_recent' })
    }
  }

  // ── Step 3: No match — insert new row ──────────────────────────
  const rawPhone   =
    (phoneCall.caller_id as string) ??
    extractPhone(transcript.map(t => t.message).join(' ')) ??
    '—'
  const callerPhone = normaliseAustralianPhone(rawPhone)
  const callerInfo  = extractCallerInfo(transcript, callerPhone)
  const industryData = buildIndustryData(transcript)

  const actionRequired =
    urgency === 'CRITICAL' ? 'Urgent callback required — same-day assessment'
    : urgency === 'URGENT'  ? 'Call back today to follow up'
    :                         'Review and action when available'

  const { data: newRow, error: insertErr } = await supabase
    .from('call_inbox')
    .insert({
      clinic_id:                  clinicId,
      caller_name:                callerInfo.name,
      caller_phone:               callerInfo.phone,
      pet_name:                   callerInfo.petName,
      pet_species:                callerInfo.petSpecies,
      industry_data:              industryData,
      summary:                    aiSummary.slice(0, 300),
      ai_detail:                  aiSummary,
      action_required:            actionRequired,
      urgency,
      vertical,
      coverage_reason:            coverageReason,
      status:                     'UNREAD',
      call_duration_seconds:      callDurationSecs,
      elevenlabs_conversation_id: conversationId,
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[inbox/webhook] Insert error:', insertErr)
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // ── Auto-create task for calls needing follow-up ────────────────
  if (actionRequired && urgency !== 'ROUTINE') {
    const taskPriority =
      urgency === 'CRITICAL' ? 'URGENT' : urgency === 'URGENT' ? 'HIGH' : 'NORMAL'

    const { error: taskErr } = await supabase.from('tasks').insert({
      clinic_id:   clinicId,
      title:       `Callback: ${callerInfo.name}`,
      description: actionRequired,
      type:        'CALLBACK',
      priority:    taskPriority,
      status:      'PENDING',
    })

    if (taskErr) {
      console.error('[inbox/webhook] Task insert error:', taskErr)
    }
  }

  // ── Log to activity_log ─────────────────────────────────────────
  const { error: logErr } = await supabase.from('activity_log').insert({
    clinic_id: clinicId,
    type:      'CALL',
    message:   `AI call from ${callerInfo.name}: ${aiSummary.slice(0, 120)}`,
    metadata:  {
      call_inbox_id:  newRow?.id ?? null,
      urgency,
      coverage_reason: coverageReason,
    },
  })

  if (logErr) {
    console.error('[inbox/webhook] Activity log insert error:', logErr)
  }

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

function buildIndustryData(transcript: Array<{ role: string; message: string }>) {
  const fullText = transcript.map(t => t.message).join(' ')
  return {
    pet_name:    extractPetName(fullText) ?? null,
    pet_species: extractPetSpecies(fullText) ?? null,
    pet_breed:   extractPetBreed(fullText) ?? null,
  }
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
  let m = text.match(
    /\b(?:my|our|their)\s+(?:dog|cat|pet|rabbit|bird|puppy|kitten|guinea pig|hamster|horse|fish|lizard|snake|turtle)[,]?\s+(?:named?|called|is)?\s*([A-Z][a-zA-Z]+)/i,
  )
  if (m) return m[1]
  m = text.match(
    /\b(?:his|her|its|the (?:dog|cat|bird|rabbit|pet|guinea pig|animal)'?s?)\s+name(?:\s+is)?\s+([A-Z][a-zA-Z]+)/i,
  )
  if (m) return m[1]
  m = text.match(/\b(?:named?|called)\s+([A-Z][a-zA-Z]+)/i)
  if (m) return m[1]
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

function extractPetBreed(text: string): string | null {
  const breeds = [
    'labrador', 'golden retriever', 'german shepherd', 'bulldog', 'poodle',
    'beagle', 'rottweiler', 'dachshund', 'boxer', 'cavalier', 'border collie',
    'french bulldog', 'shih tzu', 'chihuahua', 'husky', 'maltese', 'pomeranian',
    'staffy', 'staffordshire', 'kelpie', 'cattle dog', 'jack russell',
    'persian', 'siamese', 'ragdoll', 'maine coon', 'british shorthair', 'bengal',
    'burmese', 'russian blue', 'abyssinian', 'sphynx',
  ]
  const lower = text.toLowerCase()
  for (const breed of breeds) {
    if (lower.includes(breed)) return breed.charAt(0).toUpperCase() + breed.slice(1)
  }
  return null
}

// ── Urgency detection — USER speech only ────────────────────────────────────
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
