ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS source           text,
  ADD COLUMN IF NOT EXISTS category         text,
  ADD COLUMN IF NOT EXISTS sla_due_at       timestamptz,
  ADD COLUMN IF NOT EXISTS snoozed_until    timestamptz,
  ADD COLUMN IF NOT EXISTS next_best_action text;

CREATE INDEX IF NOT EXISTS tasks_clinic_status_sla_idx
  ON public.tasks (clinic_id, status, sla_due_at);

CREATE INDEX IF NOT EXISTS tasks_case_id_idx
  ON public.tasks (case_id);
