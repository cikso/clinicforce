-- Ensure Supabase realtime DELETE events carry the full old-row payload.
-- Without FULL, the client receives only the primary key on DELETE which
-- means the LiveCallPulse hook can't filter "was this Stella?" and the
-- subscription handler drops the event unconditionally.
ALTER TABLE public.active_calls REPLICA IDENTITY FULL;
