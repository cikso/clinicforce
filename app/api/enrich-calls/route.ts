import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getServiceSupabase } from '@/lib/voice/shared'
import { ensureTaskAndActivity } from '@/lib/calls/auto-tasks'

export const preferredRegion = 'syd1'
export const maxDuration = 30

/**
 * GET /api/enrich-calls
 *
 * Fetches rich summaries from the ElevenLabs Conversations API and updates
 * call_inbox rows that only have the short tool-generated summary.
 *
 * Matching strategy:
 *   - Fetch recent conversations from ElevenLabs (last 50)
 *   - For each call_inbox row missing a rich summary (created in last 24h),
 *     match by elevenlabs_conversation_id if present, otherwise by timestamp
 *   - Update summary + ai_detail with the rich transcript_summary
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 })
  }

  const supabase = getServiceSupabase()

  // 1. Get recent call_inbox rows that need enrichment (last 24h, short summary)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: rows, error: rowsErr } = await supabase
    .from('call_inbox')
    .select('id, clinic_id, created_at, elevenlabs_conversation_id, summary, ai_detail, caller_name, pet_name, urgency, action_required, coverage_reason')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(50)

  if (rowsErr || !rows?.length) {
    return NextResponse.json({ enriched: 0, reason: rowsErr?.message ?? 'no rows' })
  }

  // 2. Fetch recent conversations from ElevenLabs
  let elConversations: Array<Record<string, unknown>> = []
  try {
    const res = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversations?page_size=50',
      { headers: { 'xi-api-key': apiKey }, signal: AbortSignal.timeout(10_000) },
    )
    const data = await res.json()
    elConversations = (data.conversations as Array<Record<string, unknown>>) ?? []
  } catch (err) {
    console.error('[enrich-calls] Failed to fetch ElevenLabs conversations:', err)
    Sentry.captureException(err, { tags: { route: 'enrich-calls', phase: 'list' } })
    return NextResponse.json({ error: 'Failed to fetch from ElevenLabs' }, { status: 502 })
  }

  console.log(`[enrich-calls] Found ${rows.length} inbox rows, ${elConversations.length} EL conversations`)

  let enriched = 0

  for (const row of rows) {
    // Skip rows that already have a rich transcript-level summary. The
    // initial tool-generated summary (from /api/callback or /api/inbox/webhook)
    // can be up to ~500 chars; ElevenLabs' `transcript_summary` is typically
    // 800-3000 chars. 800 is the cutoff that distinguishes "already enriched"
    // from "still the short initial summary". Previously this was 200, which
    // meant every new call was being skipped because its initial ai_detail
    // exceeded 200 — so the rich transcript_summary never reached the DB.
    if (row.ai_detail && (row.ai_detail as string).length > 800) continue

    let matchedConv: Record<string, unknown> | null = null

    // Strategy 1: Match by conversation_id if we have one
    if (row.elevenlabs_conversation_id) {
      matchedConv = elConversations.find(
        c => c.conversation_id === row.elevenlabs_conversation_id,
      ) ?? null
    }

    // Strategy 2: Match by timestamp (within 5 min window)
    if (!matchedConv) {
      const rowTime = new Date(row.created_at as string).getTime() / 1000
      matchedConv = elConversations.find(c => {
        const elTime = c.start_time_unix_secs as number
        return Math.abs(elTime - rowTime) < 300 // within 5 minutes
      }) ?? null
    }

    if (!matchedConv) continue

    // Fetch full conversation detail for rich summary
    const convId = matchedConv.conversation_id as string
    let richSummary: string | null = null
    let callTitle: string | null = null

    // Check if list already has transcript_summary
    if (matchedConv.transcript_summary) {
      richSummary = matchedConv.transcript_summary as string
    }
    if (matchedConv.call_summary_title) {
      callTitle = matchedConv.call_summary_title as string
    }

    // If not on list, fetch the detail
    if (!richSummary) {
      try {
        const detailRes = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${convId}`,
          { headers: { 'xi-api-key': apiKey }, signal: AbortSignal.timeout(10_000) },
        )
        const detail = await detailRes.json()
        richSummary = (detail.analysis?.transcript_summary as string) ?? null
        callTitle = (detail.analysis?.call_summary_title as string) ?? null
      } catch (err) {
        console.error(`[enrich-calls] Failed to fetch detail for ${convId}:`, err)
        Sentry.captureException(err, { tags: { route: 'enrich-calls', phase: 'detail' }, extra: { convId } })
        continue
      }
    }

    if (!richSummary) continue

    // Update the row
    const updateData: Record<string, unknown> = {
      ai_detail: richSummary,
      summary: richSummary.slice(0, 300),
      elevenlabs_conversation_id: convId,
    }

    const { error: updateErr } = await supabase
      .from('call_inbox')
      .update(updateData)
      .eq('id', row.id)

    if (updateErr) {
      console.error(`[enrich-calls] Update failed for ${row.id}:`, updateErr)
      continue
    }

    enriched++
    console.log(`[enrich-calls] Enriched row ${row.id} with summary from ${convId}`)

    // Backfill task + activity_log for calls where ElevenLabs never fired the
    // post-call webhook. Idempotent — no-op if they already exist.
    await ensureTaskAndActivity(supabase, {
      id:              row.id as string,
      clinic_id:       row.clinic_id as string,
      caller_name:     (row.caller_name as string | null) ?? null,
      pet_name:        (row.pet_name as string | null) ?? null,
      summary:         (updateData.summary as string | null) ?? (row.summary as string | null) ?? null,
      ai_detail:       (updateData.ai_detail as string | null) ?? (row.ai_detail as string | null) ?? null,
      urgency:         (row.urgency as string | null) ?? null,
      action_required: (row.action_required as string | null) ?? null,
      coverage_reason: (row.coverage_reason as string | null) ?? null,
    })
  }

  return NextResponse.json({ enriched, total_rows: rows.length, el_conversations: elConversations.length })
}
