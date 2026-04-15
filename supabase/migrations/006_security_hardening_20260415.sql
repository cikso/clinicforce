-- ══════════════════════════════════════════════════════════════════════════════
-- Security + performance hardening pass (2026-04-15)
-- Applied via Supabase MCP as migration `security_hardening_20260415`
-- (version 20260415054415 in supabase_migrations.schema_migrations).
--
--   1. Drop unrestricted anon INSERT on demo_requests (was a spam vector).
--      /api/demo now uses SUPABASE_SERVICE_ROLE_KEY and fails loud if missing.
--   2. Fix subscriptions RLS auth.uid() re-evaluation per row (perf).
--   3. Restrict clinic_isolation policy on call_inbox from role {public}
--      to {authenticated}. Anon inserts are still governed by the explicit
--      anon_insert_demo_call_inbox policy (demo clinic UUID only).
--   4. Add missing FK covering indexes on survey_responses / survey_actions.
-- ══════════════════════════════════════════════════════════════════════════════

drop policy if exists "anon_insert_demo_requests" on public.demo_requests;

drop policy if exists "clinic_members_can_read_own_subscription" on public.subscriptions;
create policy "clinic_members_can_read_own_subscription"
  on public.subscriptions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clinic_users cu
      where cu.user_id = (select auth.uid())
        and (cu.clinic_id = subscriptions.clinic_id or cu.role = 'platform_owner')
    )
  );

do $$
declare
  t text;
  tables text[] := array['call_inbox'];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "clinic_isolation" on public.%I', t);
    execute format($f$
      create policy "clinic_isolation" on public.%I
        for all
        to authenticated
        using (clinic_id = my_clinic_id())
        with check (clinic_id = my_clinic_id())
    $f$, t);
  end loop;
end $$;

create index if not exists idx_survey_responses_clinic_id
  on public.survey_responses(clinic_id);

create index if not exists idx_survey_actions_clinic_id
  on public.survey_actions(clinic_id);

create index if not exists idx_survey_actions_survey_response_id
  on public.survey_actions(survey_response_id);
