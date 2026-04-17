# supabase/migrations

**Prod is the source of truth.** The 38 applied migrations live in
Supabase Cloud project `ymuyjmvrtacredczseak` → `supabase_migrations.schema_migrations`.

This directory is intentionally empty of SQL files. The 8 hand-written
migrations that used to live here (`001_clinics.sql` … `008_drop_twilio_debug_captures.sql`)
were removed on 2026-04-18 because:

- they never corresponded to rows in `schema_migrations` (they predate the
  Supabase CLI era of this project);
- leaving them here would cause `supabase db reset` to apply them **in addition
  to** the 38 already in prod, which creates conflicts on a fresh environment.

## How to get prod migrations back into this directory

Once per dev machine (one-time):

```bash
npm install -g supabase
supabase login
supabase link --project-ref ymuyjmvrtacredczseak
```

Then whenever you want to sync:

```bash
supabase db pull
```

That writes one `.sql` file per applied migration to this directory, named
with the Supabase CLI convention `YYYYMMDDHHMMSS_name.sql`. After pulling,
commit the files — the repo and prod stay in lockstep from that point on.

## How to stand up a fresh environment (disaster recovery)

If Supabase Cloud is unavailable, or you need a new project from scratch:

```bash
# 1. Create a new project in the Supabase dashboard
# 2. Link it
supabase link --project-ref <new-project-ref>
# 3. Push the migrations (after pulling them into this directory first)
supabase db push
# 4. Seed: see scripts/seed/*.sql for any reference data (none as of 2026-04-18)
```

## Related docs

- `../../docs/clinic-handoff-checklist.md` — full production runbook
- `../../docs/seo-strategy.md` — marketing SEO plan
