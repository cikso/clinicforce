import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(s) { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { data: cu } = await supabase
    .from('clinic_users').select('role').eq('user_id', user.id).single()
  if (!cu || !['clinic_admin', 'platform_owner'].includes(cu.role)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: Record<string, string | null>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, slug, phone, email, address, suburb, website, vertical, invite_email } = body

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'Clinic name and slug are required.' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Check slug uniqueness
  const { data: existing } = await service.from('clinics').select('id').eq('slug', slug.trim()).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'This slug is already taken. Choose a different one.' }, { status: 409 })
  }

  // Create clinic
  const { data: clinic, error: clinicError } = await service
    .from('clinics')
    .insert({
      name: name.trim(),
      slug: slug.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      suburb: suburb?.trim() || null,
      website: website?.trim() || null,
      vertical: vertical ?? 'vet',
      onboarding_completed: false,
    })
    .select('id')
    .single()

  if (clinicError || !clinic) {
    console.error('[admin/clinics] insert error:', clinicError)
    return NextResponse.json({ error: 'Failed to create clinic.' }, { status: 500 })
  }

  // Optionally create invite
  if (invite_email?.trim()) {
    await service.from('clinic_invites').insert({
      clinic_id: clinic.id,
      email: invite_email.trim(),
      role: 'clinic_admin',
      invited_by: user.email ?? user.id,
    })
    // Note: in production you'd send the invite email here via Resend/SendGrid
  }

  return NextResponse.json({ success: true, clinic_id: clinic.id })
}
