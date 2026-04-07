import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')   // 'recovery' for password reset
  const next = searchParams.get('next') ?? '/overview'

  if (code) {
    const cookieStore = await cookies()
    let response = NextResponse.redirect(`${origin}/auth/link-expired`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Password reset flow — send to the set-new-password page
      if (type === 'recovery') {
        response = NextResponse.redirect(`${origin}/auth/update-password`)
        return response
      }

      // Normal login/signup — check role + onboarding status
      const { data: clinicUser } = await supabase
        .from('clinic_users')
        .select('clinic_id, role, clinics(onboarding_completed)')
        .eq('user_id', data.user.id)
        .limit(1)
        .single()

      // Platform owner never goes through onboarding
      if (clinicUser?.role === 'platform_owner') {
        response = NextResponse.redirect(`${origin}/overview`)
        return response
      }

      const onboardingCompleted =
        (clinicUser?.clinics as { onboarding_completed?: boolean } | null)
          ?.onboarding_completed ?? false

      if (!onboardingCompleted) {
        response = NextResponse.redirect(`${origin}/onboarding/clinic-details`)
        return response
      }

      const redirectPath = next.startsWith('/') ? next : '/overview'
      response = NextResponse.redirect(`${origin}${redirectPath}`)
      return response
    }
  }

  // No code param — Supabase may have redirected with hash-based error
  // (hash fragments don't reach the server, so we send the browser to a
  // client page that reads window.location.hash and shows a friendly message)
  return NextResponse.redirect(`${origin}/auth/link-expired`)
}
