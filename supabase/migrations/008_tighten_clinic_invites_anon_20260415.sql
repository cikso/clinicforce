-- ══════════════════════════════════════════════════════════════════════════════
-- Remove the anon-readable view of pending invites (2026-04-15)
-- Applied via Supabase MCP as migration `tighten_clinic_invites_anon_20260415`.
--
-- The previous policy "Anon can read valid invite by token" had no row-level
-- predicate beyond `accepted_at IS NULL AND expires_at > now()`, which let any
-- caller with the anon key enumerate every pending invite — leaking emails
-- and clinic_ids.
--
-- The /invite/[token] page already uses service_role for lookup, so dropping
-- the anon SELECT is a code-no-op. Service role + clinic-admin SELECT
-- policies remain in place.
-- ══════════════════════════════════════════════════════════════════════════════

drop policy if exists "Anon can read valid invite by token" on public.clinic_invites;
