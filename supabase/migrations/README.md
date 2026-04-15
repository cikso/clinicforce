# Supabase migrations

## ⚠ Source of truth

The **authoritative** migration history lives in the Supabase-hosted
`supabase_migrations.schema_migrations` table of project `ymuyjmvrtacredczseak`.
As of 2026-04-15 that table holds **32 migrations**; this folder has only a
subset, because some migrations were applied directly via the Supabase
dashboard / MCP.

Do **not** treat the files in this folder as a complete schema. They exist for
human review and for migrations authored after the hardening pass of
2026-04-15. A fresh local clone cannot `psql $FILES` to reproduce production.

## How to keep them in sync

Going forward, every schema change must be:

1. Authored as a file in this folder with an ISO-date prefix, e.g.
   `007_add_audit_log_20260416.sql`.
2. Applied via either the Supabase CLI (`supabase db push`) or the MCP
   `apply_migration` tool, which writes to `supabase_migrations.schema_migrations`.
3. Reviewed in the PR before merge.

Any ad-hoc SQL in the Supabase dashboard is a bug — it creates drift that
future engineers can't audit. If an emergency fix was applied in the
dashboard, pull it back out with:

```sql
select version, name, array_to_string(statements, E';\n\n') as sql
from supabase_migrations.schema_migrations
order by version desc
limit 5;
```

and commit the SQL to this folder.

## Files

| File | Purpose | Applied? |
|------|---------|----------|
| `001_clinics.sql`…`005_surveys.sql` | Historical baseline (incomplete — many ALTERs and tables live only in the live DB) | Partially — superseded by in-DB migrations |
| `006_security_hardening_20260415.sql` | Drops open `demo_requests` anon INSERT, fixes subscriptions RLS initplan, restricts `call_inbox` `clinic_isolation` to authenticated, adds survey FK indexes | Yes, version 20260415054415 |

## Helper RLS functions (live only — not in this folder)

The multi-tenant isolation model relies on two `SECURITY DEFINER` SQL functions
defined in-database, not here:

- `public.my_clinic_id()` — returns the calling user's first clinic, or null for anon.
- `public.my_role()` — returns the calling user's role, or null for anon.

Both are `STABLE`, `SECURITY DEFINER`, `SET search_path = public`. Any change to
these requires a new migration file.
