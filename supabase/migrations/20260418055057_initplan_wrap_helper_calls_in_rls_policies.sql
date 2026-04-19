-- Wrap my_clinic_id() and my_role() calls in (SELECT ...) so Postgres
-- evaluates them once per query (initplan) instead of potentially per-row.
-- Matches Supabase's RLS performance guidance for SECURITY DEFINER helpers.
-- No semantic change, measurable speedup at scale.

-- Straight clinic_id = my_clinic_id() patterns (FOR ALL)
ALTER POLICY clinic_isolation ON public.activity_log         USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.bookings             USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.call_inbox           USING (clinic_id = (SELECT my_clinic_id())) WITH CHECK (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.calls                USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.cases                USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.clinics              USING (id = (SELECT my_clinic_id())) WITH CHECK (id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.coverage_sessions    USING (clinic_id = (SELECT my_clinic_id())) WITH CHECK (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.media                USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.notification_settings USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.onboarding_steps     USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.owners               USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.pets                 USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.referrals            USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.staff                USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.survey_actions       USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.survey_responses     USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.surveys              USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.tasks                USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.triage_results       USING (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation ON public.voice_agents         USING (clinic_id = (SELECT my_clinic_id()));

-- Subscriptions split policies from earlier tonight
ALTER POLICY clinic_isolation_insert ON public.subscriptions WITH CHECK (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation_update ON public.subscriptions USING (clinic_id = (SELECT my_clinic_id())) WITH CHECK (clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_isolation_delete ON public.subscriptions USING (clinic_id = (SELECT my_clinic_id()));

-- clinic_users role-based policies
ALTER POLICY clinic_users_delete ON public.clinic_users USING ((SELECT my_role()) = 'platform_owner');
ALTER POLICY clinic_users_insert ON public.clinic_users WITH CHECK ((SELECT my_role()) = 'platform_owner' OR clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_users_select ON public.clinic_users USING ((SELECT my_role()) = 'platform_owner' OR clinic_id = (SELECT my_clinic_id()));
ALTER POLICY clinic_users_update ON public.clinic_users USING ((SELECT my_role()) = 'platform_owner' OR clinic_id = (SELECT my_clinic_id()));

-- clinic_invites role-based select
ALTER POLICY clinic_invites_select_by_role ON public.clinic_invites USING (
  (SELECT my_role()) = 'platform_owner'
  OR clinic_id IN (
    SELECT cu.clinic_id FROM public.clinic_users cu
    WHERE cu.user_id = (SELECT auth.uid())
      AND cu.role = ANY(ARRAY['clinic_owner','clinic_admin'])
  )
);
