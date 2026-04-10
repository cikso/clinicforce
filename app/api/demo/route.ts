import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── In-memory rate limit: 3 requests per IP per hour ────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const now = Date.now()

  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(key)
  }

  const rateEntry = rateLimitMap.get(ip)
  if (rateEntry && rateEntry.count >= 3) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }
  rateLimitMap.set(ip, {
    count: (rateEntry?.count ?? 0) + 1,
    resetAt: rateEntry?.resetAt ?? now + 60 * 60 * 1000,
  })

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Honeypot — bots that fill the hidden "website" field get a silent 200 ─
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const name       = String(body.name ?? '').trim()
  const email      = String(body.email ?? '').trim().toLowerCase()
  const phone      = String(body.phone ?? '').trim() || null
  const clinicName = String(body.clinic_name ?? '').trim()
  const vertical   = String(body.vertical ?? '').trim()
  const clinicSize = String(body.clinic_size ?? '').trim()
  const message    = String(body.message ?? '').trim() || null
  const source     = String(body.source ?? 'landing_page').trim()

  if (!name || !email || !clinicName || !vertical || !clinicSize) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { error: dbError } = await supabase.from('demo_requests').insert({
    name,
    email,
    phone,
    clinic_name: clinicName,
    vertical,
    clinic_size: clinicSize,
    message,
    source,
  })

  if (dbError) {
    console.error('[api/demo] Insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
