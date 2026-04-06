import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    pathname.startsWith('/onboarding')

  const isAuthRoute = pathname === '/login' || pathname === '/forgot-password'

  // No session -> redirect to login
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has session and hitting /login -> redirect to dashboard
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
    /*
     * Run on all routes except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - Public assets
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
