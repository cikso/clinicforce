'use client'

import { CheckCircle2 } from 'lucide-react'

interface PlanProps {
  name: string
  price: string
  period?: string
  daily?: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  onCTA: () => void
}

function PlanCard({ name, price, period, daily, description, features, cta, highlighted, onCTA }: PlanProps) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        highlighted
          ? 'border-[#17C4BE] bg-white shadow-[0_20px_50px_rgba(23,196,190,0.12)]'
          : 'border-[#dde5ec] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[#17C4BE] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold tracking-[-0.03em] text-[#1A1A1A]">{name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#61717f]">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold tracking-[-0.05em] text-[#1A1A1A]">{price}</span>
        {period && <span className="text-base text-[#61717f]">/{period}</span>}
        {daily && <p className="mt-1 text-sm text-[#61717f]">{daily}</p>}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#17C4BE]" />
            <span className="text-sm leading-relaxed text-[#536171]">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCTA}
        className={`w-full rounded-2xl px-6 py-4 text-sm font-semibold transition ${
          highlighted
            ? 'bg-[#17C4BE] text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] hover:bg-[#13ADA8]'
            : name === 'Enterprise'
              ? 'border border-[#dde5ec] bg-white text-[#1A1A1A] hover:bg-[#f9fbfc]'
              : 'bg-[#17C4BE] text-white hover:bg-[#13ADA8]'
        }`}
      >
        {cta}
      </button>
    </div>
  )
}

export default function PricingSection({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <section id="pricing" className="px-1 py-24 sm:py-28">
      <div className="text-center mb-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#17C4BE]">
          Pricing
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
          Simple, predictable pricing. From $10 a day.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#536171] sm:text-lg">
          No per-call charges. No hidden fees. Cancel anytime.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PlanCard
          name="Starter"
          price="$300"
          period="month"
          daily="~$10/day"
          description="For clinics getting started with AI phone handling"
          features={[
            'AI call answering, 24/7',
            'Captures caller details, reason for call, and pet or patient info',
            'Structured call summaries delivered to your inbox',
            'Urgency triage and emergency escalation',
            'Coverage mode control — switch on, off, or overflow anytime',
            'Action queue for callbacks and follow-ups',
          ]}
          cta="Start Free Trial"
          onCTA={onBookDemo}
        />
        <PlanCard
          name="Growth"
          price="$450"
          period="month"
          daily="~$15/day"
          description="For busy clinics that want the full operational loop"
          features={[
            'Everything in Starter, plus:',
            'Live appointment booking during calls',
            'Pre-visit SMS reminders to callers',
            'Post-call SMS to callers',
            'PIMS integration (ezyVet, Provet Cloud, RxWorks)',
            'Analytics and insights dashboard',
          ]}
          cta="Start Free Trial"
          highlighted
          onCTA={onBookDemo}
        />
        <PlanCard
          name="Enterprise"
          price="Custom"
          description="For multi-location groups and hospital networks"
          features={[
            'Everything in Growth, plus:',
            'Unlimited locations',
            'AI outbound reminder calls',
            'Post-visit surveys and review management',
            'Custom AI voice and greeting',
            'Dedicated account manager and priority support',
          ]}
          cta="Contact Sales"
          onCTA={onBookDemo}
        />
      </div>

      <p className="mt-10 text-center text-sm text-[#8a96a3]">
        All plans include a 14-day free trial. No credit card required. Switch AI coverage on or off anytime from your dashboard.
      </p>
    </section>
  )
}
