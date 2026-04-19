-- ══════════════════════════════════════════════════════════════════════
-- Sydney baseline — part 1/3: enum types + all 26 tables in FK order
-- ══════════════════════════════════════════════════════════════════════

-- Enum types
DO $$ BEGIN CREATE TYPE public.action_status AS ENUM ('open','contacted','resolved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public."TriageOutcome" AS ENUM ('EMERGENCY','BOOK_APPOINTMENT','HOME_CARE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  phone text, email text, address text, suburb text, postcode text,
  timezone text DEFAULT 'Australia/Sydney',
  after_hours_enabled boolean DEFAULT false,
  gcal_calendar_id text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  vertical text NOT NULL DEFAULT 'vet' CHECK (vertical IN ('vet','dental','gp','chiro','allied_health','specialist')),
  clinic_hours text, emergency_partner_address text, services text,
  voice_phone text, after_hours_partner text, after_hours_phone text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  business_hours jsonb, call_handling_prefs jsonb, urgent_rules jsonb,
  website text,
  subject_label text NOT NULL DEFAULT 'pet' CHECK (subject_label IN ('pet','patient','client')),
  professional_title text,
  industry_config jsonb DEFAULT '{}'::jsonb,
  coverage_mode varchar DEFAULT 'after_hours',
  coverage_mode_activated_at timestamptz DEFAULT now(),
  coverage_mode_activated_by varchar DEFAULT 'Auto',
  reception_number text, google_review_url text
);

CREATE TABLE IF NOT EXISTS clinic_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text,
  role text DEFAULT 'receptionist' CHECK (role IN ('platform_owner','clinic_owner','clinic_admin','staff','receptionist','vet','nurse','admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('vet','nurse','receptionist','admin','night_lead')),
  specialty text, avatar_seed text,
  is_available boolean DEFAULT true, is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL, phone text, email text, address text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES owners(id) ON DELETE SET NULL,
  name text NOT NULL,
  species text NOT NULL CHECK (species IN ('canine','feline','avian','exotic','other')),
  breed text, age text, sex text, weight_kg numeric, microchip text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_number text UNIQUE NOT NULL,
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES owners(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  presenting_issue text NOT NULL,
  urgency text NOT NULL CHECK (urgency IN ('CRITICAL','URGENT','ROUTINE')),
  status text NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING','IN_REVIEW','IN_TREATMENT','ESCALATED','DISCHARGED','AWAITING_OWNER')),
  intake_source text NOT NULL CHECK (intake_source IN ('VOICE_AI','WEB_CHAT','PHONE','FRONT_DESK','REFERRAL')),
  ai_summary text, ai_justification text, ai_risk_factor text, urgency_score numeric,
  opened_at timestamptz DEFAULT now(), closed_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  caller_phone text, caller_name text, patient_name text, species text,
  started_at timestamptz DEFAULT now(), ended_at timestamptz,
  duration_secs integer, transcript text,
  risk text CHECK (risk IN ('CRITICAL','URGENT','GENERAL')),
  ai_recommendation text, ai_confidence numeric,
  status text DEFAULT 'NEW' CHECK (status IN ('NEW','REVIEWED','ACTIONED','CONVERTED','ESCALATED','CALLBACK_SCHEDULED')),
  created_at timestamptz DEFAULT now(),
  industry_data jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS triage_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  urgency text NOT NULL, urgency_score numeric, risk_factor text,
  summary text, justification text, recommendations jsonb,
  model text, prompt_version text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES owners(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  appointment_at timestamptz, slot_duration_mins integer DEFAULT 30,
  reason text,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW')),
  gcal_event_id text, sms_confirmed boolean DEFAULT false, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  destination_clinic_name text, destination_phone text, reason text, urgency text,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','ACKNOWLEDGED','COMPLETED','CANCELLED')),
  notes text, sent_at timestamptz, acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  title text NOT NULL, description text,
  type text CHECK (type IN ('FOLLOW_UP','CALLBACK','REVIEW','TRIAGE_REVIEW','OWNER_CHECK_IN')),
  priority text DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','DONE','CANCELLED')),
  due_at timestamptz, completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  call_id uuid REFERENCES calls(id) ON DELETE SET NULL,
  uploader_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  file_name text NOT NULL, file_type text NOT NULL,
  file_size_bytes integer, storage_path text NOT NULL,
  ai_analysis text, ai_flags jsonb, reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('ESCALATION','CALL','CASE','ASSIGNMENT','SYSTEM','BOOKING','REFERRAL','MEDIA','TASK')),
  message text NOT NULL, metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coverage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'INACTIVE',
  reason text, started_at timestamptz, ended_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  caller_name text, caller_phone text, pet_name text, pet_species text,
  summary text, ai_detail text, action_required text,
  urgency text NOT NULL DEFAULT 'ROUTINE',
  status text NOT NULL DEFAULT 'UNREAD',
  coverage_reason text, call_duration_seconds integer, elevenlabs_conversation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  industry_data jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS clinic_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'clinic_admin' CHECK (role IN ('clinic_owner','clinic_admin','staff','vet','nurse','receptionist')),
  token text UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  invited_by text, accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + '7 days'::interval),
  created_at timestamptz NOT NULL DEFAULT now(),
  extra_clinic_ids uuid[]
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','growth','enterprise')),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','cancelled','paused')),
  trial_ends_at timestamptz, current_period_start timestamptz, current_period_end timestamptz,
  stripe_customer_id text, stripe_subscription_id text,
  monthly_price_aud numeric,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS voice_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  elevenlabs_agent_id text, twilio_phone_number text, twilio_account_sid text,
  is_active boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'DAYTIME' CHECK (mode IN ('DAYTIME','AFTER_HOURS','EMERGENCY_ONLY','OFF')),
  system_prompt_override text, knowledge_base_ids jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  step text NOT NULL CHECK (step IN ('clinic_profile','staff_added','voice_agent_configured','phone_forwarding_set','test_call_done','go_live')),
  completed boolean NOT NULL DEFAULT false, completed_at timestamptz, notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, phone text, clinic_name text,
  vertical text CHECK (vertical IN ('vet','dental','gp','chiro','allied_health','specialist')),
  clinic_size text CHECK (clinic_size IN ('solo','2-5','6-15','15+')),
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','demo_booked','converted','lost')),
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  email_alerts_enabled boolean NOT NULL DEFAULT true,
  sms_alerts_enabled boolean NOT NULL DEFAULT false,
  alert_email text, alert_phone text, slack_webhook_url text,
  notify_on_critical boolean NOT NULL DEFAULT true,
  notify_on_urgent boolean NOT NULL DEFAULT true,
  notify_on_missed_call boolean NOT NULL DEFAULT true,
  quiet_hours_start time, quiet_hours_end time,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  enabled boolean DEFAULT false, delay_minutes integer DEFAULT 120,
  sms_template text DEFAULT 'Hi {{patient_name}}, thanks for visiting {{clinic_name}}. How likely are you to recommend us to a friend? Reply with a number from 1–10.',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name text, patient_phone text NOT NULL,
  visit_date date, provider_name text,
  nps_score integer CHECK (nps_score >= 1 AND nps_score <= 10),
  follow_up_text text, twilio_message_sid text,
  sent_at timestamptz DEFAULT now(), responded_at timestamptz,
  follow_up_sent_at timestamptz, follow_up_responded_at timestamptz,
  source text DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS survey_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  survey_response_id uuid REFERENCES survey_responses(id) ON DELETE CASCADE,
  patient_name text, patient_phone text, visit_date date,
  nps_score integer, comment text,
  status public.action_status DEFAULT 'open',
  staff_notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text, action text NOT NULL, resource text,
  ip text, user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS active_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  call_sid text NOT NULL UNIQUE,
  caller_phone text, caller_name text, reason text,
  handled_by text NOT NULL DEFAULT 'STELLA' CHECK (handled_by IN ('STELLA','CLINIC')),
  started_at timestamptz NOT NULL DEFAULT now()
);
