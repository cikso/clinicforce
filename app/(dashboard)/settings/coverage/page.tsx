import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import StatusDot from '@/app/components/ui/StatusDot'
import EmptyState from '@/app/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

type DayKey = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
type DayHours = { open: boolean; start: string; end: string }

const DAYS: DayKey[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT: Record<DayKey, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

const MODE_COLORS: Record<string, string> = {
  OFF: 'var(--border)',
  DAYTIME: 'var(--brand)',
  AFTER_HOURS: 'var(--info)',
  EMERGENCY_ONLY: 'var(--error)',
  WEEKEND: 'var(--warning)',
  LUNCH: 'var(--success)',
}

const MODE_LABELS: Record<string, string> = {
  OFF: 'Off',
  DAYTIME: 'Overflow',
  AFTER_HOURS: 'After Hours',
  EMERGENCY_ONLY: 'Emergency Only',
  WEEKEND: 'Weekend',
  LUNCH: 'Lunch Cover',
}

function timeToPercent(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return ((h - 6) * 60 + m) / (16 * 60) * 100 // 6am to 10pm range
}

export default async function CoveragePage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')
  if (profile.userRole !== 'platform_owner') redirect('/settings/team')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const [agentRes, clinicRes] = await Promise.all([
    service
      .from('voice_agents')
      .select('id, is_active, mode')
      .eq('clinic_id', profile.clinicId)
      .maybeSingle(),
    service
      .from('clinics')
      .select('business_hours')
      .eq('id', profile.clinicId)
      .single(),
  ])

  const voiceAgent = agentRes.data
  const businessHours = (clinicRes.data?.business_hours ?? null) as Record<DayKey, DayHours> | null
  const currentMode = voiceAgent?.mode ?? 'OFF'

  return (
    <div className="space-y-5 max-w-[680px]">
      {/* Coming Soon Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--brand-light)] border border-[var(--brand)]/20">
        <p className="text-[13px] text-[var(--brand-dark)]">
          Auto-scheduling is coming soon. Manual mode switching from the Overview page always takes priority.
        </p>
      </div>

      {/* Current Status Card */}
      <Card header={{ title: 'Current Status', subtitle: 'Live AI coverage mode' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusDot variant={voiceAgent?.is_active ? 'active' : 'offline'} />
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                {voiceAgent?.is_active ? `Active — ${MODE_LABELS[currentMode] ?? currentMode}` : 'Inactive'}
              </p>
              <p className="text-[12px] text-[var(--text-tertiary)]">
                Change mode from the Command Centre overview
              </p>
            </div>
          </div>
          <a href="/overview" className="text-[13px] font-medium text-[var(--brand)] hover:underline">
            Go to Overview
          </a>
        </div>
      </Card>

      {/* Schedule Card */}
      <Card header={{ title: 'Weekly Schedule', subtitle: 'AI coverage modes by day and time' }}>
        <div className="space-y-2">
          {/* Time axis */}
          <div className="flex items-center ml-[56px] mr-1">
            {['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'].map((t) => (
              <span key={t} className="flex-1 text-[9px] text-[var(--text-tertiary)] font-mono-data">{t}</span>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day) => {
            const dh = businessHours?.[day]
            const isOpen = dh?.open ?? false
            const start = dh?.start ?? '08:00'
            const end = dh?.end ?? '18:00'

            const startPct = isOpen ? timeToPercent(start) : 0
            const endPct = isOpen ? timeToPercent(end) : 0
            const workWidth = isOpen ? endPct - startPct : 0

            return (
              <div key={day} className="flex items-center gap-2">
                <span className="w-[48px] text-[12px] text-[var(--text-secondary)] font-medium text-right shrink-0">
                  {DAY_SHORT[day]}
                </span>
                <div className="flex-1 h-7 rounded-md bg-[var(--bg-secondary)] relative overflow-hidden border border-[var(--border-subtle)]">
                  {/* Before hours — After Hours mode */}
                  {isOpen && startPct > 0 && (
                    <div
                      className="absolute top-0 bottom-0 rounded-l-md"
                      style={{
                        left: 0,
                        width: `${startPct}%`,
                        backgroundColor: MODE_COLORS.AFTER_HOURS,
                        opacity: 0.25,
                      }}
                    />
                  )}
                  {/* Business hours — Overflow mode */}
                  {isOpen && (
                    <div
                      className="absolute top-0 bottom-0"
                      style={{
                        left: `${startPct}%`,
                        width: `${workWidth}%`,
                        backgroundColor: MODE_COLORS.DAYTIME,
                        opacity: 0.3,
                      }}
                    />
                  )}
                  {/* After hours — After Hours mode */}
                  {isOpen && endPct < 100 && (
                    <div
                      className="absolute top-0 bottom-0 rounded-r-md"
                      style={{
                        left: `${endPct}%`,
                        width: `${100 - endPct}%`,
                        backgroundColor: MODE_COLORS.AFTER_HOURS,
                        opacity: 0.25,
                      }}
                    />
                  )}
                  {/* Closed day — full coverage */}
                  {!isOpen && (
                    <div
                      className="absolute inset-0 rounded-md"
                      style={{
                        backgroundColor: MODE_COLORS.WEEKEND,
                        opacity: 0.2,
                      }}
                    />
                  )}
                  {/* Time labels */}
                  {isOpen && (
                    <>
                      <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-medium text-[var(--brand)]" style={{ left: `${startPct + 1}%` }}>
                        {start}
                      </span>
                      <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-medium text-[var(--brand)]" style={{ left: `${endPct - 8}%` }}>
                        {end}
                      </span>
                    </>
                  )}
                  {!isOpen && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--text-tertiary)] font-medium">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-subtle)]">
            {[
              { label: 'Business Hours (Overflow)', color: MODE_COLORS.DAYTIME },
              { label: 'After Hours', color: MODE_COLORS.AFTER_HOURS },
              { label: 'Weekend / Closed', color: MODE_COLORS.WEEKEND },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color, opacity: 0.4 }} />
                <span className="text-[10px] text-[var(--text-tertiary)]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
          Schedule is derived from your business hours. Auto-scheduling will allow you to customise modes per time slot.
        </p>
      </Card>

      {/* Holiday / Special Hours */}
      <Card header={{ title: 'Holidays & Special Hours', subtitle: 'Configure non-standard operating days' }}>
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="4" y="6" width="24" height="22" rx="3" />
              <path d="M4 12h24M10 3v5M22 3v5" />
              <path d="M13 18l3 3 5-6" />
            </svg>
          }
          title="No special hours configured"
          description="Add holidays, public holidays, or special operating hours."
        />
        <div className="mt-3 text-center">
          <Button variant="secondary" size="sm" className="opacity-50 cursor-not-allowed" disabled>
            Add Holiday
          </Button>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">Coming soon</p>
        </div>
      </Card>
    </div>
  )
}
