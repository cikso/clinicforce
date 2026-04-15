-- ══════════════════════════════════════════════════════════════════════════════
-- 006 — AI-extracted theme on survey free-text responses
-- ══════════════════════════════════════════════════════════════════════════════
-- Populated by the `survey-extract-theme` Trigger.dev task after a respondent
-- sends a free-text follow-up reply. One of a fixed taxonomy (see task source).

ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS theme_extracted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_survey_responses_clinic_theme
  ON survey_responses (clinic_id, theme)
  WHERE theme IS NOT NULL;
