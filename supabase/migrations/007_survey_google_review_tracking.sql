-- ══════════════════════════════════════════════════════════════════════════════
-- 007 — Google review funnel telemetry
-- ══════════════════════════════════════════════════════════════════════════════
-- Tracks the promoter → Google review handoff:
--   • google_review_sent_at  — set when a promoter is texted the review link
--   • google_review_clicked_at — set when the customer hits the tracked
--                                redirect at /api/survey/g/[id]

ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS google_review_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS google_review_clicked_at timestamptz;
