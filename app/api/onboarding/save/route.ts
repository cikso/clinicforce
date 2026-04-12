import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  let body: { step?: string; data?: Record<string, unknown>; complete?: boolean }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { step, data, complete } = body
  if (!step || !data) {
    return NextResponse.json({ error: 'Missing step or data.' }, { status: 400 })
  }

  // ── Get authenticated user ─────────────────────────────────────────────────
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  // ── Service role client (bypasses RLS) ────────────────────────────────────
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ── Find or create clinic for this user ───────────────────────────────────
  let clinicId: string | null = null

  const { data: clinicUser } = await service
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (clinicUser?.clinic_id) {
    // Existing link found — use it
    clinicId = clinicUser.clinic_id
  } else {
    // No clinic linked yet — auto-create one on Step 1
    // For later steps, we still try to create so nothing blocks the user
    const clinicName =
      step === 'clinic-details'
        ? ((data as { name?: string }).name?.trim() ?? 'My Clinic')
        : 'My Clinic'

    const slug = clinicName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40) + '-' + Date.now().toString(36)

    const { data: newClinic, error: clinicErr } = await service
      .from('clinics')
      .insert({
        name: clinicName,
        slug,
        vertical: 'vet',
        onboarding_completed: false,
      })
      .select('id')
      .single()

    if (clinicErr || !newClinic) {
      console.error('[onboarding/save] clinic auto-create error:', clinicErr)
      return NextResponse.json({ error: 'Failed to initialise your clinic. Please try again.' }, { status: 500 })
    }

    // Link the user as clinic_admin
    const { error: cuErr } = await service
      .from('clinic_users')
      .insert({
        user_id: user.id,
        clinic_id: newClinic.id,
        role: 'clinic_admin',
        name: user.user_metadata?.full_name ?? user.email ?? 'Admin',
      })

    if (cuErr) {
      console.error('[onboarding/save] clinic_users insert error:', cuErr)
      // Clean up the clinic we just created
      await service.from('clinics').delete().eq('id', newClinic.id)
      return NextResponse.json({ error: 'Failed to link your account. Please try again.' }, { status: 500 })
    }

    clinicId = newClinic.id
  }

  // ── Build update payload per step ─────────────────────────────────────────
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  switch (step) {
    case 'clinic-details': {
      const d = data as {
        name?: string; phone?: string; address?: string
        suburb?: string; postcode?: string; email?: string; website?: string
        services?: string; after_hours_partner?: string
        after_hours_phone?: string; emergency_partner_address?: string
      }
      if (d.name)    updatePayload.name    = d.name.trim()
      if (d.phone)   updatePayload.phone   = d.phone.trim()
      if (d.address) updatePayload.address = d.address.trim()
      if (d.suburb)  updatePayload.suburb  = d.suburb.trim()
      if (d.postcode) updatePayload.postcode = d.postcode.trim()
      if (d.email)   updatePayload.email   = d.email.trim()
      if (d.website) updatePayload.website = d.website.trim()
      if (d.services) updatePayload.services = d.services.trim()
      if (d.after_hours_partner) updatePayload.after_hours_partner = d.after_hours_partner.trim()
      if (d.after_hours_phone) updatePayload.after_hours_phone = d.after_hours_phone.trim()
      if (d.emergency_partner_address) updatePayload.emergency_partner_address = d.emergency_partner_address.trim()
      break
    }

    case 'hours': {
      const d = data as { business_hours?: Record<string, unknown> }
      if (d.business_hours) {
        updatePayload.business_hours = d.business_hours
        // Build human-readable string for ElevenLabs dynamic var
        const hoursText = Object.entries(d.business_hours)
          .map(([day, h]) => {
            const hours = h as { open: boolean; start: string; end: string }
            return hours.open
              ? `${day}: ${hours.start} – ${hours.end}`
              : `${day}: Closed`
          })
          .join(', ')
        updatePayload.clinic_hours = hoursText
      }
      break
    }

    case 'call-handling': {
      const d = data as {
        vertical?: string; after_hours_partner?: string
        after_hours_phone?: string; emergency_partner_address?: string; services?: string
      }
      if (d.vertical)                  updatePayload.vertical                  = d.vertical
      if (d.after_hours_partner)       updatePayload.after_hours_partner       = d.after_hours_partner.trim()
      if (d.after_hours_phone)         updatePayload.after_hours_phone         = d.after_hours_phone.trim()
      if (d.emergency_partner_address) updatePayload.emergency_partner_address = d.emergency_partner_address.trim()
      if (d.services)                  updatePayload.services                  = d.services.trim()
      updatePayload.after_hours_enabled = true
      break
    }

    case 'urgent-rules': {
      const d = data as { urgent_rules?: Record<string, unknown> }
      if (d.urgent_rules) updatePayload.urgent_rules = d.urgent_rules
      break
    }

    default:
      return NextResponse.json({ error: `Unknown step: ${step}` }, { status: 400 })
  }

  // Mark onboarding complete on final step
  if (complete) {
    updatePayload.onboarding_completed = true
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  const { error: updateError } = await service
    .from('clinics')
    .update(updatePayload)
    .eq('id', clinicId)

  if (updateError) {
    console.error('[onboarding/save] update error:', updateError)
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
