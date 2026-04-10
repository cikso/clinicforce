/**
 * Voice pipeline smoke test — verifies wiring without making a real call.
 *
 * Run:  npx tsx scripts/test-pipeline.ts
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from .env.local
 * This script is never imported by the app.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ─────────────────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const BASE_URL = 'https://app.clinicforce.io'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ── Helpers ─────────────────────────────────────────────────────────────────
interface StepResult {
  name: string
  pass: boolean
  latencyMs: number
  detail: string
}

async function runStep(
  name: string,
  fn: () => Promise<string>,
): Promise<StepResult> {
  const start = performance.now()
  try {
    const detail = await fn()
    return { name, pass: true, latencyMs: Math.round(performance.now() - start), detail }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { name, pass: false, latencyMs: Math.round(performance.now() - start), detail: msg }
  }
}

function printResult(r: StepResult) {
  const tag = r.pass ? '✅ PASS' : '❌ FAIL'
  console.log(`${tag}  ${r.name}  (${r.latencyMs}ms)`)
  console.log(`       ${r.detail}\n`)
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍 Voice Pipeline Smoke Test\n')

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let agentId: string | null = null
  let twilioNumber: string | null = null

  // Step 1: Query voice_agents for at least 1 active row
  const step1 = await runStep('1. Active voice agent in DB', async () => {
    const { data, error } = await supabase
      .from('voice_agents')
      .select('elevenlabs_agent_id, twilio_phone_number, is_active')
      .eq('is_active', true)
      .not('elevenlabs_agent_id', 'is', null)
      .not('twilio_phone_number', 'is', null)
      .limit(1)
      .single()

    if (error) throw new Error(`Supabase query failed: ${error.message}`)
    if (!data) throw new Error('No active voice agent found')

    agentId = data.elevenlabs_agent_id
    twilioNumber = data.twilio_phone_number

    return `agent_id=${agentId}  twilio=${twilioNumber}`
  })
  printResult(step1)

  // Step 2: Health check
  const step2 = await runStep('2. GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    const json = await res.json()

    if (json.status !== 'ok') {
      throw new Error(`Health status: "${json.status}" — DB: ${json.checks?.database?.status}, ` +
        `EL secret: ${json.checks?.elevenlabs_secret?.status}, ` +
        `EL key: ${json.checks?.elevenlabs_api_key?.status}`)
    }

    return `status=ok  db_latency=${json.checks.database.latency_ms}ms  version=${json.version}`
  })
  printResult(step2)

  // Step 3: POST /api/initiate with agent_id
  const step3 = await runStep('3. POST /api/initiate', async () => {
    if (!agentId) throw new Error('Skipped — no agent_id from step 1')

    const res = await fetch(`${BASE_URL}/api/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)

    const json = await res.json()
    const vars = json.dynamic_variables ?? {}

    if (!vars.clinic_name) {
      throw new Error(`dynamic_variables.clinic_name missing — got keys: [${Object.keys(vars).join(', ')}]`)
    }

    return `clinic_name="${vars.clinic_name}"  vars=[${Object.keys(vars).join(', ')}]`
  })
  printResult(step3)

  // Summary
  const results = [step1, step2, step3]
  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed

  console.log('─'.repeat(50))
  if (failed === 0) {
    console.log(`🎉 All ${passed} steps passed\n`)
  } else {
    console.log(`⚠️  ${passed} passed, ${failed} failed\n`)
    process.exit(1)
  }
}

main()
