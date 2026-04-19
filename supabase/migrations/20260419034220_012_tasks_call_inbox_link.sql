ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS call_inbox_id uuid REFERENCES public.call_inbox(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_call_inbox_id_idx
  ON public.tasks (call_inbox_id);
