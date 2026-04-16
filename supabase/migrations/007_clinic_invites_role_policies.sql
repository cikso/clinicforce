-- ══════════════════════════════════════════════════════════════════════════════
-- 007 — clinic_invites RLS: extend SELECT to clinic_owner + platform_owner
-- ══════════════════════════════════════════════════════════════════════════════
--
-- The existing policy only lets `clinic_admin` read invites for their clinic.
-- After the 4-role hierarchy roll-out:
--   - clinic_owner must be able to see pending invites for clinics they own
--     (so the /users page works when they're logged in).
--   - platform_owner must be able to see every invite (admin oversight).
--
-- Service-role writes are already covered by service_full_access_clinic_invites.

DROP POLICY IF EXISTS "Clinic admins can view their clinic invites" ON clinic_invites;

CREATE POLICY "clinic_invites_select_by_role" ON clinic_invites FOR SELECT
  USING (
    -- Platform owner sees every invite
    (my_role() = 'platform_owner')
    OR
    -- Clinic owner / admin sees invites for their own clinic(s)
    (clinic_id IN (
      SELECT cu.clinic_id
      FROM clinic_users cu
      WHERE cu.user_id = (SELECT auth.uid())
        AND cu.role IN ('clinic_owner', 'clinic_admin')
    ))
  );
