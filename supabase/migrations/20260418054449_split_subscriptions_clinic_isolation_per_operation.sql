-- Split `clinic_isolation` on subscriptions from FOR ALL into three per-operation
-- policies (INSERT/UPDATE/DELETE only). This eliminates the SELECT overlap with
-- `clinic_members_can_read_own_subscription` without changing actual behavior —
-- reads go through the EXISTS-based policy which correctly handles multi-clinic
-- users and platform_owner override; writes retain the my_clinic_id() gate.

DROP POLICY IF EXISTS clinic_isolation ON public.subscriptions;

CREATE POLICY clinic_isolation_insert ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = my_clinic_id());

CREATE POLICY clinic_isolation_update ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (clinic_id = my_clinic_id())
  WITH CHECK (clinic_id = my_clinic_id());

CREATE POLICY clinic_isolation_delete ON public.subscriptions
  FOR DELETE TO authenticated
  USING (clinic_id = my_clinic_id());

-- Also scope the existing SELECT policy to `authenticated` (was `public`),
-- removing anon/authenticator/dashboard_user/supabase_privileged_role from the
-- multiple-permissive match set.
ALTER POLICY clinic_members_can_read_own_subscription ON public.subscriptions
  TO authenticated;
