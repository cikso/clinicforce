'use client'

import { CheckCircle2 } from 'lucide-react'

interface PlanProps {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  onCTA: () => void
}

function PlanCard({ name, price, period, description, features, cta, highlighted, onCTA }: PlanProps) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        highlighted
          ? 'border-[#1B6B4A] bg-white shadow-[0_20px_50px_rgba(27,107,74,0.12)]'
          : 'border-[#dde5ec] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[#1B6B4A] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
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
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1B6B4A]" />
            <span className="text-sm leading-relaxed text-[#536171]">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCTA}
        className={`w-full rounded-2xl px-6 py-4 text-sm font-semibold transition ${
          highlighted
            ? 'bg-[#1B6B4A] text-white shadow-[0_12px_24px_rgba(27,107,74,0.2)] hover:bg-[#155C3E]'
            : name === 'Enterprise'
              ? 'border border-[#dde5ec] bg-white text-[#1A1A1A] hover:bg-[#f9fbfc]'
              : 'bg-[#1B6B4A] text-white hover:bg-[#155C3E]'
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
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#1B6B4A]">
          Pricing
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
          Simple, predictable pricing for every clinic size
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#536171] sm:text-lg">
          No per-call charges. No hidden fees. Pick the plan that matches your clinic.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PlanCard
          name="Starter"
          price="$199"
          period="month"
          description="For clinics getting started with AI phone handling"
          features={[
            'AI call answering (up to 200 calls/month)',
            'Call inbox with AI summaries',
            'Action queue & follow-up tracking',
            'Coverage mode control (overflow, after-hours)',
            'Emergency triage & escalation',
            '1 clinic location',
          ]}
          cta="Start Free Trial"
          onCTA={onBookDemo}
        />
        <PlanCard
          name="Growth"
          price="$349"
          period="month"
          description="For busy clinics that want the full operational loop"
          features={[
            'Everything in Starter, plus:',
            'Up to 500 calls/month',
            'Post-call SMS to callers',
            'Automated appointment reminders (SMS)',
            'Auto-booking during calls',
            'Analytics & insights dashboard',
            'Up to 3 clinic locations',
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
            'Unlimited calls',
            'PIMS integration (Ezyvet, Provet, Cornerstone)',
            'AI outbound reminder calls',
            'Post-visit surveys & review management',
            'Custom AI voice & greeting',
            'Unlimited locations',
            'Priority support & dedicated account manager',
          ]}
          cta="Contact Sales"
          onCTA={onBookDemo}
        />
      </div>

      <p className="mt-10 text-center text-sm text-[#8a96a3]">
        All plans include a 14-day free trial. No credit card required. Cancel anytime.
      </p>
    </section>
  )
}
