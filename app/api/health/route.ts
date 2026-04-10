import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const config = { runtime: 'nodejs' }

export async function GET() {
  const timestamp = new Date().toISOString()
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'

  // Database check
  let database: { status: 'ok' | 'error'; latency_ms: number; error?: string }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const start = performance.now()
    const { error } = await supabase.from('clinics').select('id').limit(1).single()
    const latency_ms = Math.round(performance.now() - start)

    if (error) {
      database = { status: 'error', latency_ms, error: error.message }
    } else {
      database = { status: 'ok', latency_ms }
    }
  } catch (e) {
    database = {
      status: 'error',
      latency_ms: -1,
      error: e instanceof Error ? e.message : 'Unknown error',
    }
  }

  // Env var checks
  const elevenlabs_secret = {
    status: process.env.ELEVENLABS_TOOL_SECRET ? 'ok' as const : 'missing' as const,
  }
  const elevenlabs_api_key = {
    status: process.env.ELEVENLABS_API_KEY ? 'ok' as const : 'missing' as const,
  }
  const slack_webhook = {
    status: process.env.SLACK_ALERT_WEBHOOK_URL ? 'ok' as const : 'missing' as const,
  }

  // Overall status
  const dbDown = database.status === 'error'
  const envMissing =
    elevenlabs_secret.status === 'missing' || elevenlabs_api_key.status === 'missing'

  const status = dbDown ? 'down' : envMissing ? 'degraded' : 'ok'

  return NextResponse.json(
    {
      status,
      timestamp,
      version,
      checks: { database, elevenlabs_secret, elevenlabs_api_key, slack_webhook },
    },
    { status: status === 'ok' ? 200 : 503 }
  )
}
