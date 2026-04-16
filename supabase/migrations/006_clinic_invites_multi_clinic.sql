-- Multi-clinic owner invites: a single invite can grant clinic_owner access
-- across multiple clinics in one accept. The primary clinic_id is the "first"
-- clinic; extra_clinic_ids holds the rest. On accept, the handler creates one
-- clinic_users row per (clinic_id + extra_clinic_ids).
ALTER TABLE clinic_invites
  ADD COLUMN IF NOT EXISTS extra_clinic_ids uuid[] DEFAULT NULL;

COMMENT ON COLUMN clinic_invites.extra_clinic_ids IS
  'Additional clinic ids granted in a single multi-clinic owner invite. NULL or empty means single-clinic invite.';
