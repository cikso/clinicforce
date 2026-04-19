import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import EmptyState from '@/app/components/ui/EmptyState'

export const metadata: Metadata = { title: 'SMS Hub — ClinicForce' }

export default function SmsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">SMS Hub</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Automated reminders, callbacks, and post-visit surveys — sent from your clinic&apos;s number.
        </p>
      </div>

      <Card>
        <EmptyState
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-5 4V6a1 1 0 0 1 1-1z" />
            </svg>
          }
          title="SMS Hub is coming next"
          description="Appointment reminders, callback confirmations and NPS surveys, all logged and audited per clinic. Compliant with AU opt-out rules from day one."
        />
      </Card>

      <Card header={{ title: "What's shipping here" }}>
        <ul className="space-y-2.5 text-[13px] text-[var(--text-secondary)] list-disc pl-5">
          <li>Appointment reminders at T-24h and T-2h, templated per clinic.</li>
          <li>Callback-requested SMS straight from a Stella call — zero staff input.</li>
          <li>Post-visit NPS surveys with inbound reply capture.</li>
          <li>Opt-out handling (STOP) and per-message audit log for ACMA compliance.</li>
        </ul>
      </Card>
    </div>
  )
}
