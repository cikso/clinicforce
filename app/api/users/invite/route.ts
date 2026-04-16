import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    // Verify caller is authenticated
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, email, role } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const admin = getAdmin()

    // Get caller's clinic — use limit(1) to safely handle duplicate rows from testing
    const { data: cuRows, error: cuErr } = await admin
      .from('clinic_users')
      .select('clinic_id, clinics(name)')
      .eq('user_id', user.id)
      .limit(1)

    const cu = cuRows?.[0] ?? null

    if (cuErr || !cu?.clinic_id) {
      console.error('[users/invite] clinic lookup error:', cuErr)
      return NextResponse.json({ error: 'No clinic found for your account' }, { status: 400 })
    }

    const clinicRow = Array.isArray(cu.clinics) ? cu.clinics[0] : cu.clinics
    const clinicName = (clinicRow as { name?: string } | null)?.name ?? 'Your Clinic'

    // Create user account (no password — they set it via the magic link)
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      user_metadata: { full_name: name },
      email_confirm: true,
    })

    if (createErr || !newUser.user) {
      return NextResponse.json({ error: createErr?.message ?? 'Failed to create user' }, { status: 500 })
    }

    // Link user to clinic
    const { error: linkErr } = await admin.from('clinic_users').insert({
      user_id: newUser.user.id,
      clinic_id: cu.clinic_id,
      name,
      role: role?.toLowerCase() ?? 'staff',
    })

    if (linkErr) {
      console.error('[users/invite] clinic_users insert error:', linkErr)
      await admin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: `Failed to link user to clinic: ${linkErr.message}` }, { status: 500 })
    }

    // Generate a one-time password-reset link so they can set their own password
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      console.error('[users/invite] NEXT_PUBLIC_SITE_URL is not set — cannot generate invite link')
      await admin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: 'Server not configured: NEXT_PUBLIC_SITE_URL is missing' },
        { status: 500 },
      )
    }
    const { data: linkData, error: linkGenErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/update-password`,
      },
    })

    if (linkGenErr || !linkData?.properties?.action_link) {
      console.error('[users/invite] link generation failed:', linkGenErr)
      // Account created — just couldn't send email
      return NextResponse.json({
        success: true,
        userId: newUser.user.id,
        emailSent: false,
        warning: 'Account created but welcome email could not be sent.',
      })
    }

    // Send branded welcome email
    try {
      await sendWelcomeEmail({
        to:         email,
        name,
        clinicName,
        loginUrl:   linkData.properties.action_link,
        role:       role ?? 'Staff',
      })
    } catch (emailErr) {
      console.error('[users/invite] email send failed:', emailErr)
      return NextResponse.json({
        success: true,
        userId: newUser.user.id,
        emailSent: false,
        warning: 'Account created but welcome email could not be sent.',
      })
    }

    return NextResponse.json({ success: true, userId: newUser.user.id, emailSent: true })
  } catch (err) {
    console.error('Invite error:', err)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
