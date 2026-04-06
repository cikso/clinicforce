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
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Password reset flow — send to the set-new-password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/update-password`)
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
        return NextResponse.redirect(`${origin}/overview`)
      }

      const onboardingCompleted =
        (clinicUser?.clinics as { onboarding_completed?: boolean } | null)
          ?.onboarding_completed ?? false

      if (!onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding/clinic-details`)
      }

      const redirectPath = next.startsWith('/') ? next : '/overview'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // No code param — Supabase may have redirected with hash-based error
  // (hash fragments don't reach the server, so we send the browser to a
  // client page that reads window.location.hash and shows a friendly message)
  return NextResponse.redirect(`${origin}/auth/link-expired`)
}
