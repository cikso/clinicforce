-- ─────────────────────────────────────────────────────────────
-- VetDesk: Clinics + Clinic Users
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Clinics table
create table if not exists clinics (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text,
  email           text,
  suburb          text,
  state           text default 'NSW',
  postcode        text,
  website         text,
  species         text[] default array['dog','cat'],
  after_hours_partner text default 'Animal Emergency Service',
  after_hours_phone   text,
  plan            text default 'trial',
  created_at      timestamptz default now()
);

-- Clinic users (staff linked to a clinic)
create table if not exists clinic_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  clinic_id   uuid references clinics(id) on delete cascade,
  name        text,
  role        text default 'receptionist',
  created_at  timestamptz default now(),
  unique(user_id, clinic_id)
);

-- ── Row Level Security ────────────────────────────────────────

alter table clinics      enable row level security;
alter table clinic_users enable row level security;

-- Clinics: users can read/update their own clinic
create policy "clinic_select" on clinics for select
  using (id in (select clinic_id from clinic_users where user_id = auth.uid()));

create policy "clinic_update" on clinics for update
  using (id in (select clinic_id from clinic_users where user_id = auth.uid()));

create policy "clinic_insert" on clinics for insert
  with check (true);

-- Clinic users: read/insert own records
create policy "clinic_users_select" on clinic_users for select
  using (user_id = auth.uid());

create policy "clinic_users_insert" on clinic_users for insert
  with check (user_id = auth.uid());

-- ── Calls table: allow insert for service role ────────────────
-- Ensure calls table has clinic_id (add if missing)
alter table calls add column if not exists clinic_id uuid references clinics(id);
alter table calls add column if not exists caller_phone text;
alter table calls add column if not exists patient_name text;
