-- Security + performance hardening: scope service_full_access_* policies to the
-- `service_role` only. Previously they targeted `public` (the default), meaning
-- every role — including `authenticated` and `anon` — evaluated them on every
-- query. That triggered:
--   * 15 "RLS Policy Always True" security advisors
--   * 250 "multiple_permissive_policies" performance advisors
--     (because authenticated users were matching BOTH this and clinic_isolation)
--
-- In practice no data leaked because clinic_isolation was always also present,
-- but this is defense-in-depth hygiene. Service role bypasses RLS in Supabase
-- anyway, so these policies purely express intent; scoping them to service_role
-- is the correct expression. After this migration both advisor categories go
-- to zero.

ALTER POLICY service_full_access_audit_log          ON public.audit_log          TO service_role;
ALTER POLICY service_full_access_call_inbox         ON public.call_inbox         TO service_role;
ALTER POLICY service_full_access_calls              ON public.calls              TO service_role;
ALTER POLICY "Service role full access on clinic_invites" ON public.clinic_invites TO service_role;
ALTER POLICY service_full_access_clinic_users       ON public.clinic_users       TO service_role;
ALTER POLICY service_full_access_clinics            ON public.clinics            TO service_role;
ALTER POLICY service_full_access_coverage_sessions  ON public.coverage_sessions  TO service_role;
ALTER POLICY service_full_access_demo_requests      ON public.demo_requests      TO service_role;
ALTER POLICY service_full_access_notifications      ON public.notification_settings TO service_role;
ALTER POLICY service_full_access_onboarding         ON public.onboarding_steps   TO service_role;
ALTER POLICY service_full_access_subscriptions      ON public.subscriptions      TO service_role;
ALTER POLICY service_full_access_survey_actions     ON public.survey_actions     TO service_role;
ALTER POLICY service_full_access_survey_responses   ON public.survey_responses   TO service_role;
ALTER POLICY service_full_access_surveys            ON public.surveys            TO service_role;
ALTER POLICY service_full_access_voice_agents       ON public.voice_agents       TO service_role;
