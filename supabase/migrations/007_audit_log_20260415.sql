-- ══════════════════════════════════════════════════════════════════════════════
-- Audit log (2026-04-15)
-- Applied via Supabase MCP as migration `add_audit_log_table_20260415`.
--
-- Append-only ledger of security-relevant events. Read-only for tenants:
--   - Clinic admins can read their own clinic's events.
--   - Platform owners can read all events.
--   - Writes go through service_role from API routes.
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid references public.clinics(id) on delete set null,
  actor_id     uuid references auth.users(id) on delete set null,
  actor_email  text,
  action       text not null,
  resource     text,
  ip           text,
  user_agent   text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_audit_log_clinic_id_created
  on public.audit_log(clinic_id, created_at desc);
create index if not exists idx_audit_log_action
  on public.audit_log(action);
create index if not exists idx_audit_log_actor_id
  on public.audit_log(actor_id);

alter table public.audit_log enable row level security;

create policy "service_full_access_audit_log"
  on public.audit_log
  for all
  to service_role
  using (true)
  with check (true);

create policy "audit_log_clinic_admin_read"
  on public.audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.clinic_users cu
      where cu.user_id = (select auth.uid())
        and cu.role = 'clinic_admin'
        and cu.clinic_id = audit_log.clinic_id
    )
  );

create policy "audit_log_platform_owner_read"
  on public.audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.clinic_users cu
      where cu.user_id = (select auth.uid())
        and cu.role = 'platform_owner'
    )
  );
