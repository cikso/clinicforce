import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require a valid session
const PROTECTED_PREFIXES = [
  '/overview',
  '/calls',
  '/settings',
  '/users',
  '/insights',
  '/referrals',
  '/bookings',
  '/care-queue',
  '/tasks',
  '/media-review',
  '/admin',
  '/onboarding',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Refresh the session cookie on every request so it doesn't expire mid-session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT and refreshes it if needed
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - _next/static  (Next.js build assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - API routes under /api/ (they handle their own auth)
     *   - /auth/         (Supabase auth callback)
     *   - /login, /register, /forgot-password (public auth pages)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/|auth/|login|register|forgot-password).*)',
  ],
}
