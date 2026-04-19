-- Adds stated_phone: the phone number the caller *said* during the
-- conversation (what Stella heard / captured via tool). Distinct from
-- caller_phone which is the authoritative Twilio PSTN From header.
--
-- UI renders caller_phone in the top-line header (the number they
-- actually called from) and stated_phone in the Call Details PHONE
-- card (the number they want us to call back on, which can differ
-- e.g. called from work, wants callback on mobile).
ALTER TABLE public.call_inbox
  ADD COLUMN IF NOT EXISTS stated_phone TEXT NULL;
