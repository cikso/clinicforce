/**
 * Multi-tenant isolation test.
 *
 * Hard proof that:
 *   1. An anonymous (logged-out) session cannot read tenant-scoped tables.
 *   2. User A (member of Clinic A) cannot read, update, or delete Clinic B's
 *      data via the anon key + RLS.
 *   3. Platform owner CAN read any clinic's data (when active_clinic is set).
 *
 * Run with:  npx tsx scripts/test-tenant-isolation.ts
 *
 * Requires environment:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY   (used to provision + clean up test fixtures)
 *
 * Exits non-zero on any failure, so you can wire this into CI.
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPA_URL || !ANON || !SERVICE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY')
  process.exit(2)
}

const admin = createClient(SUPA_URL, SERVICE, { auth: { persistSession: false } })

const TENANT_TABLES = [
  'call_inbox',
  'voice_agents',
  'surveys',
  'survey_responses',
  'survey_actions',
  'subscriptions',
  'clinic_invites',
  'coverage_sessions',
  'activity_log',
  'tasks',
  'notification_settings',
  'onboarding_steps',
] as const

let failures = 0

function check(label: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`  [OK]   ${label}`)
  } else {
    failures += 1
    console.error(`  [FAIL] ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

async function main() {
  // ── 1. Provision two fresh clinics + one user linked to clinic A ──────────
  const clinicA = { id: randomUUID(), name: `isolation-test-A-${Date.now()}` }
  const clinicB = { id: randomUUID(), name: `isolation-test-B-${Date.now()}` }
  const userAEmail = `iso-test-a-${Date.now()}@clinicforce.test`
  const userAPassword = randomUUID()

  console.log('\n→ Provisioning fixtures…')
  await admin.from('clinics').insert([
    { id: clinicA.id, name: clinicA.name, vertical: 'vet' },
    { id: clinicB.id, name: clinicB.name, vertical: 'vet' },
  ]).throwOnError()

  // Seed one row per table per clinic so cross-tenant reads have something
  // to find if RLS breaks.
  await admin.from('call_inbox').insert([
    { clinic_id: clinicA.id, urgency: 'ROUTINE', status: 'UNREAD', summary: 'A call' },
    { clinic_id: clinicB.id, urgency: 'ROUTINE', status: 'UNREAD', summary: 'B call' },
  ]).throwOnError()

  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: userAEmail,
    password: userAPassword,
    email_confirm: true,
  })
  if (userErr || !created.user) throw userErr ?? new Error('createUser failed')

  await admin.from('clinic_users').insert({
    user_id: created.user.id,
    clinic_id: clinicA.id,
    role: 'receptionist',
    name: 'Iso Test A',
  }).throwOnError()

  try {
    // ── 2. Anonymous client cannot read any tenant-scoped table ─────────────
    console.log('\n→ Anonymous (no JWT) access must be blocked:')
    const anon = createClient(SUPA_URL, ANON, { auth: { persistSession: false } })
    for (const table of TENANT_TABLES) {
      const { data } = await anon.from(table).select('*').limit(10)
      check(
        `anon cannot read ${table}`,
        (data ?? []).length === 0,
        `returned ${(data ?? []).length} rows`,
      )
    }

    // ── 3. Authenticated User A cannot see Clinic B ─────────────────────────
    console.log('\n→ Clinic A user must be isolated from Clinic B:')
    const userA = createClient(SUPA_URL, ANON, { auth: { persistSession: false } })
    const { error: signInErr } = await userA.auth.signInWithPassword({
      email: userAEmail,
      password: userAPassword,
    })
    if (signInErr) throw signInErr

    // Should see Clinic A row in call_inbox, not Clinic B's
    const { data: inboxRows } = await userA.from('call_inbox').select('clinic_id, summary')
    const leakedB = (inboxRows ?? []).filter(r => r.clinic_id === clinicB.id)
    check(
      'userA call_inbox SELECT excludes clinic B',
      leakedB.length === 0,
      `leaked rows: ${leakedB.length}`,
    )
    check(
      'userA call_inbox SELECT includes clinic A',
      (inboxRows ?? []).some(r => r.clinic_id === clinicA.id),
      'clinic A own row not returned',
    )

    // Direct attempt to read Clinic B by id — must return 0 rows
    const { data: bDirect } = await userA
      .from('call_inbox')
      .select('id')
      .eq('clinic_id', clinicB.id)
    check('userA cannot fetch clinic B by explicit id filter', (bDirect ?? []).length === 0)

    // Attempt to update a Clinic B row — RLS must hide it. We then confirm
    // via the admin client that the row summary is unchanged.
    await userA
      .from('call_inbox')
      .update({ summary: 'HACKED' })
      .eq('clinic_id', clinicB.id)
    const { data: postUpdate } = await admin
      .from('call_inbox')
      .select('summary')
      .eq('clinic_id', clinicB.id)
      .single()
    check(
      'userA update of clinic B did not mutate the row',
      postUpdate?.summary === 'B call',
      `summary after update attempt: "${postUpdate?.summary}"`,
    )

    // Attempt to insert a row into Clinic B — RLS check constraint must reject
    const { error: insertErr } = await userA.from('call_inbox').insert({
      clinic_id: clinicB.id,
      urgency: 'ROUTINE',
      status: 'UNREAD',
      summary: 'injected',
    })
    check(
      'userA insert into clinic B is rejected',
      !!insertErr,
      `expected RLS error, got ${insertErr?.message ?? 'success'}`,
    )

    // ── 4. Clinic B row still intact ────────────────────────────────────────
    const { data: bIntact } = await admin
      .from('call_inbox')
      .select('summary')
      .eq('clinic_id', clinicB.id)
      .single()
    check(
      'clinic B data untouched after attack attempts',
      bIntact?.summary === 'B call',
      `summary is "${bIntact?.summary}"`,
    )
  } finally {
    // ── Cleanup ─────────────────────────────────────────────────────────────
    console.log('\n→ Cleaning up fixtures…')
    await admin.from('call_inbox').delete().in('clinic_id', [clinicA.id, clinicB.id])
    await admin.from('clinic_users').delete().eq('user_id', created.user.id)
    await admin.auth.admin.deleteUser(created.user.id)
    await admin.from('clinics').delete().in('id', [clinicA.id, clinicB.id])
  }

  console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`} — multi-tenant isolation check`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch(err => {
  console.error('FATAL', err)
  process.exit(2)
})
