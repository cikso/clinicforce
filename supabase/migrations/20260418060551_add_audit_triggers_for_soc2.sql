-- SOC2 groundwork: automatic change tracking on security-sensitive tables.
-- Writes INSERT/UPDATE/DELETE events into public.audit_log via SECURITY DEFINER
-- trigger, so RLS on audit_log cannot block the write.

create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old        jsonb;
  v_new        jsonb;
  v_record_id  uuid;
  v_clinic_id  uuid;
  v_actor      uuid;
  v_actor_email text;
begin
  begin
    v_actor := auth.uid();
  exception when others then
    v_actor := null;
  end;

  begin
    v_actor_email := nullif(auth.jwt() ->> 'email', '');
  exception when others then
    v_actor_email := null;
  end;

  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
  elsif tg_op = 'INSERT' then
    v_new := to_jsonb(new);
  else
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
  end if;

  v_record_id := coalesce((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid);

  if tg_table_name = 'clinics' then
    v_clinic_id := v_record_id;
  else
    v_clinic_id := coalesce(
      (v_new ->> 'clinic_id')::uuid,
      (v_old ->> 'clinic_id')::uuid
    );
  end if;

  insert into public.audit_log (
    clinic_id, actor_id, actor_email, action, resource, metadata
  ) values (
    v_clinic_id,
    v_actor,
    v_actor_email,
    lower(tg_op) || '.' || tg_table_name,
    tg_table_schema || '.' || tg_table_name || coalesce(':' || v_record_id::text, ''),
    jsonb_build_object(
      'table',  tg_table_name,
      'op',     tg_op,
      'old',    v_old,
      'new',    v_new
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

comment on function public.audit_trigger_fn() is
  'SOC2 change tracking. Writes INSERT/UPDATE/DELETE events on audited tables into public.audit_log. SECURITY DEFINER so it can bypass audit_log RLS.';

revoke all on function public.audit_trigger_fn() from public;

drop trigger if exists audit_clinics        on public.clinics;
drop trigger if exists audit_clinic_users   on public.clinic_users;
drop trigger if exists audit_subscriptions  on public.subscriptions;
drop trigger if exists audit_voice_agents   on public.voice_agents;

create trigger audit_clinics
  after insert or update or delete on public.clinics
  for each row execute function public.audit_trigger_fn();

create trigger audit_clinic_users
  after insert or update or delete on public.clinic_users
  for each row execute function public.audit_trigger_fn();

create trigger audit_subscriptions
  after insert or update or delete on public.subscriptions
  for each row execute function public.audit_trigger_fn();

create trigger audit_voice_agents
  after insert or update or delete on public.voice_agents
  for each row execute function public.audit_trigger_fn();
