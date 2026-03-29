import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

// ── GET /api/inbox ─────────────────────────────────────────────
// Returns all call inbox items for the clinic, newest first
export async function GET() {
  const { data, error } = await supabase
    .from('call_inbox')
    .select('*')
    .eq('clinic_id', DEMO_CLINIC_ID)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[inbox] GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map snake_case → camelCase for the frontend
  const items = (data ?? []).map(row => ({
    id:              row.id,
    callerName:      row.caller_name    ?? 'Unknown caller',
    callerPhone:     row.caller_phone   ?? '—',
    petName:         row.pet_name       ?? '—',
    petSpecies:      row.pet_species    ?? '—',
    summary:         row.summary        ?? '',
    aiDetail:        row.ai_detail      ?? '',
    actionRequired:  row.action_required ?? '—',
    urgency:         row.urgency        ?? 'ROUTINE',
    status:          row.status         ?? 'UNREAD',
    coverageReason:  row.coverage_reason ?? 'OVERFLOW',
    createdAt:       formatRelative(row.created_at),
    callDurationSeconds: row.call_duration_seconds ?? null,
  }))

  return NextResponse.json(items)
}

// ── PATCH /api/inbox ───────────────────────────────────────────
// Body: { id: string, status: 'READ' | 'ACTIONED' }
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('call_inbox')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', body.id)
    .eq('clinic_id', DEMO_CLINIC_ID)

  if (error) {
    console.error('[inbox] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// ── Helper ─────────────────────────────────────────────────────
function formatRelative(iso: string): string {
  if (!iso) return '—'
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24)  return `${diffHr}h ago`
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}
