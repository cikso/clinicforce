import { schedules } from '@trigger.dev/sdk/v3'

// ─── enrich-calls scheduled task ─────────────────────────────────────────────
// Runs every 5 minutes. Hits the /api/enrich-calls endpoint which pulls rich
// transcript_summary values from the ElevenLabs Conversations API and writes
// them back to call_inbox rows that still have only the short tool-generated
// summary. ElevenLabs never reliably sends the post_call webhook, so this is
// the primary path for transcript enrichment.

function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'https://app.clinicforce.io'
}

export const enrichCallsSchedule = schedules.task({
  id: 'enrich-calls-schedule',
  cron: '*/5 * * * *',
  maxDuration: 60,
  run: async () => {
    const url = `${getSiteUrl()}/api/enrich-calls`
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-trigger-source': 'enrich-calls-schedule' },
      signal: AbortSignal.timeout(30_000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(
        `enrich-calls returned ${res.status}: ${JSON.stringify(data)}`,
      )
    }
    return data as { enriched: number; total_rows?: number; el_conversations?: number }
  },
})
