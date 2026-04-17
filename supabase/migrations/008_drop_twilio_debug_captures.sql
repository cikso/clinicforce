-- ══════════════════════════════════════════════════════════════════════════════
-- 008 — Drop twilio_debug_captures
-- ══════════════════════════════════════════════════════════════════════════════
--
-- The table was a short-lived forensic aid used to diagnose the Twilio
-- webhook signature-verification mystery that turned out to be a regional
-- auth token mismatch (AU1 numbers need the AU1 auth token, not US1's).
-- With that resolved, the table stores sensitive request payloads (caller
-- phone numbers, call SIDs) with no ongoing purpose — drop it.

DROP TABLE IF EXISTS public.twilio_debug_captures;
