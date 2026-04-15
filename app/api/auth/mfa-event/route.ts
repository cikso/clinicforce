import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { parseJsonBody } from '@/lib/validation/respond'
import { logAudit } from '@/lib/audit'

const BodySchema = z.object({
  event: z.enum(['enrolled', 'removed', 'verified']),
  factor_id: z.string().min(1),
})

/**
 * Tiny helper endpoint so client-side MFA flows (enroll / unenroll / verify)
 * can leave an audit trail without the Supabase service role reaching the
 * browser. The action itself is performed by supabase-js in the browser;
 * we just record it server-side after the fact.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = await parseJsonBody(req, BodySchema)
  if (!parsed.ok) return parsed.response
  const { event, factor_id } = parsed.data

  logAudit(
    {
      action: `mfa.${event}`,
      actorId: user.id,
      actorEmail: user.email ?? null,
      resource: `mfa_factor:${factor_id}`,
    },
    req,
  )

  return NextResponse.json({ ok: true })
}
