-- ─────────────────────────────────────────────────────────────
-- Bootstrap platform owner for admin@clinicforce.io
-- Run this in Supabase SQL Editor if admin@clinicforce.io
-- is showing as receptionist / staff instead of owner.
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Look up admin@clinicforce.io in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@clinicforce.io'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User admin@clinicforce.io not found in auth.users — skipping.';
    RETURN;
  END IF;

  -- Remove any existing clinic_users rows for this account so we start clean
  DELETE FROM clinic_users WHERE user_id = v_user_id;

  -- Insert the platform_owner record (no clinic_id — owner is platform-wide)
  INSERT INTO clinic_users (user_id, clinic_id, name, role)
  VALUES (v_user_id, null, 'ClinicForce', 'platform_owner');

  RAISE NOTICE 'Platform owner record created for user_id %', v_user_id;
END $$;
