-- ══════════════════════════════════════════════════════════════════════════════
-- 005 — Post-visit surveys: config, responses, actions
-- ══════════════════════════════════════════════════════════════════════════════

-- Google review URL on clinics (Phase 2 admin form — handler degrades gracefully)
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS google_review_url text;

-- Survey config per clinic (one row each)
CREATE TABLE surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  delay_minutes integer DEFAULT 120,
  sms_template text DEFAULT 'Hi {{patient_name}}, thanks for visiting {{clinic_name}}. How likely are you to recommend us to a friend? Reply with a number from 1–10.',
  created_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id)
);

-- Individual survey sends + responses
CREATE TABLE survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name text,
  patient_phone text NOT NULL,
  visit_date date,
  provider_name text,
  nps_score integer CHECK (nps_score >= 1 AND nps_score <= 10),
  follow_up_text text,
  twilio_message_sid text,
  sent_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  follow_up_sent_at timestamptz,
  follow_up_responded_at timestamptz,
  source text DEFAULT 'manual'
);

-- Status enum for actions workflow
DO $$ BEGIN
  CREATE TYPE action_status AS ENUM ('open', 'contacted', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Detractor / low-score follow-up actions
CREATE TABLE survey_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  survey_response_id uuid REFERENCES survey_responses(id) ON DELETE CASCADE,
  patient_name text,
  patient_phone text,
  visit_date date,
  nps_score integer,
  comment text,
  status action_status DEFAULT 'open',
  staff_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed a survey config row for every existing clinic
INSERT INTO surveys (clinic_id)
SELECT id FROM clinics
ON CONFLICT (clinic_id) DO NOTHING;
