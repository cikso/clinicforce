import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getServiceSupabase, normaliseAustralianPhone, validateSecret, validateWebhookHmac } from '@/lib/voice/shared'
import { withRetry } from '@/lib/utils/withRetry'
import { ensureTaskAndActivity } from '@/lib/calls/auto-tasks'

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
  // ElevenLabs sends the signature as "ElevenLabs-Signature" (case-insensitive in fetch)
  const signature = req.headers.get('ElevenLabs-Signature') ?? req.headers.get('elevenlabs-signature')
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

  console.log('[inbox/webhook] FULL PAYLOAD KEYS:', JSON.stringify({
    top_level_keys: Object.keys(body),
    payload_keys: Object.keys(payload),
    analysis_keys: Object.keys(analysis),
    analysis_full: analysis,
    metadata_keys: Object.keys(metadata),
    conversation_id: conversationId,
    data_collection: dataCollection,
  }))
  console.log('[inbox/webhook] SUMMARY FIELDS:', JSON.stringify({
    'analysis.transcript_summary': analysis.transcript_summary ?? null,
    'analysis.summary': analysis.summary ?? null,
    'analysis.call_summary': analysis.call_summary ?? null,
    'payload.summary': payload.summary ?? null,
    'payload.call_summary': payload.call_summary ?? null,
    'body.summary': body.summary ?? null,
    'analysis.evaluation_criteria_results': analysis.evaluation_criteria_results ?? null,
    'analysis.call_successful': analysis.call_successful ?? null,
  }))

  // ── Resolve clinic from Twilio "To" number ────────────────────────────────
  const toNumber = (phoneCall.to as string) ?? (body.to as string) ?? null

  // Resolve clinic from Twilio To number → voice_agents
  let clinicId: string | null = null
  let coverageReason: string | null = null
  let vertical: string = 'vet'

  if (toNumber) {
    const { data: voiceAgent } = await supabase
      .from('voice_agents')
      .select('clinic_id, mode')
      .eq('twilio_phone_number', toNumber)
      .limit(1)
      .maybeSingle()

    if (voiceAgent?.clinic_id) {
      clinicId = voiceAgent.clinic_id
      coverageReason = COVERAGE_LABELS[voiceAgent.mode as string] ?? null
    }
  }

  if (!clinicId) {
    console.error('[inbox/webhook] Unknown agent phone number:', toNumber)
    return NextResponse.json({ error: 'Unknown agent phone number' }, { status: 400 })
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

  // The REAL caller's PSTN phone. ElevenLabs' post-call webhook surfaces
  // this under `metadata.phone_call.external_number` (NOT `caller_id` — an
  // earlier draft of this code read the wrong field name, which is why
  // Stella's asked-for-phone was winning on every call). Also try top-level
  // body fields and the initiate-style `to`/`from` fallbacks in case
  // ElevenLabs evolves the schema.
  const bodyFrom = (body as Record<string, unknown>).from
  const twilioCallerId =
    (typeof phoneCall.external_number === 'string' && phoneCall.external_number.trim())
    || (typeof phoneCall.caller_id === 'string' && phoneCall.caller_id.trim())
    || (typeof phoneCall.from_number === 'string' && phoneCall.from_number.trim())
    || (typeof bodyFrom === 'string' && bodyFrom.trim())
    || ''
  const twilioCallerName = typeof phoneCall.external_caller_id_name === 'string'
    ? phoneCall.external_caller_id_name.trim()
    : ''

  // ── Step 1: Exact conversation_id match ───────────────────────
  if (conversationId) {
    const { data: exactMatch } = await supabase
      .from('call_inbox')
      .select('id, caller_phone, caller_name, stated_phone')
      .eq('elevenlabs_conversation_id', conversationId)
      .eq('clinic_id', clinicId)
      .maybeSingle()

    if (exactMatch) {
      const enriched = extractCallerInfo(transcript, '—', structured)
      const industryData = buildIndustryData(transcript, structured)

      // Twilio's caller_id is the AUTHORITATIVE phone for inbound calls —
      // gets overwritten onto caller_phone by /api/twilio/status from
      // active_calls. Here we only update caller_phone if the webhook
      // payload happens to include one. stated_phone (what the caller
      // said) is backfilled only if missing, never overwritten — the
      // Stella tool that created the row already captured it.
      // Name: Twilio only has external_caller_id_name (AU rarely populates
      // this via CNAM). Fall back only if we have no name yet.
      const existingName = (exactMatch.caller_name ?? '').trim()
      const needsNameBackfill = !existingName || existingName.toLowerCase() === 'unknown caller'
      const existingStated = ((exactMatch as { stated_phone?: string | null }).stated_phone ?? '').trim()
      const transcriptPhone = enriched.phone && enriched.phone !== '—' ? enriched.phone : ''

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
            ...(twilioCallerId ? { caller_phone: twilioCallerId } : {}),
            ...(!existingStated && transcriptPhone ? { stated_phone: transcriptPhone } : {}),
            ...(needsNameBackfill && twilioCallerName ? { caller_name: twilioCallerName } : {}),
          })
          .eq('id', exactMatch.id)

        if (updateErr) throw updateErr
      }, { label: 'webhook/call-inbox-upsert' }).catch((err) => {
        console.error('[inbox/webhook] Update error (exact match):', err)
        Sentry.captureException(err, { tags: { route: 'inbox/webhook', phase: 'exact-match' } })
      })

      await ensureTaskAndActivity(supabase, {
        id:              exactMatch.id,
        clinic_id:       clinicId,
        caller_name:     (needsNameBackfill && twilioCallerName ? twilioCallerName : exactMatch.caller_name) ?? null,
        pet_name:        enriched.petName !== '—' ? enriched.petName : null,
        summary:         aiSummary.slice(0, 300),
        ai_detail:       aiSummary,
        urgency,
        action_required: null,
        coverage_reason: coverageReason,
      })

      return NextResponse.json({ ok: true, action: 'updated_exact' })
    }
  }

  // ── Step 2: Recent tool-created row (no conversation_id, within 10 mins) ──
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data: recentMatch } = await supabase
    .from('call_inbox')
    .select('id, caller_phone, caller_name, stated_phone')
    .eq('clinic_id', clinicId)
    .is('elevenlabs_conversation_id', null)
    .gte('created_at', tenMinsAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recentMatch) {
    const enriched = extractCallerInfo(transcript, '—', structured)
    const industryData = buildIndustryData(transcript, structured)

    // Same logic as Step 1. caller_phone is the PSTN truth (stamped by
    // /api/twilio/status). stated_phone is what the caller said — backfill
    // only if missing. Name only backfills when missing.
    const existingName = (recentMatch.caller_name ?? '').trim()
    const needsNameBackfill = !existingName || existingName.toLowerCase() === 'unknown caller'
    const existingStated = ((recentMatch as { stated_phone?: string | null }).stated_phone ?? '').trim()
    const transcriptPhone = enriched.phone && enriched.phone !== '—' ? enriched.phone : ''

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
          ...(twilioCallerId ? { caller_phone: twilioCallerId } : {}),
          ...(!existingStated && transcriptPhone ? { stated_phone: transcriptPhone } : {}),
          ...(needsNameBackfill && twilioCallerName ? { caller_name: twilioCallerName } : {}),
        })
        .eq('id', recentMatch.id)

      if (updateErr) throw updateErr
    }, { label: 'webhook/call-inbox-upsert' }).catch((err) => {
      console.error('[inbox/webhook] Update error (recent match):', err)
      Sentry.captureException(err, { tags: { route: 'inbox/webhook', phase: 'recent-match' } })
    })

    await ensureTaskAndActivity(supabase, {
      id:              recentMatch.id,
      clinic_id:       clinicId,
      caller_name:     (needsNameBackfill && twilioCallerName ? twilioCallerName : recentMatch.caller_name) ?? null,
      pet_name:        enriched.petName !== '—' ? enriched.petName : null,
      summary:         aiSummary.slice(0, 300),
      ai_detail:       aiSummary,
      urgency,
      action_required: null,
      coverage_reason: coverageReason,
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
          // caller_phone: prefer the authoritative Twilio PSTN (stamped
          // by /api/twilio/status when active_calls row exists). Fall
          // back to the transcript-extracted phone if we somehow got
          // here without an active_calls row.
          caller_phone:               twilioCallerId || callerInfo.phone,
          // stated_phone: always what the caller said in the conversation.
          stated_phone:               callerInfo.phone && callerInfo.phone !== '—' ? callerInfo.phone : null,
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
    Sentry.captureException(err, { tags: { route: 'inbox/webhook', phase: 'insert' } })
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Single source of truth for task + activity creation lives in
  // lib/calls/auto-tasks.ts so the enrich-calls cron produces identical rows
  // when ElevenLabs skips this webhook (the common case in prod).
  if (newRow?.id) {
    await ensureTaskAndActivity(supabase, {
      id:              newRow.id,
      clinic_id:       clinicId,
      caller_name:     callerInfo.name,
      pet_name:        callerInfo.petName !== '—' ? callerInfo.petName : null,
      summary:         aiSummary.slice(0, 300),
      ai_detail:       aiSummary,
      urgency,
      action_required: actionRequired,
      coverage_reason: coverageReason,
    })
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
