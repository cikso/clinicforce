-- 009_active_calls_replica_identity_full.sql
--
-- Ensure Supabase realtime DELETE events carry the full old-row payload.
-- Without FULL, the client receives only the primary key on DELETE which
-- means the LiveCallPulse hook can't filter "was this Stella?" and the
-- subscription handler drops the event unconditionally — leading to the
-- "topbar pulse doesn't clear without refresh" bug.
--
-- Applied to production 2026-04-18 via Supabase MCP.

ALTER TABLE public.active_calls REPLICA IDENTITY FULL;
