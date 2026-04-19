import type { SupabaseClient } from '@supabase/supabase-js'

export type TaskCategory =
  | 'EMERGENCY'
  | 'BOOKING'
  | 'RX'
  | 'TRIAGE'
  | 'BILLING'
  | 'RECORDS'
  | 'CALLBACK'

export interface AutoTaskInput {
  id:               string
  clinic_id:        string
  caller_name:      string | null
  pet_name:         string | null
  summary:          string | null
  ai_detail:        string | null
  urgency:          string | null
  action_required:  string | null
  coverage_reason:  string | null
}

export interface AutoTaskResult {
  taskCreated:     boolean
  activityCreated: boolean
}

/**
 * Idempotently ensure a follow-up task + activity_log entry exist for a
 * call_inbox row. Safe to call from multiple ingress paths (post-call webhook,
 * enrich-calls cron, manual backfill) — re-runs are no-ops once the task and
 * activity entry exist.
 *
 * Single source of truth for task shape. Lives here so the webhook and the
 * cron produce identical task rows even when ElevenLabs never fires the
 * post-call webhook (the common case in prod).
 */
export async function ensureTaskAndActivity(
  supabase: SupabaseClient,
  row: AutoTaskInput,
): Promise<AutoTaskResult> {
  const urgency        = row.urgency ?? 'ROUTINE'
  const actionRequired = row.action_required ?? inferActionRequired(urgency)
  const summary        = row.ai_detail ?? row.summary ?? ''
  const callerName     = (row.caller_name ?? '').trim() || 'Unknown caller'

  // ── Task ────────────────────────────────────────────────────────
  const { data: existingTask } = await supabase
    .from('tasks')
    .select('id')
    .eq('call_inbox_id', row.id)
    .limit(1)
    .maybeSingle()

  let taskCreated = false
  if (!existingTask) {
    const { category, nextBestAction, taskType } = inferTaskMeta({
      urgency,
      summary,
      actionRequired,
    })

    const priority =
      urgency === 'CRITICAL' ? 'URGENT'
      : urgency === 'URGENT' ? 'HIGH'
      : 'NORMAL'

    const slaMs =
      urgency === 'CRITICAL' ? 30 * 60 * 1000          // 30 min
      : urgency === 'URGENT' ? 4 * 60 * 60 * 1000      // 4 hr
      :                        24 * 60 * 60 * 1000     // 1 day
    const slaDueAt = new Date(Date.now() + slaMs).toISOString()

    const prettyPet = row.pet_name && row.pet_name !== '—' ? ` · ${row.pet_name}` : ''
    const title = titleForCategory(category, callerName, prettyPet)

    const { error } = await supabase.from('tasks').insert({
      clinic_id:        row.clinic_id,
      call_inbox_id:    row.id,
      title,
      description:      actionRequired,
      type:             taskType,
      category,
      priority,
      status:           'PENDING',
      source:           'CALL',
      sla_due_at:       slaDueAt,
      due_at:           slaDueAt,
      next_best_action: nextBestAction,
    })

    if (error) {
      console.error('[auto-tasks] Task insert error:', error)
    } else {
      taskCreated = true
    }
  }

  // ── Activity log ────────────────────────────────────────────────
  const { data: existingActivity } = await supabase
    .from('activity_log')
    .select('id')
    .eq('clinic_id', row.clinic_id)
    .eq('type', 'CALL')
    .contains('metadata', { call_inbox_id: row.id })
    .limit(1)
    .maybeSingle()

  let activityCreated = false
  if (!existingActivity) {
    const { error } = await supabase.from('activity_log').insert({
      clinic_id: row.clinic_id,
      type:      'CALL',
      message:   `AI call from ${callerName}: ${summary.slice(0, 120)}`,
      metadata:  {
        call_inbox_id:   row.id,
        urgency,
        coverage_reason: row.coverage_reason,
      },
    })

    if (error) {
      console.error('[auto-tasks] Activity log insert error:', error)
    } else {
      activityCreated = true
    }
  }

  return { taskCreated, activityCreated }
}

export function inferActionRequired(urgency: string | null): string {
  return urgency === 'CRITICAL' ? 'Urgent callback required — same-day assessment'
       : urgency === 'URGENT'   ? 'Call back today to follow up'
       :                          'Review and action when available'
}

/**
 * Classify a call into the Action Queue taxonomy and suggest a next-best action.
 * CRITICAL urgency or explicit emergency language → EMERGENCY; everything else
 * falls through the keyword ladder in priority order.
 */
export function inferTaskMeta({
  urgency,
  summary,
  actionRequired,
}: {
  urgency:        string
  summary:        string
  actionRequired: string
}): { category: TaskCategory; nextBestAction: string; taskType: string } {
  const text = `${(summary ?? '').toLowerCase()} ${(actionRequired ?? '').toLowerCase()}`

  let category: TaskCategory
  if (urgency === 'CRITICAL' || /emergenc|collapse|unconscious|bleeding|seizure/.test(text)) {
    category = 'EMERGENCY'
  } else if (/book|appointment|schedule|reschedule/.test(text)) {
    category = 'BOOKING'
  } else if (/refill|prescription|medication|tablets|pills/.test(text)) {
    category = 'RX'
  } else if (/triage|symptom|not eating|lethargic|limp|vomit|diarrh/.test(text)) {
    category = 'TRIAGE'
  } else if (/invoice|billing|payment|refund|charge/.test(text)) {
    category = 'BILLING'
  } else if (/record|history|transfer|file/.test(text)) {
    category = 'RECORDS'
  } else {
    category = 'CALLBACK'
  }

  const nextBestAction =
    category === 'EMERGENCY' ? 'Call owner now · confirm transport to nearest emergency centre'
    : category === 'BOOKING' ? 'Call back · offer next available slot · confirm pet details'
    : category === 'RX'      ? 'Verify last visit · call clinic · confirm refill pickup window'
    : category === 'TRIAGE'  ? 'Review AI summary · call owner · escalate to on-call vet if worsening'
    : category === 'BILLING' ? 'Open invoice · call owner · arrange payment'
    : category === 'RECORDS' ? 'Confirm identity · send records via secure portal'
    :                          'Call owner back within SLA · confirm reason · action as needed'

  const taskType =
    category === 'EMERGENCY' || category === 'TRIAGE' ? 'TRIAGE_REVIEW'
    : category === 'BOOKING'                          ? 'FOLLOW_UP'
    :                                                   'CALLBACK'

  return { category, nextBestAction, taskType }
}

function titleForCategory(category: TaskCategory, caller: string, prettyPet: string): string {
  switch (category) {
    case 'EMERGENCY': return `EMERGENCY: ${caller}${prettyPet}`
    case 'BOOKING':   return `Book: ${caller}${prettyPet}`
    case 'RX':        return `Rx refill: ${caller}${prettyPet}`
    case 'TRIAGE':    return `Triage follow-up: ${caller}`
    case 'BILLING':   return `Billing: ${caller}`
    case 'RECORDS':   return `Records request: ${caller}`
    case 'CALLBACK':  return `Callback: ${caller}`
  }
}
