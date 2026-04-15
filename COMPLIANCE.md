# ClinicForce — compliance action list

Status: `2026-04-15` — technical controls are in place, paperwork is not.

Shipping healthcare-adjacent software without the items below exposes ClinicForce
to HIPAA, Australian Privacy Act 1988, APP 11, and (for EU clients) GDPR
liability. Code cannot substitute for the signed agreements. Work through this
list before the first paying client goes live.

---

## 1. Business Associate Agreements (BAAs) — for any US PHI

PHI = patient health information. Voice transcripts from veterinary clinics are
**not** PHI under HIPAA. Voice transcripts from GP or dental clinics that
identify human patients **are**.

If ClinicForce ever stores, processes, or transmits US PHI, every downstream
sub-processor must have a BAA signed:

| Vendor | BAA status | Minimum plan required | Action |
|---|---|---|---|
| Supabase (database + auth) | ❌ Needs BAA | **Team** plan ($599/mo) + HIPAA add-on | https://supabase.com/docs/guides/platform/hipaa-projects — email `privacy@supabase.io` |
| Vercel (hosting) | ❌ Needs BAA | **Enterprise** plan | https://vercel.com/legal/hipaa — contact sales |
| ElevenLabs (voice agent) | ❌ Needs BAA | Enterprise plan | https://elevenlabs.io/enterprise — contact sales, confirm HIPAA in writing |
| Twilio (telephony) | ❌ Needs BAA | Any paid plan + HIPAA-eligible products | https://www.twilio.com/en-us/legal/baa — they sign BAAs for Programmable Voice, Messaging, Functions |
| Resend (email) | ⚠ Check | Currently not BAA-eligible — avoid sending PHI in email | Either migrate to Postmark/SendGrid (both sign BAAs) or keep emails PHI-free |
| OpenAI (LLM, if used for summarisation) | ⚠ Check | Enterprise / ZDR (Zero Data Retention) agreement | https://openai.com/enterprise-privacy — contact sales for ZDR + BAA |
| Stripe (payments) | N/A | Stripe does not touch PHI — BAA not required |
| Sentry (error tracking) | ⚠ Only if error payloads could contain PHI | Business plan + BAA | https://sentry.io/security — our `beforeSend` scrubs request headers/cookies, but verify nothing else slips through |
| Upstash (rate-limit Redis) | N/A | Only keys like `rl:auth:login:1.2.3.4` — no PHI |
| Trigger.dev (background jobs) | ⚠ Check | Depends on what job payloads carry | Avoid passing PHI to jobs, or contact Trigger.dev for a BAA |

**Action:** for each vendor in the top section, initiate BAA contact **this
week**. Most vendors take 5–15 business days to counter-sign.

### Veterinary-only launches

If your first clients are veterinary clinics only, HIPAA does not apply. You
still need:
- A **Privacy Policy** covering pet-owner PII (name, phone, email, address).
- A **Data Processing Agreement** with each vendor for GDPR compliance when a
  pet owner is an EU resident.

---

## 2. Australian Privacy Principles (APP) — applies to any clinic operating in AU

ClinicForce and its clients are APP-bound entities under the Privacy Act 1988.

| Principle | Your obligation | Status |
|---|---|---|
| APP 1 — open and transparent | Published Privacy Policy | ⚠ Check `app/privacy/page.tsx` is current |
| APP 5 — notification of collection | Every clinic must notify patients that calls are answered by an AI | **Action: update clinic onboarding to require acknowledgment** |
| APP 6 — use and disclosure | Voice transcripts used only for the clinic that captured them | ✅ enforced by RLS on `call_inbox` |
| APP 8 — cross-border disclosure | If Supabase region is not Australia, notify clients | ✅ current project is `ap-northeast-2` (Seoul) — **notify and consider migrating to `ap-southeast-2` (Sydney)** |
| APP 11 — security | Reasonable steps to protect the info | ✅ RLS + MFA + rate limiting + audit log + HMAC webhooks |
| APP 12 — access | Individuals can request their data | ⚠ **Action: implement a data export endpoint / documented process** |
| APP 13 — correction | Individuals can correct errors | ⚠ **Action: support@ email address published + process documented** |

**Action items:**
1. Check `app/privacy/page.tsx` and `app/terms/page.tsx` exist and are current.
2. Add a "calls are handled by AI" disclosure to the clinic's automated greeting,
   OR have clinics add it to their website / front-desk signage.
3. Document a data-subject-access-request (DSAR) process and list
   `privacy@clinicforce.io` on the Privacy Policy.
4. **Evaluate moving the Supabase project from `ap-northeast-2` (Seoul) to
   `ap-southeast-2` (Sydney).** This is a tenant-data residency win for AU clients.

---

## 3. Incident response plan

Required to answer "what did we do when the breach happened?"

Required elements (create one doc, `docs/INCIDENT_RESPONSE.md`):

1. **Detection** — Sentry alerts + Supabase anomalous-query alerts + daily tail
   of `audit_log` for suspicious patterns.
2. **Containment** — how to rotate `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*`,
   `ELEVENLABS_*`, `TWILIO_AUTH_TOKEN` (document the exact steps; Vercel
   → Project → Settings → Environment Variables).
3. **Eradication** — RLS audit steps, how to run
   `npm run test:isolation` against the affected cluster.
4. **Notification timeline** — per OAIC guidance, Notifiable Data Breach
   notification must be made within 30 days of awareness of "serious harm"
   exposure. For HIPAA, notification within 60 days.
5. **Post-mortem template** — blameless post-mortem doc.

---

## 4. Data retention

Currently no retention policy. Call transcripts grow indefinitely.

**Action:** pick a default retention period per clinic (suggest 12 months) and
ship a nightly Trigger.dev job that deletes `call_inbox`, `survey_responses`,
and `audit_log` rows older than `clinics.retention_months` (new column, default
12). Expose a setting in `/settings/security` for clinic admins to change it.

---

## 5. Sub-processor list

Public page required under GDPR 28(2)(a). Create `/legal/subprocessors` listing
every vendor in §1 with: name, purpose, location, transfer mechanism (SCCs).

---

## 6. Before the first paying client

Minimum bar:

- [ ] Signed BAA with Supabase, Vercel, ElevenLabs, Twilio (if US PHI in scope).
- [ ] Privacy Policy + Terms of Service reviewed by a lawyer (not Claude).
- [ ] DSAR process documented with an `info@` / `privacy@` mailbox monitored.
- [ ] Incident Response Plan documented in `docs/INCIDENT_RESPONSE.md`.
- [ ] Supabase project region is explicitly disclosed to clients.
- [ ] Sub-processors page public.
- [ ] SOC 2 is not required to sell, but once you have 3+ enterprise clients,
      start the Type I process (allow ~6 months).

Once signed, store copies in 1Password / the company doc store, and list their
expiry dates in a calendar so you don't let one lapse silently.
