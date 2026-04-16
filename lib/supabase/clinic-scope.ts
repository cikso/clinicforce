/**
 * Multi-clinic scope resolver.
 *
 * Single source of truth for "which clinics can this user see / act on".
 *
 * Roles:
 *   - platform_owner: every clinic on the platform (founder / staff at ClinicForce HQ)
 *   - clinic_owner:   the specific clinics they own (one row per clinic in clinic_users)
 *   - clinic_admin:   their one clinic (single-clinic UX, not handled here)
 *   - staff/etc.:     their one clinic (single-clinic UX, not handled here)
 *
 * Anything that needs to render multi-clinic data should go through getAccessibleClinics.
 */

import { createClient as createServiceClient } from '@supabase/supabase-js'

export const MULTI_CLINIC_ROLES = ['platform_owner', 'clinic_owner'] as const
export type MultiClinicRole = typeof MULTI_CLINIC_ROLES[number]

export function isMultiClinicRole(role: string | null | undefined): role is MultiClinicRole {
  return !!role && (MULTI_CLINIC_ROLES as readonly string[]).includes(role)
}

export interface AccessibleClinic {
  id: string
  name: string
  vertical: string
  suburb: string | null
}

/**
 * Returns the clinics this user can see.
 * - platform_owner → all clinics (excluding the internal clinicforce-platform sentinel row)
 * - clinic_owner   → clinics they have a clinic_users row for with role='clinic_owner'
 * - other roles    → empty (callers should use getClinicProfile for single-clinic UX)
 */
export async function getAccessibleClinics(
  userId: string,
  role: string,
): Promise<AccessibleClinic[]> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return []

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  if (role === 'platform_owner') {
    const { data } = await service
      .from('clinics')
      .select('id, name, vertical, suburb')
      .not('slug', 'eq', 'clinicforce-platform')
      .order('name', { ascending: true })
    return (data ?? []) as AccessibleClinic[]
  }

  if (role === 'clinic_owner') {
    const { data } = await service
      .from('clinic_users')
      .select('clinics ( id, name, vertical, suburb )')
      .eq('user_id', userId)
      .eq('role', 'clinic_owner')
    const clinics = (data ?? [])
      .map((row: { clinics: unknown }) => {
        const c = Array.isArray(row.clinics) ? row.clinics[0] : row.clinics
        return c as AccessibleClinic | null
      })
      .filter((c): c is AccessibleClinic => !!c?.id)
    // Sort by name for stable display
    clinics.sort((a, b) => a.name.localeCompare(b.name))
    return clinics
  }

  return []
}
