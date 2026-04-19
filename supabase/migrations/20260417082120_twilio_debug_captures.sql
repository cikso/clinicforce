CREATE TABLE IF NOT EXISTS twilio_debug_captures (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pathname    text        NOT NULL,
  url         text,
  signature   text,
  raw_body    text,
  fwd_host    text,
  fwd_proto   text,
  tried_urls  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE twilio_debug_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_full_access" ON twilio_debug_captures FOR ALL USING (true) WITH CHECK (true);
