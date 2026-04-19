import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  // Brute-force guard: 5 attempts per 15 min per IP, 5 per 15 min per email.
  const ip = getClientIp(request)
  const ipLimit = rateLimit('login:ip', ip, 5, 15 * 60 * 1000)
  const emailLimit = rateLimit('login:email', email, 5, 15 * 60 * 1000)
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' },
      { status: 429 },
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const response = NextResponse.json({ ok: true })
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json(
      { error: 'Incorrect email or password. Please try again.' },
      { status: 401 }
    )
  }

  return response
}
