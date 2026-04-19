-- ══════════════════════════════════════════════════════════════════════
-- Sydney baseline — part 2/3: functions, indexes, RLS, realtime
-- ══════════════════════════════════════════════════════════════════════

-- Helper functions used by every clinic_isolation RLS policy.
CREATE OR REPLACE FUNCTION public.my_clinic_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $fn$
  SELECT clinic_id FROM public.clinic_users WHERE user_id = auth.uid() ORDER BY created_at ASC LIMIT 1;
$fn$;

CREATE OR REPLACE FUNCTION public.my_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $fn$
  SELECT role FROM public.clinic_users WHERE user_id = auth.uid() ORDER BY created_at ASC LIMIT 1;
$fn$;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS active_calls_call_sid_key ON active_calls (call_sid);
CREATE INDEX IF NOT EXISTS active_calls_clinic_started_idx ON active_calls (clinic_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_case_id ON activity_log (case_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_clinic_id ON activity_log (clinic_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_staff_id ON activity_log (staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON audit_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_clinic_id_created ON audit_log (clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_to ON bookings (assigned_to);
CREATE INDEX IF NOT EXISTS idx_bookings_case_id ON bookings (case_id);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_id ON bookings (clinic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings (owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings (pet_id);
CREATE INDEX IF NOT EXISTS call_inbox_clinic_id_idx ON call_inbox (clinic_id);
CREATE INDEX IF NOT EXISTS call_inbox_created_at_idx ON call_inbox (created_at DESC);
CREATE INDEX IF NOT EXISTS call_inbox_status_idx ON call_inbox (status);
CREATE INDEX IF NOT EXISTS idx_call_inbox_clinic_status_created ON call_inbox (clinic_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS calls_clinic_id_idx ON calls (clinic_id);
CREATE INDEX IF NOT EXISTS calls_started_at_idx ON calls (started_at DESC);
CREATE INDEX IF NOT EXISTS calls_status_idx ON calls (status);
CREATE INDEX IF NOT EXISTS idx_calls_case_id ON calls (case_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases (assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_clinic_id ON cases (clinic_id);
CREATE INDEX IF NOT EXISTS idx_cases_owner_id ON cases (owner_id);
CREATE INDEX IF NOT EXISTS idx_cases_pet_id ON cases (pet_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_clinic_id ON clinic_invites (clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_users_clinic_id ON clinic_users (clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_users_user_id ON clinic_users (user_id);
CREATE INDEX IF NOT EXISTS idx_clinics_vertical ON clinics (vertical);
CREATE INDEX IF NOT EXISTS idx_clinics_voice_phone ON clinics (voice_phone);
CREATE UNIQUE INDEX IF NOT EXISTS coverage_sessions_clinic_unique ON coverage_sessions (clinic_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests (status);
CREATE INDEX IF NOT EXISTS idx_media_call_id ON media (call_id);
CREATE INDEX IF NOT EXISTS idx_media_case_id ON media (case_id);
CREATE INDEX IF NOT EXISTS idx_media_clinic_id ON media (clinic_id);
CREATE INDEX IF NOT EXISTS idx_media_uploader_id ON media (uploader_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_settings_clinic_id ON notification_settings (clinic_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_clinic_id ON onboarding_steps (clinic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_clinic_step ON onboarding_steps (clinic_id, step);
CREATE INDEX IF NOT EXISTS idx_owners_clinic_id ON owners (clinic_id);
CREATE INDEX IF NOT EXISTS idx_pets_clinic_id ON pets (clinic_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets (owner_id);
CREATE INDEX IF NOT EXISTS idx_referrals_case_id ON referrals (case_id);
CREATE INDEX IF NOT EXISTS idx_referrals_clinic_id ON referrals (clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_clinic_id ON staff (clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_clinic_id ON subscriptions (clinic_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_survey_actions_clinic_id ON survey_actions (clinic_id);
CREATE INDEX IF NOT EXISTS idx_survey_actions_survey_response_id ON survey_actions (survey_response_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_clinic_id ON survey_responses (clinic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks (case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_clinic_id ON tasks (clinic_id);
CREATE INDEX IF NOT EXISTS idx_triage_results_call_id ON triage_results (call_id);
CREATE INDEX IF NOT EXISTS idx_triage_results_case_id ON triage_results (case_id);
CREATE INDEX IF NOT EXISTS idx_triage_results_clinic_id ON triage_results (clinic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_agents_clinic_id ON voice_agents (clinic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_agents_twilio_number ON voice_agents (twilio_phone_number);

-- Enable RLS on every table
ALTER TABLE clinics               ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE media                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_inbox            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys               ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_actions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_calls          ENABLE ROW LEVEL SECURITY;

-- Clinic isolation pattern policies
CREATE POLICY "clinic_isolation" ON activity_log          FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON bookings              FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON call_inbox            FOR ALL USING (clinic_id = my_clinic_id()) WITH CHECK (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON calls                 FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON cases                 FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON coverage_sessions     FOR ALL USING (clinic_id = my_clinic_id()) WITH CHECK (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON media                 FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON notification_settings FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON onboarding_steps      FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON owners                FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON pets                  FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON referrals             FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON staff                 FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON subscriptions         FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON survey_actions        FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON survey_responses      FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON surveys               FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON tasks                 FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON triage_results        FOR ALL USING (clinic_id = my_clinic_id());
CREATE POLICY "clinic_isolation" ON voice_agents          FOR ALL USING (clinic_id = my_clinic_id());

-- clinics / clinic_users (role-aware)
CREATE POLICY "clinic_isolation" ON clinics FOR ALL USING (id = my_clinic_id()) WITH CHECK (id = my_clinic_id());
CREATE POLICY "clinic_users_select" ON clinic_users FOR SELECT USING ((my_role() = 'platform_owner') OR (clinic_id = my_clinic_id()));
CREATE POLICY "clinic_users_insert" ON clinic_users FOR INSERT WITH CHECK ((my_role() = 'platform_owner') OR (clinic_id = my_clinic_id()));
CREATE POLICY "clinic_users_update" ON clinic_users FOR UPDATE USING ((my_role() = 'platform_owner') OR (clinic_id = my_clinic_id()));
CREATE POLICY "clinic_users_delete" ON clinic_users FOR DELETE USING (my_role() = 'platform_owner');

-- Service-role full-access shadow policies (writes via service key pass RLS)
CREATE POLICY "service_full_access_calls"                  ON calls                 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access_call_inbox"             ON call_inbox            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access_clinics"                ON clinics               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access_clinic_users"           ON clinic_users          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access_coverage_sessions"      ON coverage_sessions     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access_voice_agents"           ON voice_agents          FOR ALL USING (true);
CREATE POLICY "service_full_access_subscriptions"          ON subscriptions         FOR ALL USING (true);
CREATE POLICY "service_full_access_onboarding"             ON onboarding_steps      FOR ALL USING (true);
CREATE POLICY "service_full_access_notifications"          ON notification_settings FOR ALL USING (true);
CREATE POLICY "service_full_access_demo_requests"          ON demo_requests         FOR ALL USING (true);
CREATE POLICY "service_full_access_surveys"                ON surveys               FOR ALL USING (true);
CREATE POLICY "service_full_access_survey_responses"       ON survey_responses      FOR ALL USING (true);
CREATE POLICY "service_full_access_survey_actions"         ON survey_actions        FOR ALL USING (true);
CREATE POLICY "service_full_access_audit_log"              ON audit_log             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on clinic_invites" ON clinic_invites        FOR ALL USING (true) WITH CHECK (true);

-- Role-aware SELECT policies for subscriptions (clinic_owner/admin + platform_owner)
CREATE POLICY "clinic_members_can_read_own_subscription" ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM clinic_users cu WHERE cu.user_id = (SELECT auth.uid()) AND ((cu.clinic_id = subscriptions.clinic_id) OR (cu.role = 'platform_owner'))));

-- Role-aware SELECT for clinic_invites (from PR #48 migration 007)
CREATE POLICY "clinic_invites_select_by_role" ON clinic_invites FOR SELECT
  USING (
    (my_role() = 'platform_owner')
    OR (clinic_id IN (SELECT cu.clinic_id FROM clinic_users cu WHERE cu.user_id = (SELECT auth.uid()) AND cu.role IN ('clinic_owner','clinic_admin')))
  );

-- audit_log extra readers
CREATE POLICY "audit_log_platform_owner_read" ON audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM clinic_users cu WHERE cu.user_id = (SELECT auth.uid()) AND cu.role = 'platform_owner'));
CREATE POLICY "audit_log_clinic_admin_read" ON audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM clinic_users cu WHERE cu.user_id = (SELECT auth.uid()) AND cu.role = 'clinic_admin' AND cu.clinic_id = audit_log.clinic_id));

-- Realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE active_calls;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
