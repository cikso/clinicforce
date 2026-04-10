-- Add timezone column to clinics for per-clinic timezone support in stats/reports.
-- Defaults to 'Australia/Sydney' for existing clinics.
alter table clinics add column if not exists timezone text not null default 'Australia/Sydney';
