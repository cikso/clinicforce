import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  let body: { table: string; data: Record<string, unknown>; id?: string; clinicId?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { table, data, id, clinicId } = body
  if (!table || !data) {
    return NextResponse.json({ error: 'Missing table or data.' }, { status: 400 })
  }

  // Authenticate
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
    },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  // Get service client
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Verify user is clinic_admin or platform_owner
  const { data: cu } = await service
    .from('clinic_users')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!cu) {
    return NextResponse.json({ error: 'No clinic linked.' }, { status: 403 })
  }

  const allowedTables = ['clinics', 'voice_agents', 'clinic_users', 'clinic_invites', 'notification_settings']
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: 'Invalid table.' }, { status: 400 })
  }

  // Only platform_owner can target an arbitrary clinic via the request body.
  // Everyone else is pinned to their own clinic_users.clinic_id — prevents a
  // clinic_admin from writing to another clinic by passing clinicId in the body.
  const isPlatformOwner = cu.role === 'platform_owner'
  const resolvedClinicId = isPlatformOwner && clinicId ? clinicId : cu.clinic_id

  if (table === 'clinics') {
    const { error } = await service
      .from('clinics')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', resolvedClinicId)

    if (error) {
      console.error('[settings] clinics update error:', error)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (table === 'voice_agents') {
    if (!id) {
      return NextResponse.json({ error: 'Missing voice agent id.' }, { status: 400 })
    }
    const { error } = await service
      .from('voice_agents')
      .update(data)
      .eq('id', id)
      .eq('clinic_id', resolvedClinicId)

    if (error) {
      console.error('[settings] voice_agents update error:', error)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (table === 'clinic_users') {
    if (!id) {
      return NextResponse.json({ error: 'Missing user id.' }, { status: 400 })
    }
    const { error } = await service
      .from('clinic_users')
      .update(data)
      .eq('id', id)
      .eq('clinic_id', resolvedClinicId)

    if (error) {
      console.error('[settings] clinic_users update error:', error)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (table === 'clinic_invites') {
    // Insert new invite
    const { data: inserted, error } = await service
      .from('clinic_invites')
      .insert({ ...data, clinic_id: resolvedClinicId, invited_by: user.id })
      .select('id')
      .single()

    if (error) {
      console.error('[settings] clinic_invites insert error:', error)
      return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 })
    }
    return NextResponse.json({ success: true, id: inserted.id })
  }

  if (table === 'notification_settings') {
    // Upsert notification settings
    const { error } = await service
      .from('notification_settings')
      .upsert(
        { ...data, clinic_id: resolvedClinicId, updated_at: new Date().toISOString() },
        { onConflict: 'clinic_id' },
      )

    if (error) {
      console.error('[settings] notification_settings upsert error:', error)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unhandled.' }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')

  if (!table || !id) {
    return NextResponse.json({ error: 'Missing table or id.' }, { status: 400 })
  }

  // Authenticate
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
    },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  if (table === 'clinic_invites') {
    const { error } = await service
      .from('clinic_invites')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[settings] clinic_invites delete error:', error)
      return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid table for delete.' }, { status: 400 })
}
