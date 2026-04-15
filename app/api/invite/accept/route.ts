import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { InviteAcceptSchema } from '@/lib/validation/schemas'
import { parseJsonBody } from '@/lib/validation/respond'
import { enforceRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  // Rate limit per-IP to prevent token enumeration.
  const blocked = await enforceRateLimit(request, {
    name: 'invite:accept',
    max: 10,
    windowSec: 600,
  })
  if (blocked) return blocked

  const parsed = await parseJsonBody(request, InviteAcceptSchema)
  if (!parsed.ok) return parsed.response
  const { token, fullName, password } = parsed.data

  // ── Service-role client (bypasses RLS) ────────────────────────────────────
  const serviceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Validate the invite token
  const { data: invite, error: inviteError } = await serviceRole
    .from('clinic_invites')
    .select('id, email, role, clinic_id, expires_at, accepted_at')
    .eq('token', token)
    .is('accepted_at', null)
    .single()

  if (inviteError || !invite) {
    return NextResponse.json(
      { error: 'This invite link is invalid or has already been used.' },
      { status: 404 }
    )
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'This invite link has expired. Please request a new one.' },
      { status: 410 }
    )
  }

  // 2. Create the auth user via admin API, or find existing user
  let userId: string

  const { data: newUser, error: createError } =
    await serviceRole.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true, // auto-confirm — invite already validates identity
      user_metadata: { full_name: fullName },
    })

  if (createError || !newUser?.user) {
    // If user already exists, look them up and link to new clinic
    const isAlreadyRegistered =
      createError?.message?.toLowerCase().includes('already') ||
      createError?.message?.toLowerCase().includes('exists') ||
      createError?.message?.toLowerCase().includes('unique') ||
      (createError as unknown as { status?: number })?.status === 422

    if (isAlreadyRegistered) {
      // Find existing user by email
      const { data: existingUsers } = await serviceRole.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === invite.email.toLowerCase()
      )

      if (!existingUser) {
        return NextResponse.json(
          { error: 'An account with this email exists but could not be found. Try signing in.' },
          { status: 409 }
        )
      }

      userId = existingUser.id
    } else {
      console.error('[invite/accept] createUser error:', createError)
      return NextResponse.json(
        { error: `Failed to create your account: ${createError?.message ?? 'Unknown error'}. Please try again.` },
        { status: 500 }
      )
    }
  } else {
    userId = newUser.user.id
  }

  // 3. Insert clinic_users row (check for existing link first)
  const { data: existingLink } = await serviceRole
    .from('clinic_users')
    .select('id')
    .eq('user_id', userId)
    .eq('clinic_id', invite.clinic_id)
    .maybeSingle()

  if (!existingLink) {
    const { error: cuError } = await serviceRole.from('clinic_users').insert({
      user_id: userId,
      clinic_id: invite.clinic_id,
      role: invite.role,
      name: fullName,
    })

    if (cuError) {
      console.error('[invite/accept] clinic_users insert error:', cuError)
      return NextResponse.json(
        { error: 'Failed to link your account to the clinic. Please try again.' },
        { status: 500 }
      )
    }
  }

  // 4. Mark the invite as accepted
  await serviceRole
    .from('clinic_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  logAudit({
    action: 'invite.accepted',
    clinicId: invite.clinic_id,
    actorId: userId,
    actorEmail: invite.email,
    resource: `invite:${invite.id}`,
    metadata: { role: invite.role },
  }, request)

  // 4b. Mark clinic onboarding as completed (admin already set up the clinic)
  await serviceRole
    .from('clinics')
    .update({ onboarding_completed: true })
    .eq('id', invite.clinic_id)
    .eq('onboarding_completed', false)

  // 5. Sign the user in (create session cookie) using the anon client
  const cookieStore = await cookies()
  const response = NextResponse.json({ success: true })
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { error: signInError } = await anonClient.auth.signInWithPassword({
    email: invite.email,
    password,
  })

  if (signInError) {
    // Account was created successfully — user can still sign in manually
    console.warn('[invite/accept] auto sign-in failed:', signInError.message)
  }

  return response
}
