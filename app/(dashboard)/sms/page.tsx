import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import StatCard from '@/app/components/ui/StatCard'
import Button from '@/app/components/ui/Button'

/* ── Sample Data ────────────────────────────────────────────────────────────── */

type SmsStatus = 'DELIVERED' | 'PENDING' | 'FAILED' | 'SCHEDULED'

interface SmsMessage {
  id: string
  recipient: string
  phone: string
  message: string
  status: SmsStatus
  type: string
  sentAt: string
}

const MESSAGES: SmsMessage[] = [
  { id: '1', recipient: 'Margaret Thompson', phone: '0412 345 678', message: 'Hi Margaret, this is a reminder that Bella has a vaccination appointment tomorrow at 10:00 AM. Please reply YES to confirm or call us to reschedule.', status: 'DELIVERED', type: 'Reminder', sentAt: '10 min ago' },
  { id: '2', recipient: 'David Kim', phone: '0423 456 789', message: 'Hi David, Max\'s blood test results are ready. Please call the clinic to discuss with Dr. Mitchell. Ph: (02) 9876 5432.', status: 'DELIVERED', type: 'Follow-up', sentAt: '25 min ago' },
  { id: '3', recipient: 'Jenny Liu', phone: '0434 567 890', message: 'Appointment reminder: Mochi is booked for a dental clean on Thursday 11 Apr at 8:30 AM. Please fast from 10 PM the night before.', status: 'SCHEDULED', type: 'Reminder', sentAt: 'Tomorrow 8am' },
  { id: '4', recipient: 'Robert Patel', phone: '0445 678 901', message: 'Hi Robert, we tried calling about Charlie\'s post-op check. Please call us back at (02) 9876 5432 at your earliest convenience.', status: 'DELIVERED', type: 'Callback', sentAt: '1 hour ago' },
  { id: '5', recipient: 'Susan Miller', phone: '0456 789 012', message: 'Thank you for visiting! Luna\'s prescription is ready for pickup. Open Mon-Fri 8am-6pm, Sat 9am-1pm.', status: 'DELIVERED', type: 'Notification', sentAt: '2 hours ago' },
  { id: '6', recipient: 'James Walsh', phone: '0467 890 123', message: 'Hi James, this is a reminder that Buddy is due for his annual vaccination. Book online or call us to schedule.', status: 'PENDING', type: 'Recall', sentAt: '3 hours ago' },
  { id: '7', recipient: 'Amy Chen', phone: '0478 901 234', message: 'Hi Amy, we missed your call today. Sarah AI took a message — please call back to discuss Coco\'s test results.', status: 'FAILED', type: 'Callback', sentAt: '4 hours ago' },
  { id: '8', recipient: 'Tom Nguyen', phone: '0489 012 345', message: 'Reminder: Patch\'s desexing surgery is booked for next Monday 14 Apr at 8:00 AM. No food after 10 PM Sunday.', status: 'SCHEDULED', type: 'Reminder', sentAt: 'Mon 7am' },
]

const STATUS_STYLES: Record<SmsStatus, { variant: 'info' | 'neutral' | 'urgent' | 'routine'; label: string }> = {
  DELIVERED: { variant: 'routine', label: 'Delivered' },
  PENDING: { variant: 'neutral', label: 'Pending' },
  FAILED: { variant: 'urgent', label: 'Failed' },
  SCHEDULED: { variant: 'info', label: 'Scheduled' },
}

const TEMPLATES = [
  { name: 'Appointment Reminder', desc: 'Sent 24h before appointment', uses: 156 },
  { name: 'Callback Request', desc: 'After missed call or AI triage', uses: 89 },
  { name: 'Results Ready', desc: 'Lab or test results notification', uses: 67 },
  { name: 'Vaccination Recall', desc: 'Annual vaccination due notice', uses: 45 },
  { name: 'Post-Op Instructions', desc: 'Surgery aftercare reminders', uses: 34 },
  { name: 'Thank You', desc: 'Sent after visit completion', uses: 28 },
]

/* ── Page ────────────────────────────────────────────────────────────────────── */

export default function SmsPage() {
  return (
    <div className="space-y-5">
      {/* Coming Soon Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--brand-light)] border border-[var(--brand)]/20">
        <p className="text-[13px] text-[var(--brand-dark)]">
          Automated SMS messaging is coming soon. Currently showing a preview of the SMS Hub.
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">SMS Hub</h2>
          <Badge variant="info">Preview</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="opacity-50 cursor-not-allowed" disabled>
            Export Log
          </Button>
          <Button variant="primary" size="sm" className="opacity-50 cursor-not-allowed" disabled>
            New Message
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Messages Sent" value={284} unit="this month" delta={{ value: '18% from last month', direction: 'up' }} />
        <StatCard label="Delivery Rate" value="96.2%" unit="" delta={{ value: '0.5% from last month', direction: 'up' }} />
        <StatCard label="Response Rate" value="42%" unit="" delta={{ value: '3% from last month', direction: 'up' }} />
        <StatCard label="Cost This Month" value="$28.40" unit="" delta={{ value: '$3.20 from last month', direction: 'down' }} />
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Message Log Table */}
        <Card className="flex-1 overflow-hidden" header={{ title: 'Message Log', subtitle: 'Recent SMS activity' }}>
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium px-5 py-2.5">Recipient</th>
                  <th className="text-left text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium px-3 py-2.5">Type</th>
                  <th className="text-left text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium px-3 py-2.5">Message</th>
                  <th className="text-left text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium px-3 py-2.5">Status</th>
                  <th className="text-right text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium px-5 py-2.5">Sent</th>
                </tr>
              </thead>
              <tbody>
                {MESSAGES.map((msg) => {
                  const statusStyle = STATUS_STYLES[msg.status]
                  return (
                    <tr key={msg.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">{msg.recipient}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)] font-mono-data">{msg.phone}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[11px] font-medium text-[var(--text-secondary)]">
                          {msg.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 max-w-[280px]">
                        <p className="text-[12px] text-[var(--text-secondary)] truncate">{msg.message}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-[11px] text-[var(--text-tertiary)] whitespace-nowrap">{msg.sentAt}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sidebar - Templates */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-4">
          <Card header={{ title: 'SMS Templates' }}>
            <div className="space-y-2.5">
              {TEMPLATES.map((t) => (
                <div key={t.name} className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-0.5">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{t.name}</p>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono-data shrink-0 ml-2">{t.uses}x</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="ghost" size="sm" className="w-full opacity-50 cursor-not-allowed" disabled>
                Create Template
              </Button>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card header={{ title: 'Delivery Breakdown' }}>
            <div className="space-y-2.5">
              {[
                { label: 'Delivered', count: 273, pct: 96, color: 'var(--success)' },
                { label: 'Pending', count: 6, pct: 2, color: 'var(--warning)' },
                { label: 'Failed', count: 5, pct: 2, color: 'var(--error)' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono-data text-[var(--text-tertiary)]">{s.count}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">({s.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Integration Note */}
          <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--brand-light)] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--brand)" strokeWidth="1.3" strokeLinecap="round">
                  <path d="M7 1.5v11M3.5 5L7 1.5 10.5 5" />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[var(--text-primary)]">Sarah AI Integration</p>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed mt-0.5">
                  Sarah will automatically send appointment reminders, callback requests, and follow-up messages based on call outcomes.
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2">Coming in next update</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
