-- ─────────────────────────────────────────────────────────────
-- VetDesk: Enterprise clinic fields for ElevenLabs voice agent
-- ─────────────────────────────────────────────────────────────

-- Full street address (separate from suburb/state/postcode)
alter table clinics add column if not exists address text;

-- Operating hours as a plain string the voice agent can speak
alter table clinics add column if not exists clinic_hours text;

-- Emergency/after-hours partner address
alter table clinics add column if not exists emergency_partner_address text;

-- Vertical: 'vet' | 'dental' | 'gp' | 'chiro'
alter table clinics add column if not exists vertical text not null default 'vet';

-- Plain-text services list the agent can read out
alter table clinics add column if not exists services text;

-- The ElevenLabs/Twilio phone number assigned to this clinic.
-- Used by the initiation webhook to match an inbound call to the correct clinic.
alter table clinics add column if not exists voice_phone text;

-- Index for fast lookup on inbound call routing
create index if not exists idx_clinics_voice_phone on clinics (voice_phone);

-- ── Seed Baulkham Hills Veterinary Hospital ──────────────────
-- Update the existing record if it exists, otherwise insert.
-- The voice_phone matches the ElevenLabs number: +61253005033
insert into clinics (
  name,
  phone,
  address,
  suburb,
  state,
  postcode,
  clinic_hours,
  after_hours_partner,
  after_hours_phone,
  emergency_partner_address,
  vertical,
  services,
  voice_phone
)
values (
  'Baulkham Hills Veterinary Hospital',
  '02 9639 6399',
  '332 Windsor Rd',
  'Baulkham Hills',
  'NSW',
  '2153',
  'Monday to Friday 8am to 7pm, Saturday 9am to 5pm, Sunday and Public Holidays 9am to 5pm',
  'Animal Referral Hospital',
  '02 9639 7744',
  '19 Old Northern Road, Baulkham Hills',
  'vet',
  'vaccinations, general surgery, dental care, desexing, microchipping',
  '0253005033'
)
on conflict do nothing;
