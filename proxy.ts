import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/* ── Domain constants ─────────────────────────────────────────────── */
const APP_HOST   = 'app.clinicforce.io'
const WWW_HOST   = 'www.clinicforce.io'
const BARE_HOST  = 'clinicforce.io'

/* ── Routes served exclusively on the app subdomain ───────────────── */
const DASHBOARD_ROUTES = [
  '/overview',
  '/calls',
  '/care-queue',
  '/bookings',
  '/referrals',
  '/tasks',
  '/media-review',
  '/users',
  '/insights',
  '/settings',
  '/admin',
]

const AUTH_ROUTES = ['/login', '/forgot-password']

const ONBOARDING_PREFIX = '/onboarding'

/** True for any path that belongs on app.clinicforce.io */
function isAppRoute(pathname: string) {
  return (
    DASHBOARD_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith(ONBOARDING_PREFIX) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/invite/')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')?.replace(/:\d+$/, '') // strip port for localhost

  /* ── Bare domain → www (permanent) ─────────────────────────────── */
  if (host === BARE_HOST) {
    const url = request.nextUrl.clone()
    url.host = WWW_HOST
    url.port = ''
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308)
  }

  /* ── www: redirect app routes → app subdomain ──────────────────── */
  if (host === WWW_HOST && isAppRoute(pathname)) {
    const url = request.nextUrl.clone()
    url.host = APP_HOST
    url.port = ''
    url.protocol = 'https:'
    return NextResponse.redirect(url, 302)
  }

  /* ── app subdomain: redirect root → /overview ──────────────────── */
  if (host === APP_HOST && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/overview'
    return NextResponse.redirect(url, 302)
  }

  /* ── Localhost / dev: no subdomain enforcement ─────────────────── */
  // (falls through to auth logic below)

  /* ── Supabase auth session refresh ─────────────────────────────── */
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add logic between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute =
    DASHBOARD_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith(ONBOARDING_PREFIX)

  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // No session → redirect to login
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has session and hitting /login → redirect to dashboard
  if (user && isAuthRoute) {
    const overviewUrl = request.nextUrl.clone()
    overviewUrl.pathname = '/overview'
    overviewUrl.search = ''
    return NextResponse.redirect(overviewUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
