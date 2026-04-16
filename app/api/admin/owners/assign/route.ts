import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * /api/admin/owners/assign
 *
 * Manage clinic_owner assignments for an EXISTING user.
 * - POST { user_id, clinic_id } — add user as clinic_owner of that clinic
 * - DELETE ?user_id=…&clinic_id=… — remove their clinic_owner row for that clinic
 *
 * platform_owner only.
 */

async function requirePlatformOwner() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(s) { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' as const, status: 401 }

  const { data: roles } = await supabase
    .from('clinic_users').select('role').eq('user_id', user.id)
  const isPlatformOwner = (roles ?? []).some((r) => r.role === 'platform_owner')
  if (!isPlatformOwner) return { error: 'Forbidden.' as const, status: 403 }

  return { user }
}

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformOwner()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { user_id?: string; clinic_id?: string; name?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { user_id, clinic_id, name } = body
  if (!user_id || !clinic_id) {
    return NextResponse.json({ error: 'user_id and clinic_id are required.' }, { status: 400 })
  }

  const db = service()

  // Confirm clinic exists
  const { data: clinic } = await db.from('clinics').select('id').eq('id', clinic_id).maybeSingle()
  if (!clinic) return NextResponse.json({ error: 'Clinic not found.' }, { status: 404 })

  // Idempotent: skip if already linked
  const { data: existing } = await db
    .from('clinic_users')
    .select('id, role')
    .eq('user_id', user_id)
    .eq('clinic_id', clinic_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: true, alreadyLinked: true })
  }

  const { error: insertError } = await db.from('clinic_users').insert({
    user_id,
    clinic_id,
    role: 'clinic_owner',
    name: name ?? null,
  })

  if (insertError) {
    console.error('[admin/owners/assign POST] insert error:', insertError)
    return NextResponse.json({ error: 'Failed to assign clinic.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePlatformOwner()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  const clinicId = searchParams.get('clinic_id')
  if (!userId || !clinicId) {
    return NextResponse.json({ error: 'user_id and clinic_id are required.' }, { status: 400 })
  }

  const db = service()

  const { error: delError } = await db
    .from('clinic_users')
    .delete()
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .eq('role', 'clinic_owner')

  if (delError) {
    console.error('[admin/owners/assign DELETE] error:', delError)
    return NextResponse.json({ error: 'Failed to remove assignment.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
