-- ══════════════════════════════════════════════════════════════════════════════
-- 006 — active_calls: real-time "Stella is on a call" tracking
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Powers the LiveCallPulse indicator in the dashboard topbar.
--   • /api/twilio/incoming inserts a row when a call arrives.
--   • /api/twilio/status deletes the row when the call ends.
--   • The useActiveCall hook subscribes to realtime changes.
--
-- Only one row per clinic is expected at a time in practice, but the schema
-- allows multiple simultaneous calls (concurrent Twilio numbers or handoffs).
-- The app filters to `handled_by = 'STELLA'` to show the pulse only when the
-- AI is the one on the line — not when overflow dials the clinic directly.

CREATE TABLE IF NOT EXISTS active_calls (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     uuid         NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  call_sid      text         NOT NULL UNIQUE,
  caller_phone  text,
  caller_name   text,
  reason        text,
  handled_by    text         NOT NULL DEFAULT 'STELLA' CHECK (handled_by IN ('STELLA', 'CLINIC')),
  started_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS active_calls_clinic_started_idx
  ON active_calls (clinic_id, started_at DESC);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE active_calls ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their clinic's active calls
CREATE POLICY "active_calls_select" ON active_calls FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid()));

-- Writes are service-role only (Twilio webhooks bypass RLS via service key).
-- No insert/update/delete policies for authenticated users.

-- ── Enable realtime ─────────────────────────────────────────────────────────
-- (no-op if the publication already includes it; safe to re-run)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE active_calls;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
