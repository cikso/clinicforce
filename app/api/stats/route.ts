import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DEMO_CLINIC_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── Sydney timezone helpers ────────────────────────────────────

/** Returns the UTC offset string for Australia/Sydney on a given date,
 *  e.g. "+11:00" (AEDT) or "+10:00" (AEST). */
function sydneyUTCOffset(dateStr: string): string {
  const probe = new Date(`${dateStr}T12:00:00Z`)
  const localStr = probe.toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
  const local = new Date(localStr)
  const diffMins = Math.round((local.getTime() - probe.getTime()) / 60_000)
  const sign = diffMins >= 0 ? '+' : '-'
  const h = String(Math.floor(Math.abs(diffMins) / 60)).padStart(2, '0')
  const m = String(Math.abs(diffMins) % 60).padStart(2, '0')
  return `${sign}${h}:${m}`
}

/** Returns UTC ISO start/end for a Sydney calendar day.
 *  daysAgo = 0 → today, 1 → yesterday. */
function sydneyDayBounds(daysAgo: number): { start: string; end: string } {
  // Shift by whole days to get the right calendar date in Sydney
  const ref = new Date(Date.now() - daysAgo * 86_400_000)

  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ref)

  const y  = parts.find(p => p.type === 'year')!.value
  const mo = parts.find(p => p.type === 'month')!.value
  const d  = parts.find(p => p.type === 'day')!.value
  const dateStr = `${y}-${mo}-${d}`

  const offset = sydneyUTCOffset(dateStr)
  const start  = new Date(`${dateStr}T00:00:00${offset}`)
  const end    = new Date(start.getTime() + 86_400_000)

  return { start: start.toISOString(), end: end.toISOString() }
}

// ── Trend computation ──────────────────────────────────────────

export interface StatTrend {
  direction: 'up' | 'down' | 'same' | 'new' | null
  label:     string | null
}

function countTrend(today: number, yesterday: number): StatTrend {
  if (today === 0 && yesterday === 0) return { direction: null,   label: null }
  if (yesterday === 0 && today > 0)   return { direction: 'new',  label: 'New today' }
  if (today === yesterday)            return { direction: 'same', label: 'Same as yesterday' }
  const diff = Math.abs(today - yesterday)
  if (today > yesterday) return { direction: 'up',   label: `↑ ${diff} from yesterday` }
  return                        { direction: 'down', label: `↓ ${diff} from yesterday` }
}

function coverageTrend(todayMins: number, yesterdayMins: number): StatTrend {
  if (todayMins === 0 && yesterdayMins === 0) return { direction: null,   label: null }
  if (yesterdayMins === 0 && todayMins > 0)   return { direction: 'new',  label: 'New today' }
  if (todayMins === yesterdayMins)            return { direction: 'same', label: 'Same as yesterday' }
  const diffMins = todayMins - yesterdayMins
  const diffH    = (Math.abs(diffMins) / 60).toFixed(1)
  if (diffMins > 0) return { direction: 'up',   label: `↑ ${diffH}h more than yesterday` }
  return                   { direction: 'down', label: `↓ ${diffH}h less than yesterday` }
}

/** Compute total active coverage minutes within a UTC time window. */
function coverageMinsInWindow(
  sessions: Array<{
    status: string
    started_at: string | null
    ended_at:   string | null
    updated_at: string | null
  }>,
  windowStart: string,
  windowEnd:   string,
): number {
  const wsMs = new Date(windowStart).getTime()
  const weMs = new Date(windowEnd).getTime()
  let totalMs = 0

  for (const s of sessions) {
    if (!s.started_at) continue
    const startMs = Math.max(new Date(s.started_at).getTime(), wsMs)
    // If still ACTIVE and no ended_at, clamp to windowEnd or now
    const rawEnd = s.ended_at
      ? new Date(s.ended_at).getTime()
      : (s.status === 'ACTIVE' ? Math.min(Date.now(), weMs) : null)
    if (!rawEnd) continue
    const endMs = Math.min(rawEnd, weMs)
    if (endMs > startMs) totalMs += endMs - startMs
  }

  return Math.round(totalMs / 60_000)
}

// ── GET /api/stats ─────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = getSupabase()
    const today     = sydneyDayBounds(0)
    const yesterday = sydneyDayBounds(1)
    const nowISO    = new Date().toISOString()

    // Run all four queries in parallel
    const [
      todayInbox,
      yesterdayInbox,
      todaySessions,
      yesterdaySessions,
    ] = await Promise.all([
      supabase
        .from('call_inbox')
        .select('urgency, status')
        .eq('clinic_id', DEMO_CLINIC_ID)
        .gte('created_at', today.start)
        .lt('created_at', today.end),

      supabase
        .from('call_inbox')
        .select('urgency, status')
        .eq('clinic_id', DEMO_CLINIC_ID)
        .gte('created_at', yesterday.start)
        .lt('created_at', yesterday.end),

      supabase
        .from('coverage_sessions')
        .select('status, started_at, ended_at, updated_at')
        .eq('clinic_id', DEMO_CLINIC_ID)
        .or(`started_at.gte.${today.start},ended_at.gte.${today.start}`),

      supabase
        .from('coverage_sessions')
        .select('status, started_at, ended_at, updated_at')
        .eq('clinic_id', DEMO_CLINIC_ID)
        .or(`started_at.gte.${yesterday.start},ended_at.gte.${yesterday.start}`)
        .lt('started_at', today.start),
    ])

    const tRows = todayInbox.data     ?? []
    const yRows = yesterdayInbox.data ?? []

    // Card 1 — Calls Covered
    const todayTotal     = tRows.length
    const yesterdayTotal = yRows.length

    // Card 2 — Urgent Flagged
    const todayUrgent     = tRows.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'URGENT').length
    const yesterdayUrgent = yRows.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'URGENT').length

    // Card 3 — Unread Messages
    const todayUnread     = tRows.filter(r => r.status === 'UNREAD').length
    const yesterdayUnread = yRows.filter(r => r.status === 'UNREAD').length

    // Card 4 — Coverage Active (minutes)
    const todayCovMins     = coverageMinsInWindow(todaySessions.data ?? [],     today.start,     nowISO)
    const yesterdayCovMins = coverageMinsInWindow(yesterdaySessions.data ?? [], yesterday.start, yesterday.end)

    return NextResponse.json({
      callsCovered: {
        today:     todayTotal,
        yesterday: yesterdayTotal,
        trend:     countTrend(todayTotal, yesterdayTotal),
      },
      urgentFlagged: {
        today:     todayUrgent,
        yesterday: yesterdayUrgent,
        trend:     countTrend(todayUrgent, yesterdayUrgent),
      },
      unreadMessages: {
        today:     todayUnread,
        yesterday: yesterdayUnread,
        trend:     countTrend(todayUnread, yesterdayUnread),
      },
      coverageActive: {
        todayMins:     todayCovMins,
        yesterdayMins: yesterdayCovMins,
        trend:         coverageTrend(todayCovMins, yesterdayCovMins),
      },
    })
  } catch (err) {
    console.error('[stats] Error:', err)
    return NextResponse.json({
      callsCovered:   { today: 0, yesterday: 0, trend: { direction: null, label: null } },
      urgentFlagged:  { today: 0, yesterday: 0, trend: { direction: null, label: null } },
      unreadMessages: { today: 0, yesterday: 0, trend: { direction: null, label: null } },
      coverageActive: { todayMins: 0, yesterdayMins: 0, trend: { direction: null, label: null } },
    })
  }
}
