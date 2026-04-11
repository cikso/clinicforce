import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase, normaliseAustralianPhone, validateSecret, validateWebhookHmac } from '@/lib/voice/shared'
import { withRetry } from '@/lib/utils/withRetry'

export const preferredRegion = 'syd1'

// ── Coverage reason labels ───────────────────────────────────────────────────
const COVERAGE_LABELS: Record<string, string> = {
  all_calls:      'All Calls',
  after_hours:    'After Hours',
  overflow:       'Overflow',
  emergency_only: 'Emergency Only',
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Try HMAC signature first, fall back to plain x-api-secret header
  const signature = req.headers.get('x-elevenlabs-signature')
  const hmacValid = await validateWebhookHmac(signature, rawBody)
  const headerValid = validateSecret(req)

  if (!hmacValid && !headerValid) {
    console.error('[inbox/webhook] 401 — auth failed. HMAC sig present:', !!signature, '| x-api-secret present:', !!req.headers.get('x-api-secret'))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Ignore audio and ping webhooks
  if (body.type === 'ping' || body.type === 'post_call_audio') {
    return NextResponse.json({ ok: true, action: 'ignored' })
  }

  const agentId      = (body.agent_id as string) ?? null
  const payload      = (body.data as Record<string, unknown>) ?? body
  const conversationId = (payload.conversation_id as string)
    ?? (body.conversation_id as string)
    ?? null
  const metadata     = (payload.metadata as Record<string, unknown>) ?? {}
  const phoneCall    = (metadata.phone_call as Record<string, unknown>) ?? {}
  const analysis     = (payload.analysis as Record<string, unknown>) ?? {}
  const dataCollection = (analysis.data_collection as Record<string, unknown>) ?? {}
  const transcript   = (payload.transcript as Array<{ role: string; message: string }>) ?? []

  console.log('[inbox/webhook] Pet-related payload fields:', JSON.stringify({
    conversation_id: conversationId,
    analysis_keys: Object.keys(analysis),
    data_collection: dataCollection,
    analysis_pet_name: analysis.pet_name ?? null,
    analysis_species: analysis.species ?? null,
    payload_pet_name: payload.pet_name ?? null,
    payload_species: payload.species ?? null,
  }))

  // ── Resolve clinic from Twilio "To" number ────────────────────────────────
  const toNumber = (phoneCall.to as string) ?? (body.to as string) ?? null

  // Try resolving clinic via phone number first, then via agent_id
  let clinicId: string | null = null
  let coverageReason: string | null = null
  let vertical: string = 'vet'

  if (toNumber) {
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('clinic_id, mode, elevenlabs_agent_id')
      .eq('twilio_phone_number', toNumber)
      .limit(1)
      .maybeSingle()

    if (voiceAgent?.clinic_id) {
      clinicId = voiceAgent.clinic_id
      coverageReason = COVERAGE_LABELS[voiceAgent.mode as string] ?? null
    }
  }

  // Fallback: resolve via agent_id if phone lookup failed
  if (!clinicId && agentId) {
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('clinic_id, mode')
      .eq('elevenlabs_agent_id', agentId)
      .limit(1)
      .maybeSingle()

    if (voiceAgent?.clinic_id) {
      clinicId = voiceAgent.clinic_id
      coverageReason = COVERAGE_LABELS[voiceAgent.mode as string] ?? null
    }
  }

  if (!clinicId) {
    console.error('[inbox/webhook] Could not resolve clinic. to:', toNumber, 'agent_id:', agentId)
    return NextResponse.json({ error: 'Could not resolve clinic' }, { status: 400 })
  }

  // Resolve vertical from clinic record
  const { data: clinicRecord } = await supabase
    .from('clinics')
    .select('vertical')
    .eq('id', clinicId)
    .single()

  if (clinicRecord?.vertical) {
    vertical = clinicRecord.vertical as string
  }

  const callDurationSecs =
    (metadata.call_duration_secs as number) ??
    (body.call_duration_secs as number) ??
    null

  const baseSummary =
    (analysis.transcript_summary as string) ||
    buildFallbackSummary(transcript)
  const aiSummary = enrichSummary(baseSummary, transcript)

  const urgency = detectUrgency(transcript)

  const structured = { analysis, dataCollection, payload }

  // ── Step 1: Exact conversation_id match ───────────────────────
  if (conversationId) {
    const { data: exactMatch } = await supabase
      .from('call_inbox')
      .select('id')
      .eq('elevenlabs_conversation_id', conversationId)
      .eq('clinic_id', clinicId)
      .maybeSingle()

    if (exactMatch) {
      const enriched = extractCallerInfo(transcript, '—', structured)
      const industryData = buildIndustryData(transcript, structured)
      await withRetry(async () => {
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

        if (updateErr) throw updateErr
      }, { label: 'webhook/call-inbox-upsert' }).catch((err) => {
        console.error('[inbox/webhook] Update error (exact match):', err)
      })
      return NextResponse.json({ ok: true, action: 'updated_exact' })
    }
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
    const enriched = extractCallerInfo(transcript, '—', structured)
    const industryData = buildIndustryData(transcript, structured)
    await withRetry(async () => {
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

      if (updateErr) throw updateErr
    }, { label: 'webhook/call-inbox-upsert' }).catch((err) => {
      console.error('[inbox/webhook] Update error (recent match):', err)
    })
    return NextResponse.json({ ok: true, action: 'updated_recent' })
  }

  // ── Step 3: No match — insert new row ──────────────────────────
  const rawPhone   =
    (phoneCall.caller_id as string) ??
    extractPhone(transcript.map(t => t.message).join(' ')) ??
    '—'
  const callerPhone = normaliseAustralianPhone(rawPhone)
  const callerInfo   = extractCallerInfo(transcript, callerPhone, structured)
  const industryData = buildIndustryData(transcript, structured)

  const actionRequired =
    urgency === 'CRITICAL' ? 'Urgent callback required — same-day assessment'
    : urgency === 'URGENT'  ? 'Call back today to follow up'
    :                         'Review and action when available'

  let newRow: { id: string } | null = null

  try {
    const result = await withRetry(async () => {
      const { data, error: insertErr } = await supabase
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

      if (insertErr) throw insertErr
      return data
    }, { label: 'webhook/call-inbox-upsert' })
    newRow = result
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[inbox/webhook] Insert error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
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

/** Check analysis, data_collection, then payload for a non-empty string field */
function resolveField(
  keys: string[],
  sources: { analysis: Record<string, unknown>; dataCollection: Record<string, unknown>; payload: Record<string, unknown> },
): string | null {
  for (const source of [sources.dataCollection, sources.analysis, sources.payload]) {
    for (const key of keys) {
      const val = source[key]
      if (typeof val === 'string' && val.trim() && val !== '—') return val.trim()
    }
  }
  return null
}

/** Scan transcript for notable topics the base summary might have missed */
function enrichSummary(
  base: string,
  transcript: Array<{ role: string; message: string }>,
): string {
  const fullText = transcript.map(t => t.message).join(' ').toLowerCase()
  const baseLower = base.toLowerCase()
  const extras: string[] = []

  // Pricing / cost inquiry
  if (/\b(how much|price|pricing|cost|fee|charge|rate|quote)\b/.test(fullText) && !/\b(pric|cost|fee|charge|quote)\b/.test(baseLower)) {
    extras.push('Caller asked about pricing — directed to confirm with the team.')
  }

  // Insurance question
  if (/\b(insurance|claim|pet insurance|cover)\b/.test(fullText) && !/insurance/.test(baseLower)) {
    extras.push('Caller asked about insurance/coverage.')
  }

  // Medication / prescription
  if (/\b(medication|prescription|refill|tablets|pills|medicine)\b/.test(fullText) && !/\b(medicat|prescript|refill)\b/.test(baseLower)) {
    extras.push('Caller mentioned medication/prescription needs.')
  }

  // Second opinion / referral
  if (/\b(second opinion|referr|specialist)\b/.test(fullText) && !/\b(referr|specialist|second opinion)\b/.test(baseLower)) {
    extras.push('Caller asked about referral/specialist.')
  }

  // Multiple pets
  if (/\b(both pets|other pet|another pet|two (dogs|cats|pets)|second (dog|cat|pet))\b/.test(fullText) && !/\bmultiple\b/.test(baseLower)) {
    extras.push('Caller mentioned multiple pets.')
  }

  if (extras.length === 0) return base
  return base.replace(/\.?\s*$/, '. ') + extras.join(' ')
}

function buildFallbackSummary(transcript: Array<{ role: string; message: string }>): string {
  const userLines = transcript
    .filter(t => t.role === 'user')
    .map(t => t.message)
    .join(' ')
  return userLines.slice(0, 500) || 'No summary available.'
}

function buildIndustryData(
  transcript: Array<{ role: string; message: string }>,
  structured: { analysis: Record<string, unknown>; dataCollection: Record<string, unknown>; payload: Record<string, unknown> },
) {
  const fullText = transcript.map(t => t.message).join(' ')
  const petName = resolveField(['pet_name'], structured) ?? extractPetName(fullText)
  const petSpecies = resolveField(['species', 'pet_species'], structured) ?? extractPetSpecies(fullText)
  const petBreed = resolveField(['pet_breed', 'breed'], structured) ?? extractPetBreed(fullText)
  return {
    pet_name:    petName ?? null,
    pet_species: petSpecies ?? null,
    pet_breed:   petBreed ?? null,
  }
}

function extractCallerInfo(
  transcript: Array<{ role: string; message: string }>,
  callerPhone: string,
  structured: { analysis: Record<string, unknown>; dataCollection: Record<string, unknown>; payload: Record<string, unknown> },
) {
  const fullText = transcript.map(t => t.message).join(' ')
  const name = resolveField(['caller_name', 'owner_name'], structured) ?? extractName(transcript) ?? 'Unknown caller'
  const petName = resolveField(['pet_name'], structured) ?? extractPetName(fullText) ?? '—'
  const petSpecies = resolveField(['species', 'pet_species'], structured) ?? extractPetSpecies(fullText) ?? '—'
  return {
    name,
    phone:      callerPhone,
    petName,
    petSpecies,
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
