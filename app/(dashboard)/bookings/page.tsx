import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import StatCard from '@/app/components/ui/StatCard'
import Button from '@/app/components/ui/Button'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8 AM - 6 PM

type ApptStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED'

interface Appointment {
  name: string
  reason: string
  day: number // 0=Mon
  hour: number
  minute: number
  duration: number // minutes
  status: ApptStatus
}

const APPOINTMENTS: Appointment[] = [
  { name: 'Mrs Chen', reason: 'Vaccination', day: 0, hour: 9, minute: 0, duration: 30, status: 'CONFIRMED' },
  { name: 'James R.', reason: 'Dental check', day: 0, hour: 10, minute: 30, duration: 45, status: 'PENDING' },
  { name: 'Lisa Park', reason: 'Desexing consult', day: 1, hour: 14, minute: 0, duration: 30, status: 'CONFIRMED' },
  { name: 'Tom Nguyen', reason: 'Post-op review', day: 2, hour: 11, minute: 0, duration: 20, status: 'CONFIRMED' },
  { name: 'Amy Walsh', reason: 'New patient', day: 3, hour: 9, minute: 30, duration: 45, status: 'PENDING' },
  { name: 'Maria Costa', reason: 'Microchip', day: 3, hour: 15, minute: 0, duration: 15, status: 'CANCELLED' },
  { name: 'Dr Lee referral', reason: 'Ortho consult', day: 4, hour: 10, minute: 0, duration: 60, status: 'CONFIRMED' },
  { name: 'Sarah Williams', reason: 'Annual wellness', day: 4, hour: 14, minute: 30, duration: 30, status: 'CONFIRMED' },
]

const STATUS_STYLES: Record<ApptStatus, { border: string; dot: string; text: string }> = {
  CONFIRMED: { border: 'border-l-[var(--success)]', dot: 'bg-[var(--success)]', text: '' },
  PENDING: { border: 'border-l-[var(--warning)]', dot: 'bg-[var(--warning)]', text: '' },
  CANCELLED: { border: 'border-l-[var(--error)]', dot: 'bg-[var(--error)]', text: 'line-through opacity-50' },
}

const REMINDERS = [
  { icon: 'clock', label: 'SMS reminder: Mrs Chen', time: 'in 24h' },
  { icon: 'phone', label: 'AI call reminder: James R.', time: 'in 48h' },
  { icon: 'clock', label: 'SMS reminder: Lisa Park', time: 'in 2h' },
]

function formatHour(h: number): string {
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

export const metadata: Metadata = { title: 'Bookings — ClinicForce' }

export default function BookingsPage() {
  return (
    <div className="space-y-5">
      {/* Coming Soon Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--brand-light)] border border-[var(--brand)]/20">
        <p className="text-[13px] text-[var(--brand-dark)]">
          Auto-booking and SMS reminders are coming soon. Currently showing a preview.
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Bookings</h2>
          <span className="text-[13px] text-[var(--text-secondary)]">This week</span>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
          {['Day', 'Week', 'Month'].map((v) => (
            <button
              key={v}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                v === 'Week'
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Today's Appointments" value={4} unit="" delta={{ value: '2 confirmed, 1 pending, 1 cancelled', direction: 'neutral' }} />
        <StatCard label="This Week" value={23} unit="" delta={{ value: '3 from last week', direction: 'up' }} />
        <StatCard label="No-Show Rate" value="8%" unit="" delta={{ value: '2% from last month', direction: 'down' }} />
      </div>

      {/* Main content: Calendar + Sidebar */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Calendar Grid */}
        <Card className="flex-1 overflow-hidden">
          <div className="overflow-x-auto -m-5">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[var(--border)]">
                <div className="p-2" />
                {DAYS.map((d) => (
                  <div key={d} className="p-2 text-center text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium border-l border-[var(--border-subtle)]">
                    {d}
                  </div>
                ))}
              </div>
              {/* Time rows */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[48px] border-b border-[var(--border-subtle)]">
                  <div className="p-1.5 text-[11px] text-[var(--text-tertiary)] font-mono-data text-right pr-2 pt-1">
                    {formatHour(hour)}
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const appts = APPOINTMENTS.filter(
                      (a) => a.day === dayIdx && a.hour === hour
                    )
                    return (
                      <div key={dayIdx} className="border-l border-[var(--border-subtle)] p-0.5 relative">
                        {appts.map((a, i) => {
                          const style = STATUS_STYLES[a.status]
                          return (
                            <div
                              key={i}
                              className={`rounded px-1.5 py-1 border-l-[3px] bg-[var(--bg-secondary)] mb-0.5 cursor-pointer hover:shadow-sm transition-shadow ${style.border}`}
                              title="Booking management coming soon"
                            >
                              <p className={`text-[11px] font-medium text-[var(--text-primary)] truncate ${style.text}`}>
                                {a.name}
                              </p>
                              <p className={`text-[10px] text-[var(--text-tertiary)] truncate ${style.text}`}>
                                {a.reason} · {a.duration}min
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-4">
          <Card header={{ title: 'Upcoming Reminders' }}>
            <div className="space-y-3">
              {REMINDERS.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                    {r.icon === 'clock' ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.3" strokeLinecap="round"><circle cx="7" cy="7" r="5.5" /><path d="M7 4v3l2 1.5" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.3" strokeLinecap="round"><path d="M12.5 10c-.9 0-1.8-.15-2.6-.45a.6.6 0 0 0-.6.15l-1.2 1.5A9 9 0 0 1 3.8 6.8l1.2-1.2a.6.6 0 0 0 .15-.6A7 7 0 0 1 4.7 2.4a.6.6 0 0 0-.6-.6H2a.6.6 0 0 0-.6.6A10 10 0 0 0 11.4 12.4a.6.6 0 0 0 .6-.6v-1.2a.6.6 0 0 0-.5-.6z" /></svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-[var(--text-primary)] font-medium truncate">{r.label}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{r.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-3">Coming soon</p>
          </Card>

          <Button variant="secondary" size="md" className="w-full opacity-50 cursor-not-allowed" disabled>
            Quick Book
          </Button>
          <p className="text-[11px] text-[var(--text-tertiary)] text-center -mt-2">Auto-booking coming in next update</p>
        </div>
      </div>
    </div>
  )
}
