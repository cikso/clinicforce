import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'

export const dynamic = 'force-dynamic'

interface Subscription {
  id: string
  plan: string
  status: string
  monthly_price_aud: number | null
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
}

const PLAN_NAMES: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
}

const STATUS_BADGES: Record<string, { variant: 'routine' | 'info' | 'urgent' | 'neutral'; label: string }> = {
  trialing: { variant: 'info', label: 'Trial' },
  active: { variant: 'routine', label: 'Active' },
  past_due: { variant: 'urgent', label: 'Past Due' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string | null): number {
  if (!iso) return 0
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000))
}

const PLANS = [
  {
    name: 'Starter',
    key: 'starter',
    price: '$199',
    period: '/mo',
    features: ['AI call answering', 'Call inbox & transcripts', 'Action queue', '200 calls/month', 'Email support'],
  },
  {
    name: 'Growth',
    key: 'growth',
    price: '$349',
    period: '/mo',
    popular: true,
    features: ['Everything in Starter', 'SMS reminders', 'Auto-booking', 'Analytics dashboard', '500 calls/month', 'Priority support'],
  },
  {
    name: 'Enterprise',
    key: 'enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Growth', 'PIMS integration', 'Multi-location', 'Custom AI training', 'Unlimited calls', 'Dedicated account manager'],
  },
]

export default async function BillingPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')
  // Billing belongs to the clinic. platform_owner is the SaaS operator (us) and
  // should never see a clinic's subscription page — send them to the admin home.
  if (profile.userRole === 'platform_owner') redirect('/admin')
  // Only clinic_owner / clinic_admin administer billing. Other roles get team.
  if (!['clinic_owner', 'clinic_admin'].includes(profile.userRole)) redirect('/settings/team')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  let subscription: Subscription | null = null
  try {
    const { data } = await service
      .from('subscriptions')
      .select('id, plan, status, monthly_price_aud, trial_ends_at, current_period_start, current_period_end')
      .eq('clinic_id', profile.clinicId)
      .maybeSingle()
    subscription = data as Subscription | null
  } catch {
    // Table might not have all columns
  }

  const currentPlan = subscription?.plan ?? 'trial'
  const statusBadge = STATUS_BADGES[subscription?.status ?? 'trialing'] ?? STATUS_BADGES.trialing
  const trialDays = daysUntil(subscription?.trial_ends_at ?? null)
  const isTrialing = subscription?.status === 'trialing' || currentPlan === 'trial'

  // Estimated usage (sample for visual purposes)
  const callLimit = currentPlan === 'growth' ? 500 : currentPlan === 'enterprise' ? 9999 : 200
  const callsUsed = 47 // sample

  return (
    <div className="space-y-5 max-w-[680px]">
      {/* Current Plan Card */}
      <Card header={{ title: 'Current Plan', subtitle: 'Your subscription details' }}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] font-bold text-[var(--text-primary)] font-heading">
                  {PLAN_NAMES[currentPlan] ?? 'Trial'}
                </h3>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              {subscription?.monthly_price_aud != null && (
                <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
                  ${subscription.monthly_price_aud}/month AUD
                </p>
              )}
            </div>
          </div>

          {isTrialing && subscription?.trial_ends_at && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--warning)" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5V7.5M7 9.5v.01" />
              </svg>
              <p className="text-[13px] text-[var(--warning)]">
                Trial ends {formatDate(subscription.trial_ends_at)} ({trialDays} day{trialDays === 1 ? '' : 's'} remaining)
              </p>
            </div>
          )}

          {subscription?.current_period_start && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold mb-1">Period Start</p>
                <p className="text-[13px] text-[var(--text-primary)] font-mono-data">{formatDate(subscription.current_period_start)}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold mb-1">Period End</p>
                <p className="text-[13px] text-[var(--text-primary)] font-mono-data">{formatDate(subscription.current_period_end ?? null)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Plan Comparison */}
      <Card header={{ title: 'Plans', subtitle: 'Choose the right plan for your clinic' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlan
            return (
              <div
                key={plan.key}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  isCurrent
                    ? 'border-[var(--brand)] bg-[var(--brand-light)]/30'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border)]'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand)] text-white font-semibold mb-2">
                    Most Popular
                  </span>
                )}
                <h4 className="text-[15px] font-bold text-[var(--text-primary)] font-heading">{plan.name}</h4>
                <div className="flex items-baseline gap-0.5 mt-1 mb-3">
                  <span className="text-[22px] font-bold text-[var(--text-primary)]">{plan.price}</span>
                  <span className="text-[13px] text-[var(--text-tertiary)]">{plan.period}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[12px] text-[var(--text-secondary)]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5">
                        <path d="M2.5 6.5L5 9l4.5-6" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="text-center text-[12px] font-semibold text-[var(--brand)] py-2">
                    Current Plan
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Contact to Upgrade
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Usage Card */}
      <Card header={{ title: 'Usage This Month', subtitle: 'Call volume and limits' }}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--text-secondary)]">Calls used</span>
            <span className="text-[13px] font-semibold text-[var(--text-primary)] font-mono-data">
              {callsUsed} / {callLimit === 9999 ? 'Unlimited' : callLimit}
            </span>
          </div>
          {callLimit !== 9999 && (
            <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all"
                style={{ width: `${Math.min(100, (callsUsed / callLimit) * 100)}%` }}
              />
            </div>
          )}
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Billing portal coming soon. Contact support@clinicforce.io for billing enquiries.
          </p>
        </div>
      </Card>
    </div>
  )
}
