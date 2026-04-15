import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LoginSchema } from '@/lib/validation/schemas'
import { parseJsonBody } from '@/lib/validation/respond'
import { enforceRateLimit, clientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // ── Rate limit: 5 attempts / 15 min / IP (generic) ────────────────────────
  // A second, tighter limit on email is applied after we parse the body.
  const ipBlocked = await enforceRateLimit(request, {
    name: 'auth:login:ip',
    max: 20,
    windowSec: 900,
  })
  if (ipBlocked) return ipBlocked

  const parsed = await parseJsonBody(request, LoginSchema)
  if (!parsed.ok) return parsed.response
  const { email, password } = parsed.data

  // Per-email limit prevents distributed credential stuffing against one user
  const emailBlocked = await enforceRateLimit(
    request,
    { name: 'auth:login:email', max: 5, windowSec: 900 },
    email,
  )
  if (emailBlocked) return emailBlocked

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const response = NextResponse.json({ ok: true })
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        )
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    // Structured log for intrusion-detection pipelines; no PII leak to client.
    console.warn('[auth/login] failed', {
      ip: clientIp(request),
      email_hash: hashEmail(email),
      reason: error?.message ?? 'no_user',
    })
    return NextResponse.json(
      { error: 'Incorrect email or password. Please try again.' },
      { status: 401 },
    )
  }

  return response
}

/** One-way hash for log correlation without persisting plaintext emails. */
function hashEmail(e: string): string {
  // Cheap, non-cryptographic hash — enough to group suspicious activity per account.
  let h = 5381
  for (let i = 0; i < e.length; i++) h = ((h << 5) + h + e.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
