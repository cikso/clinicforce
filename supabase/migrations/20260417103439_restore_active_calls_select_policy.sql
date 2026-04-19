-- Restores the SELECT policy on active_calls that was present in
-- supabase/migrations/006_active_calls.sql but did not make it into the
-- Sydney baseline snapshot. Without this, authenticated client sessions
-- (LiveCallPulse realtime subscription) see zero rows.
CREATE POLICY "active_calls_select" ON public.active_calls FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.clinic_users WHERE user_id = (SELECT auth.uid())));
