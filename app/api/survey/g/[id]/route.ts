import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/voice/shared'

export const preferredRegion = 'syd1'

// ─── GET /api/survey/g/[id] ──────────────────────────────────────────────────
// Tracked redirect for the promoter → Google review handoff.
// The promoter SMS sent from /api/survey/reply contains a link to this
// endpoint instead of the raw clinic.google_review_url. We stamp
// google_review_clicked_at on first hit, then 302 to the actual review URL.
//
// Public endpoint by design — no auth, no secret. The id is a UUID so
// guessing one to inflate metrics is not realistic.

function notFound() {
  return new NextResponse(
    '<!doctype html><html><body style="font-family:system-ui;text-align:center;padding:48px"><h1>Link expired</h1><p>This review link is no longer valid.</p></body></html>',
    { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!id || id.length < 8) {
    return notFound()
  }

  const supabase = getServiceSupabase()

  const { data: response, error } = await supabase
    .from('survey_responses')
    .select('id, clinic_id, google_review_clicked_at')
    .eq('id', id)
    .maybeSingle()

  if (error || !response) {
    return notFound()
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('google_review_url')
    .eq('id', response.clinic_id)
    .maybeSingle()

  const url = clinic?.google_review_url?.trim()
  if (!url) {
    return notFound()
  }

  // Stamp first-click time (idempotent: keep the original click timestamp).
  if (!response.google_review_clicked_at) {
    await supabase
      .from('survey_responses')
      .update({ google_review_clicked_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.redirect(url, { status: 302 })
}
