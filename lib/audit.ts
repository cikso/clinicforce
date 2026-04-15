/**
 * Audit log helper.
 *
 * Every security-relevant action (auth, billing, invites, admin actions)
 * should call logAudit(). Failures are never propagated to the caller —
 * losing an audit line should not break a login.
 *
 * Append-only. Reads are controlled by RLS:
 *   - platform_owner: everything
 *   - clinic_admin:   their own clinic
 *   - everyone else:  nothing
 */

import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { clientIp } from './rate-limit'

export type AuditEvent = {
  /** Dotted action name, e.g. 'auth.login.success', 'billing.checkout.created'. */
  action: string
  clinicId?: string | null
  actorId?: string | null
  actorEmail?: string | null
  /** String pointer to the affected object, e.g. 'clinic:uuid', 'invite:uuid'. */
  resource?: string | null
  metadata?: Record<string, unknown>
}

let cached: ReturnType<typeof createClient> | null | undefined

function getClient() {
  if (cached !== undefined) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    cached = null
    return null
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}

/**
 * Fire-and-forget audit write.
 *
 * Returns immediately; the actual DB write happens in the background and
 * errors are logged but swallowed.
 */
export function logAudit(event: AuditEvent, req?: NextRequest): void {
  const supabase = getClient()
  if (!supabase) {
    console.warn('[audit] service client not available — event dropped:', event.action)
    return
  }

  const row = {
    action: event.action,
    clinic_id: event.clinicId ?? null,
    actor_id: event.actorId ?? null,
    actor_email: event.actorEmail ?? null,
    resource: event.resource ?? null,
    ip: req ? clientIp(req) : null,
    user_agent: req ? (req.headers.get('user-agent') ?? null) : null,
    metadata: event.metadata ?? {},
  }

  // Background write — do not await in the hot path. `.from<any>` avoids
  // the generated-types requirement; writes use service_role and RLS allows all.
  ;(supabase.from('audit_log') as unknown as {
    insert(v: typeof row): Promise<{ error: { message: string } | null }>
  })
    .insert(row)
    .then(({ error }) => {
      if (error) console.error('[audit] insert failed:', error.message, event.action)
    })
}
