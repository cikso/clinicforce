'use client'

import { useState } from 'react'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Toggle from '@/app/components/ui/Toggle'
import { useToast } from '@/app/components/ui/Toast'

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface NotificationsClientProps {
  settings: Record<string, unknown> | null
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors outline-none'

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function NotificationsClient({ settings }: NotificationsClientProps) {
  // Alert channels
  const [emailEnabled, setEmailEnabled] = useState((settings?.email_alerts_enabled as boolean) ?? false)
  const [alertEmail, setAlertEmail] = useState((settings?.alert_email as string) ?? '')
  const [smsEnabled, setSmsEnabled] = useState((settings?.sms_alerts_enabled as boolean) ?? false)
  const [alertPhone, setAlertPhone] = useState((settings?.alert_phone as string) ?? '')
  const [slackWebhook, _setSlackWebhook] = useState((settings?.slack_webhook_url as string) ?? '')

  // Alert types
  const [notifyCritical, setNotifyCritical] = useState((settings?.notify_on_critical as boolean) ?? true)
  const [notifyUrgent, setNotifyUrgent] = useState((settings?.notify_on_urgent as boolean) ?? true)
  const [notifyMissed, setNotifyMissed] = useState((settings?.notify_on_missed_call as boolean) ?? false)

  // Quiet hours
  const [quietEnabled, setQuietEnabled] = useState(!!(settings?.quiet_hours_start))
  const [quietStart, setQuietStart] = useState((settings?.quiet_hours_start as string) ?? '22:00')
  const [quietEnd, setQuietEnd] = useState((settings?.quiet_hours_end as string) ?? '07:00')

  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'notification_settings',
          data: {
            email_alerts_enabled: emailEnabled,
            alert_email: emailEnabled ? alertEmail.trim() : null,
            sms_alerts_enabled: smsEnabled,
            alert_phone: smsEnabled ? alertPhone.trim() : null,
            slack_webhook_url: slackWebhook.trim() || null,
            notify_on_critical: notifyCritical,
            notify_on_urgent: notifyUrgent,
            notify_on_missed_call: notifyMissed,
            quiet_hours_start: quietEnabled ? quietStart : null,
            quiet_hours_end: quietEnabled ? quietEnd : null,
          },
        }),
      })
      if (res.ok) {
        toast({ type: 'success', title: 'Notification preferences saved' })
      } else {
        toast({ type: 'error', title: 'Failed to save' })
      }
    } catch {
      toast({ type: 'error', title: 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 max-w-[680px]">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Alert Channels */}
        <Card header={{ title: 'Alert Channels', subtitle: 'How you want to receive notifications' }}>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Email Alerts</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">Receive alert notifications via email</p>
              </div>
              <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
            </div>
            {emailEnabled && (
              <div className="pl-3">
                <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
                  Alert Email
                </label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className={inputCls}
                  placeholder="alerts@clinic.com.au"
                />
              </div>
            )}

            <div className="border-t border-[var(--border-subtle)]" />

            {/* SMS */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">SMS Alerts</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">Receive urgent alerts via SMS</p>
              </div>
              <Toggle checked={smsEnabled} onChange={setSmsEnabled} />
            </div>
            {smsEnabled && (
              <div className="pl-3">
                <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
                  Alert Phone Number
                </label>
                <input
                  type="tel"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+61 400 000 000"
                />
              </div>
            )}

            <div className="border-t border-[var(--border-subtle)]" />

            {/* Slack */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-lg opacity-60">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">Slack Integration</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)] font-medium">
                    Coming soon
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-tertiary)]">Send alerts to a Slack channel via webhook</p>
              </div>
              <Toggle checked={false} onChange={() => {}} disabled />
            </div>
          </div>
        </Card>

        {/* Alert Types */}
        <Card header={{ title: 'Alert Types', subtitle: 'Choose which events trigger alerts' }}>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Critical / Emergency Calls</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">Alert when a call is triaged as critical or emergency</p>
              </div>
              <Toggle checked={notifyCritical} onChange={setNotifyCritical} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Urgent Calls</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">Alert when a call is flagged as urgent but not critical</p>
              </div>
              <Toggle checked={notifyUrgent} onChange={setNotifyUrgent} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Missed Calls</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">Alert when a call goes unanswered or is abandoned</p>
              </div>
              <Toggle checked={notifyMissed} onChange={setNotifyMissed} />
            </div>
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card header={{ title: 'Quiet Hours', subtitle: 'Suppress non-critical alerts during specified hours' }}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Enable Quiet Hours</p>
                <p className="text-[12px] text-[var(--text-tertiary)]">Only critical alerts will be sent during this period</p>
              </div>
              <Toggle checked={quietEnabled} onChange={setQuietEnabled} />
            </div>

            {quietEnabled && (
              <div className="grid grid-cols-2 gap-3 pl-3">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        <div>
          <Button type="submit" variant="primary" size="md" loading={saving}>
            Save Notification Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
