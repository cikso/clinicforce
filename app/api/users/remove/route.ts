import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * Remove a teammate from a clinic.
 *
 * Body: { memberId: string }  // clinic_users.id
 *
 * Allowed callers:
 *  - platform_owner (any clinic)
 *  - clinic_admin / clinic_owner of the target member's clinic
 *
 * Hard rules:
 *  - Cannot remove yourself
 *  - Cannot remove a platform_owner
 *  - Cannot remove the last clinic_admin/clinic_owner of a clinic (would orphan it)
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  let body: { memberId?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { memberId } = body
  if (!memberId) return NextResponse.json({ error: 'memberId is required.' }, { status: 400 })

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Load target member
  const { data: target } = await service
    .from('clinic_users')
    .select('id, user_id, role, clinic_id')
    .eq('id', memberId)
    .maybeSingle()
  if (!target) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

  if (target.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 })
  }
  if (target.role === 'platform_owner') {
    return NextResponse.json({ error: 'Platform owners cannot be removed here.' }, { status: 400 })
  }

  // Caller authorisation
  const { data: callerRoles } = await service
    .from('clinic_users')
    .select('role, clinic_id')
    .eq('user_id', user.id)
  const isPlatformOwner = (callerRoles ?? []).some((r) => r.role === 'platform_owner')
  const hasClinicAccess = (callerRoles ?? []).some(
    (r) => r.clinic_id === target.clinic_id && ['clinic_admin', 'clinic_owner'].includes(r.role),
  )
  if (!isPlatformOwner && !hasClinicAccess) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  // Prevent orphaning: if target is the only admin/owner of this clinic, block.
  if (['clinic_admin', 'clinic_owner'].includes(target.role)) {
    const { data: peers } = await service
      .from('clinic_users')
      .select('id')
      .eq('clinic_id', target.clinic_id)
      .in('role', ['clinic_admin', 'clinic_owner'])
      .neq('id', target.id)
    if (!peers || peers.length === 0) {
      return NextResponse.json(
        { error: 'Cannot remove the last admin of this clinic. Promote another member first.' },
        { status: 400 },
      )
    }
  }

  const { error: delErr } = await service
    .from('clinic_users')
    .delete()
    .eq('id', memberId)
  if (delErr) {
    console.error('[users/remove] delete error:', delErr)
    return NextResponse.json({ error: 'Failed to remove member.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
