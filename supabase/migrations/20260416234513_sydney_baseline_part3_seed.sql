-- ══════════════════════════════════════════════════════════════════════
-- Sydney baseline — part 3/3: seed clinics + voice_agents + defaults
-- ══════════════════════════════════════════════════════════════════════

-- Clinic 1: Baulkham Hills Veterinary Hospital (preserves Seoul id for continuity)
INSERT INTO clinics (
  id, slug, name, phone, address, timezone,
  after_hours_partner, after_hours_phone, emergency_partner_address,
  vertical, services, voice_phone, clinic_hours,
  reception_number, professional_title, subject_label,
  industry_config, coverage_mode
) VALUES (
  '2a35d093-803a-44fd-927a-075511f57736',
  'baulkham-hills-clinic-o8t3',
  'Baulkham Hills Veterinary Hospital',
  '02 9639 6399',
  '332 Windsor Rd, Baulkham Hills NSW 2153',
  'Australia/Sydney',
  'Animal Referral Hospital',
  '02 9639 7744',
  '19 Old Northern Road, Baulkham Hills',
  'vet',
  'wellness consultations, vaccinations, microchipping, desexing, dental care, digital X-ray',
  '0253005033',
  'Monday to Friday 8am to 7pm, Saturday 9am to 5pm, Sunday and Public Holidays 9am to 5pm',
  '02 9639 6399',
  'Veterinarian',
  'pet',
  '{"labels":{"client":"Owner","patient":"Pet","provider":"Veterinarian","appointment":"Consultation","patient_name_field":"Pet Name"},"extra_fields":["pet_name","pet_species","pet_breed","pet_age"],"triage_keywords":["bleeding","vomiting","not breathing","seizure","bloat","poisoning","hit by car","collapse"]}'::jsonb,
  'business_hours'
) ON CONFLICT (id) DO NOTHING;

-- Clinic 2: Tommy Vet Clinic
INSERT INTO clinics (
  id, slug, name, phone, email, address, suburb, postcode, timezone,
  after_hours_partner, after_hours_phone, emergency_partner_address,
  vertical, services, voice_phone, subject_label,
  industry_config, coverage_mode, website
) VALUES (
  'edc592e2-ea1e-4830-9156-908860cb518f',
  'tommy-vet-clinic',
  'Tommy Vet Clinic',
  '+61406458515',
  'Support@clinic.com',
  '60 George st',
  'CBD',
  '2000',
  'Australia/Sydney',
  'Declans Clinic',
  '+61406458505',
  'Home sweet home',
  'vet',
  'everything, check up',
  '0253020089',
  'pet',
  '{}'::jsonb,
  'business_hours',
  'www.clinic.com'
) ON CONFLICT (id) DO NOTHING;

-- voice_agents (preserves Seoul ids too)
INSERT INTO voice_agents (id, clinic_id, elevenlabs_agent_id, twilio_phone_number, is_active, mode) VALUES
  ('ded47372-f93b-4576-86a0-5bede980b805', '2a35d093-803a-44fd-927a-075511f57736', 'agent_6901knpnjevde98sd3yepq7r5ycg', '+61253005033', true, 'DAYTIME'),
  ('bc8d5f60-f273-4ddc-9cc4-07917e74c01f', 'edc592e2-ea1e-4830-9156-908860cb518f', 'agent_6901knpnjevde98sd3yepq7r5ycg', '+61253020089', true, 'DAYTIME')
ON CONFLICT (id) DO NOTHING;

-- coverage_sessions: one per clinic (app expects .single())
INSERT INTO coverage_sessions (clinic_id, status) VALUES
  ('2a35d093-803a-44fd-927a-075511f57736', 'INACTIVE'),
  ('edc592e2-ea1e-4830-9156-908860cb518f', 'INACTIVE')
ON CONFLICT (clinic_id) DO NOTHING;

-- surveys: default row per clinic
INSERT INTO surveys (clinic_id) VALUES
  ('2a35d093-803a-44fd-927a-075511f57736'),
  ('edc592e2-ea1e-4830-9156-908860cb518f')
ON CONFLICT (clinic_id) DO NOTHING;

-- subscriptions: default trial row per clinic
INSERT INTO subscriptions (clinic_id, plan, status, trial_ends_at) VALUES
  ('2a35d093-803a-44fd-927a-075511f57736', 'trial', 'trialing', now() + interval '14 days'),
  ('edc592e2-ea1e-4830-9156-908860cb518f', 'trial', 'trialing', now() + interval '14 days')
ON CONFLICT (clinic_id) DO NOTHING;
