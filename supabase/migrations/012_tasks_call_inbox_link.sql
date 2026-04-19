-- Phase 1b of Action Queue rebuild: dedicated FK from tasks to call_inbox.
-- case_id is reserved for the legacy `cases` surface; linking tasks to calls
-- through that constraint forced placeholder cases to be created, which
-- muddled both tables. call_inbox_id is the single source of truth for
-- "this task came out of this AI-handled call".
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS call_inbox_id uuid REFERENCES public.call_inbox(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_call_inbox_id_idx
  ON public.tasks (call_inbox_id);

-- Backfill: create a task for every existing call_inbox row that has an
-- action_required and no linked task yet. Category + SLA inferred from
-- urgency + action/summary text, matching the runtime logic in the webhook
-- so new and historic tasks feel identical in the Action Queue UI.
WITH source_calls AS (
  SELECT
    ci.id                AS call_id,
    ci.clinic_id,
    ci.caller_name,
    ci.caller_phone,
    ci.pet_name,
    ci.summary,
    ci.ai_detail,
    ci.action_required,
    ci.urgency,
    ci.status            AS call_status,
    ci.created_at
  FROM public.call_inbox ci
  LEFT JOIN public.tasks t ON t.call_inbox_id = ci.id
  WHERE
    ci.action_required IS NOT NULL
    AND ci.action_required <> ''
    AND ci.action_required <> '—'
    AND t.id IS NULL
),
categorised AS (
  SELECT
    *,
    CASE
      WHEN urgency = 'CRITICAL'                                                  THEN 'EMERGENCY'
      WHEN action_required ILIKE '%emergenc%' OR summary ILIKE '%emergenc%'      THEN 'EMERGENCY'
      WHEN action_required ILIKE '%book%'   OR summary ILIKE '%appointment%'
        OR summary ILIKE '%book%'                                                THEN 'BOOKING'
      WHEN action_required ILIKE '%refill%' OR summary ILIKE '%prescription%'
        OR summary ILIKE '%medication%'                                          THEN 'RX'
      WHEN action_required ILIKE '%triage%' OR summary ILIKE '%triage%'
        OR summary ILIKE '%symptom%'                                             THEN 'TRIAGE'
      WHEN action_required ILIKE '%bill%'   OR summary ILIKE '%invoice%'
        OR summary ILIKE '%payment%'                                             THEN 'BILLING'
      WHEN action_required ILIKE '%record%' OR summary ILIKE '%history%'         THEN 'RECORDS'
      WHEN action_required ILIKE '%cancel%' OR summary ILIKE '%cancel%'          THEN 'CALLBACK'
      WHEN action_required ILIKE '%callback%' OR action_required ILIKE '%call back%' THEN 'CALLBACK'
      ELSE 'CALLBACK'
    END AS cat
  FROM source_calls
),
priced AS (
  SELECT
    *,
    CASE
      WHEN urgency = 'CRITICAL' THEN 'URGENT'
      WHEN urgency = 'URGENT'   THEN 'HIGH'
      ELSE 'NORMAL'
    END AS prio,
    CASE
      WHEN urgency = 'CRITICAL' THEN created_at + interval '30 minutes'
      WHEN urgency = 'URGENT'   THEN created_at + interval '4 hours'
      ELSE                           created_at + interval '1 day'
    END AS sla
  FROM categorised
)
INSERT INTO public.tasks (
  clinic_id, call_inbox_id, title, description,
  type, category, priority, status,
  source, sla_due_at, due_at, created_at, next_best_action
)
SELECT
  clinic_id,
  call_id,
  CASE cat
    WHEN 'BOOKING'   THEN 'Book: '    || caller_name || COALESCE(' · ' || NULLIF(pet_name,''), '')
    WHEN 'EMERGENCY' THEN 'EMERGENCY: ' || caller_name || COALESCE(' · ' || NULLIF(pet_name,''), '')
    WHEN 'RX'        THEN 'Rx refill: ' || caller_name || COALESCE(' · ' || NULLIF(pet_name,''), '')
    WHEN 'TRIAGE'    THEN 'Triage follow-up: ' || caller_name
    WHEN 'BILLING'   THEN 'Billing: ' || caller_name
    WHEN 'RECORDS'   THEN 'Records request: ' || caller_name
    ELSE                  'Callback: ' || caller_name
  END,
  COALESCE(action_required, summary),
  CASE cat
    WHEN 'EMERGENCY' THEN 'TRIAGE_REVIEW'
    WHEN 'BOOKING'   THEN 'FOLLOW_UP'
    WHEN 'TRIAGE'    THEN 'TRIAGE_REVIEW'
    ELSE                  'CALLBACK'
  END,
  cat,
  prio,
  CASE WHEN call_status = 'ACTIONED' THEN 'DONE' ELSE 'PENDING' END,
  'CALL',
  sla,
  sla,
  created_at,
  CASE cat
    WHEN 'EMERGENCY' THEN 'Call owner now · confirm transport to nearest emergency centre'
    WHEN 'BOOKING'   THEN 'Call back · offer next available slot · confirm pet details'
    WHEN 'RX'        THEN 'Verify last visit · call clinic · confirm refill pickup window'
    WHEN 'TRIAGE'    THEN 'Review AI summary · call owner · escalate to on-call vet if worsening'
    WHEN 'BILLING'   THEN 'Open invoice · call owner · arrange payment'
    WHEN 'RECORDS'   THEN 'Confirm identity · send records via secure portal'
    ELSE                  'Call owner back within SLA · confirm reason · action as needed'
  END
FROM priced;

UPDATE public.tasks
SET completed_at = created_at
WHERE status = 'DONE' AND completed_at IS NULL;
