-- Phase 1a of Action Queue rebuild: enrich tasks with AI-receptionist metadata.
-- Columns:
--   source           - origin of the task (CALL, MANUAL, SMS, VOICEMAIL, AUTO)
--   category         - Weave-style reason tag (BOOKING, CALLBACK, RX, TRIAGE, EMERGENCY, BILLING, RECORDS, OTHER)
--   sla_due_at       - SLA deadline derived from urgency; drives the countdown chip in the UI
--   snoozed_until    - if set and in future, task hidden from default views
--   next_best_action - short AI-suggested next step shown on detail pane
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS source           text,
  ADD COLUMN IF NOT EXISTS category         text,
  ADD COLUMN IF NOT EXISTS sla_due_at       timestamptz,
  ADD COLUMN IF NOT EXISTS snoozed_until    timestamptz,
  ADD COLUMN IF NOT EXISTS next_best_action text;

-- Speed up smart-folder queries (open tasks by clinic ordered by sla_due_at).
CREATE INDEX IF NOT EXISTS tasks_clinic_status_sla_idx
  ON public.tasks (clinic_id, status, sla_due_at);

-- Speed up linking to originating cases/calls through legacy case_id.
CREATE INDEX IF NOT EXISTS tasks_case_id_idx
  ON public.tasks (case_id);
