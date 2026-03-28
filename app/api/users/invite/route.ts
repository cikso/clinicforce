import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

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

    const { name, email, role, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const admin = getAdmin()

    // Get the caller's clinic
    const { data: cu } = await admin
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()

    if (!cu) return NextResponse.json({ error: 'No clinic found for your account' }, { status: 400 })

    // Create the new user account
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      email_confirm: true, // skip email confirmation
    })

    if (createErr || !newUser.user) {
      return NextResponse.json({ error: createErr?.message ?? 'Failed to create user' }, { status: 500 })
    }

    // Link new user to the same clinic
    await admin.from('clinic_users').insert({
      user_id: newUser.user.id,
      clinic_id: cu.clinic_id,
      name,
      role: role.toLowerCase(),
    })

    return NextResponse.json({ success: true, userId: newUser.user.id })
  } catch (err) {
    console.error('Invite error:', err)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
