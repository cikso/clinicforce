-- Consolidate the two overlapping audit_log SELECT policies into one.
-- Before: audit_log_clinic_admin_read + audit_log_platform_owner_read both
-- targeted `public` (all roles) for SELECT, triggering 5 multiple_permissive
-- warnings (one per role that could match: anon, authenticated, authenticator,
-- dashboard_user, supabase_privileged_role).
--
-- After: one policy scoped to `authenticated` that expresses both cases via OR.
-- Semantics identical, zero performance penalty on reads, one warning gone.

DROP POLICY IF EXISTS audit_log_clinic_admin_read ON public.audit_log;
DROP POLICY IF EXISTS audit_log_platform_owner_read ON public.audit_log;

CREATE POLICY audit_log_read ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clinic_users cu
      WHERE cu.user_id = (SELECT auth.uid())
        AND (
          cu.role = 'platform_owner'
          OR (cu.role = 'clinic_admin' AND cu.clinic_id = audit_log.clinic_id)
        )
    )
  );
