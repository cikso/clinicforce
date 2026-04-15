import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  SettingsRequestSchema,
  SETTINGS_TABLE_SCHEMAS,
} from '@/lib/validation/schemas'
import { parseJsonBody } from '@/lib/validation/respond'
import { logAudit } from '@/lib/audit'

// Roles that may write through this generic endpoint. Receptionists / staff
// must NOT be allowed to mutate clinic settings or invite rows.
const WRITE_ROLES = new Set(['clinic_admin', 'platform_owner'])
// elevenlabs_agent_id can only be changed by the platform owner.
const PLATFORM_OWNER_ONLY_FIELDS: Record<string, string[]> = {
  voice_agents: ['elevenlabs_agent_id'],
}

export async function POST(request: NextRequest) {
  // ── 1. Validate request shape ────────────────────────────────────────────
  const parsed = await parseJsonBody(request, SettingsRequestSchema)
  if (!parsed.ok) return parsed.response
  const { table, data, id, clinicId } = parsed.data

  // ── 2. Validate the per-table data payload against its allowlist ─────────
  const tableSchema = SETTINGS_TABLE_SCHEMAS[table]
  const tablePayload = tableSchema.safeParse(data)
  if (!tablePayload.success) {
    return NextResponse.json(
      {
        error: 'Invalid fields for this table',
        issues: tablePayload.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    )
  }
  const safeData = tablePayload.data as Record<string, unknown>

  // ── 3. Auth ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
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

  const { data: cu } = await service
    .from('clinic_users')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!cu) return NextResponse.json({ error: 'No clinic linked.' }, { status: 403 })

  // ── 4. Role gate — receptionists/staff cannot write settings ─────────────
  if (!WRITE_ROLES.has(cu.role as string)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const isPlatformOwner = cu.role === 'platform_owner'

  // ── 5. Strip platform-owner-only fields if not platform owner ────────────
  const ownerOnly = PLATFORM_OWNER_ONLY_FIELDS[table] ?? []
  if (!isPlatformOwner) {
    for (const field of ownerOnly) {
      if (field in safeData) delete safeData[field]
    }
  }

  // ── 6. Resolve clinic scope ──────────────────────────────────────────────
  // Only platform_owner may target a clinic other than their own.
  let resolvedClinicId = cu.clinic_id as string
  if (clinicId && clinicId !== cu.clinic_id) {
    if (!isPlatformOwner) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }
    resolvedClinicId = clinicId
  }

  // ── 7. Per-table dispatch ────────────────────────────────────────────────
  if (table === 'clinics') {
    const { error } = await service
      .from('clinics')
      .update({ ...safeData, updated_at: new Date().toISOString() })
      .eq('id', resolvedClinicId)
    if (error) {
      console.error('[settings] clinics update error:', error.message)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    logAudit({
      action: 'settings.clinic.updated',
      clinicId: resolvedClinicId,
      actorId: user.id,
      actorEmail: user.email ?? null,
      resource: `clinic:${resolvedClinicId}`,
      metadata: { fields: Object.keys(safeData) },
    }, request)
    return NextResponse.json({ success: true })
  }

  if (table === 'voice_agents') {
    if (!id) return NextResponse.json({ error: 'Missing voice agent id.' }, { status: 400 })
    const { error } = await service
      .from('voice_agents')
      .update(safeData)
      .eq('id', id)
      .eq('clinic_id', resolvedClinicId)
    if (error) {
      console.error('[settings] voice_agents update error:', error.message)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    logAudit({
      action: 'settings.voice_agent.updated',
      clinicId: resolvedClinicId,
      actorId: user.id,
      actorEmail: user.email ?? null,
      resource: `voice_agent:${id}`,
      metadata: { fields: Object.keys(safeData) },
    }, request)
    return NextResponse.json({ success: true })
  }

  if (table === 'clinic_users') {
    if (!id) return NextResponse.json({ error: 'Missing user id.' }, { status: 400 })
    const { error } = await service
      .from('clinic_users')
      .update(safeData)
      .eq('id', id)
      .eq('clinic_id', resolvedClinicId)
    if (error) {
      console.error('[settings] clinic_users update error:', error.message)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    logAudit({
      action: 'settings.clinic_user.updated',
      clinicId: resolvedClinicId,
      actorId: user.id,
      actorEmail: user.email ?? null,
      resource: `clinic_user:${id}`,
      metadata: { fields: Object.keys(safeData) },
    }, request)
    return NextResponse.json({ success: true })
  }

  if (table === 'clinic_invites') {
    const { data: inserted, error } = await service
      .from('clinic_invites')
      .insert({ ...safeData, clinic_id: resolvedClinicId, invited_by: user.id })
      .select('id')
      .single()
    if (error) {
      console.error('[settings] clinic_invites insert error:', error.message)
      return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 })
    }
    logAudit({
      action: 'invite.sent',
      clinicId: resolvedClinicId,
      actorId: user.id,
      actorEmail: user.email ?? null,
      resource: `invite:${inserted.id}`,
      metadata: { role: safeData.role },
    }, request)
    return NextResponse.json({ success: true, id: inserted.id })
  }

  if (table === 'notification_settings') {
    const { error } = await service
      .from('notification_settings')
      .upsert(
        { ...safeData, clinic_id: resolvedClinicId, updated_at: new Date().toISOString() },
        { onConflict: 'clinic_id' },
      )
    if (error) {
      console.error('[settings] notification_settings upsert error:', error.message)
      return NextResponse.json({ error: 'Failed to save.' }, { status: 500 })
    }
    logAudit({
      action: 'settings.notifications.updated',
      clinicId: resolvedClinicId,
      actorId: user.id,
      actorEmail: user.email ?? null,
      metadata: { fields: Object.keys(safeData) },
    }, request)
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
  // UUID guard — prevents arbitrary string injection.
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 })
  }

  // Auth
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
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

  // Role check — only clinic_admin / platform_owner can delete invites.
  const { data: cu } = await service
    .from('clinic_users')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!cu || !WRITE_ROLES.has(cu.role as string)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  if (table === 'clinic_invites') {
    // Scope the delete to the caller's clinic so a clinic_admin cannot delete
    // another clinic's invites by guessing an id.
    const deleteQuery = service.from('clinic_invites').delete().eq('id', id)
    const { error } =
      cu.role === 'platform_owner'
        ? await deleteQuery
        : await deleteQuery.eq('clinic_id', cu.clinic_id as string)

    if (error) {
      console.error('[settings] clinic_invites delete error:', error.message)
      return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 })
    }
    logAudit({
      action: 'invite.deleted',
      clinicId: cu.clinic_id as string,
      actorId: user.id,
      actorEmail: user.email ?? null,
      resource: `invite:${id}`,
    }, request)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid table for delete.' }, { status: 400 })
}
