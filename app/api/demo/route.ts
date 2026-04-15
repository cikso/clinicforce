import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DemoRequestSchema } from '@/lib/validation/schemas'
import { parseJsonBody } from '@/lib/validation/respond'
import { enforceRateLimit } from '@/lib/rate-limit'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  // Service role is required: public RLS on demo_requests is locked down.
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  const blocked = await enforceRateLimit(req, {
    name: 'demo:request',
    max: 3,
    windowSec: 60 * 60,
  })
  if (blocked) return blocked

  const parsed = await parseJsonBody(req, DemoRequestSchema)
  if (!parsed.ok) return parsed.response
  const data = parsed.data

  // Honeypot — bots that fill the hidden "website" field get a silent 200.
  if (typeof data.website === 'string' && data.website.length > 0) {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const supabase = getServiceRoleClient()
  if (!supabase) {
    console.error('[api/demo] SUPABASE_SERVICE_ROLE_KEY missing — cannot persist demo request')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { error: dbError } = await supabase.from('demo_requests').insert({
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    clinic_name: data.clinic_name,
    vertical: data.vertical,
    clinic_size: data.clinic_size,
    message: data.message ?? null,
    source: data.source ?? 'landing_page',
  })

  if (dbError) {
    console.error('[api/demo] insert error:', dbError.message)
    return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
