'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import DemoModal from './DemoModal'
import ComparisonSection from './ComparisonSection'
import IntegrationLogos from './IntegrationLogos'
import PricingSection from './PricingSection'
import ROICalculator from './ROICalculator'
import FAQSection from './FAQSection'
import HeroSection from '@/components/marketing/HeroSection'
import {
  ArrowRight,
  BellRing,
  BookOpenText,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Headphones,
  Hospital,
  MessageSquareMore,
  MoonStar,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  ToggleLeft,
  Waves,
} from 'lucide-react'

const painPoints = [
  ['Missed calls during peak hours', 'Calls come in while reception is checking in patients, handling payments, or speaking with clinicians. Demand does not stop just because the front desk is full.', PhoneCall],
  ['Lunch breaks and short staffing', 'Coverage gaps happen every day. Even a short stretch away from the phone can mean lost bookings, unreturned calls, and frustrated pet owners.', Clock3],
  ['After-hours uncertainty', 'Owners still call after the clinic closes. Some need simple direction. Others need urgent escalation and cannot be left to voicemail.', MoonStar],
  ['Urgent cases need proper triage', 'Inbound calls are not all equal. A limping dog and a possible GDV should not land in the same queue with the same response path.', Stethoscope],
  ['Reception teams work in constant interruption', 'Phones break focus all day. Teams lose time switching between live callers, clinic traffic, follow-up tasks, and clinical handoff.', Headphones],
  ['The AI or nothing trap', 'Most tools require full commitment — all calls, all the time. Clinics need the flexibility to run their own desk when they want to, and hand off to AI when they don\'t.', ShieldCheck],
] as const

const workflowSteps = [
  ['01', 'Answers the call immediately', 'ClinicForce picks up overflow, after-hours, and short-staffed call volume without sending owners into a dead end.'],
  ['02', 'Captures the reason and relevant details', 'Owner name, pet details, symptoms, booking intent, and clinic-specific questions are handled in a calm, consistent flow.'],
  ['03', 'Flags urgency or escalates when needed', 'Routine enquiries stay routine. Higher-risk calls are surfaced quickly with context attached for the clinic team.'],
  ['04', 'Logs the outcome into the workflow', 'The clinic receives a clear note, next action, and operational status instead of a vague voicemail or missing context.'],
] as const

const featureCards = [
  ['Overflow and lunch coverage', 'Keep the front desk responsive during peak periods, consult blocks, and handover windows.', Waves],
  ['After-hours call handling', 'Give owners a professional first response when the clinic is closed without making after-hours calls disappear.', MoonStar],
  ['Urgent triage support', 'Surface higher-priority calls with a clearer escalation path and more structured context.', BellRing],
  ['Booking capture', 'Capture appointments that would otherwise go to voicemail, drop off, or call another clinic.', CalendarCheck2],
  ['Call summaries', 'Every interaction ends with a concise, readable handoff note your team can act on quickly.', ClipboardList],
  ['Receptionist control toggle', 'Switch ClinicForce on or off directly from your dashboard — or set it to overflow mode so it only picks up when your team is busy. Full calls, overflow only, after-hours only, or completely off. The clinic stays in control at every step.', ToggleLeft],
  ['Action queue for follow-up', 'Organise callbacks, same-day concerns, and unresolved items in one operational queue.', MessageSquareMore],
  ['Clinic-specific knowledge base', 'Responses reflect your hours, services, policies, and front-desk workflow rather than a generic script.', BookOpenText],
] as const

const trustReasons = [
  ['Fewer missed opportunities', 'More calls are answered, more bookings are captured, and fewer owners fall through the cracks.'],
  ['Better response consistency', 'Inbound calls are handled with the same structure every time, even when the clinic is busy.'],
  ['Less pressure on reception', 'Teams spend less time being interrupted and more time helping the people already in the clinic.'],
  ['More operational control', 'The clinic decides how coverage works — full call handling, overflow, after-hours, or off entirely. Flip the toggle in your dashboard whenever the situation changes. No vendor calls. No downtime.'],
] as const

const trustItems = [
  'Built for veterinary clinics',
  'Designed for real front-desk operations',
  'Operational controls built in',
  'Reliability and escalation-first workflow',
]

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00BFA5]">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">{title}</h2>
      {body ? <p className="mt-5 max-w-2xl text-base leading-7 text-[#536171] sm:text-lg">{body}</p> : null}
    </div>
  )
}

function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string
  body: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <article className="rounded-3xl border border-[#d9e2ea] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-5 inline-flex rounded-2xl bg-[#E0F7F3] p-3 text-[#00BFA5]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#5f6f7e]">{body}</p>
    </article>
  )
}

export function ClinicForceLanding() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <HeroSection onBookDemo={() => setDemoOpen(true)} />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-8 lg:px-12">

        <section id="problem" className="px-1 py-24 sm:py-28">
          <SectionHeading
            eyebrow="The problem"
            title="Most clinics do not have a phone problem. They have a capacity problem."
            body="Calls arrive in the middle of consults, checkout, lunch breaks, and short-staffed shifts. The result is missed demand, inconsistent handling, and more pressure on the same front-desk team."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {painPoints.map(([title, body, Icon]) => (
              <article key={title} className="rounded-3xl border border-[#dde5ec] bg-white p-6 shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
                <div className="mb-5 inline-flex rounded-2xl bg-[#f3f7fb] p-3 text-[#1A1A1A]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#61717f]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="rounded-[36px] border border-[#d9e2ea] bg-white px-6 py-16 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="How it works"
            title="A clear call workflow your team can understand in seconds."
            body="ClinicForce is designed to fit clinic operations, not interrupt them. The job is simple: answer quickly, gather what matters, escalate where needed, and leave the clinic with something useful."
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {workflowSteps.map(([step, title, body]) => (
              <article key={step} className="rounded-3xl border border-[#dde5ec] bg-[#f8fafb] p-6">
                <div className="mb-5 text-sm font-semibold tracking-[0.22em] text-[#00BFA5]">{step}</div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6f7e]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <ComparisonSection />

        <section id="features" className="px-1 py-24 sm:py-28">
          <SectionHeading
            eyebrow="Features"
            title="Operational features built for how veterinary clinics actually handle inbound calls."
            body="The product is not a generic AI wrapper with a pet theme. Each capability is designed to support a working clinic: front desk coverage, urgent-call handling, booking capture, and follow-up control."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map(([title, body, icon]) => (
              <FeatureCard key={title} title={title} body={body} icon={icon} />
            ))}
          </div>

          <IntegrationLogos />
        </section>

        <PricingSection onBookDemo={() => setDemoOpen(true)} />

        <ROICalculator />

        <FAQSection />

        <section className="grid gap-10 rounded-[36px] border border-[#E5E7EB] bg-[#1A1A1A] px-6 py-16 text-white shadow-[0_22px_55px_rgba(0,0,0,0.12)] sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#80DFCC]">Why clinics choose ClinicForce</p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Premium software is not just about answering calls. It is about making the clinic run more cleanly.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c6d3df] sm:text-lg">
              Clinics choose ClinicForce because it reduces call leakage, creates more consistent handling, and gives reception teams room to work without losing control of inbound demand.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustReasons.map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-[#333333] bg-[#262626] p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-[#2D2D2D] p-3 text-[#80DFCC]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#c8d4df]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="product-ui" className="px-1 py-24 sm:py-28">
          <SectionHeading
            eyebrow="Product UI"
            title="A dashboard designed for clarity, not noise."
            body="The interface gives clinics a live view of call handling, action queues, coverage controls, and conversation history — all in a clean, light-themed workspace."
          />

          <div className="mt-12 overflow-hidden rounded-[36px] border border-[#dbe4eb] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
            <div className="grid xl:grid-cols-[260px_minmax(0,1fr)]">
              {/* Sidebar */}
              <aside className="border-b border-[#E5E7EB] bg-white p-5 xl:border-b-0 xl:border-r">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00BFA5]">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" fill="white" opacity="0.9" />
                      <path d="M10 10V2L3 6l7 4z" fill="white" opacity="0.6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#111827]">ClinicForce</p>
                    <p className="text-[12px] text-[#6B7280]">Northside Vet</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {([
                    ['Overview', true],
                    ['Conversations', false],
                    ['Action Queue', false],
                    ['Bookings', false],
                    ['Insights', false],
                    ['Settings', false],
                  ] as [string, boolean][]).map(([label, active]) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                        active
                          ? 'bg-[#E0F7F3] text-[#00BFA5]'
                          : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Coverage widget */}
                <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#6B7280] mb-3">Coverage</p>
                  <div className="flex gap-1.5">
                    {['All Calls', 'Overflow', 'Off'].map((mode, i) => (
                      <span
                        key={mode}
                        className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                          i === 0
                            ? 'bg-[#00BFA5] text-white'
                            : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
                        }`}
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="p-6 sm:p-8 bg-[#F9FAFB]">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-4">
                    {/* Stat cards */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ['24', 'Calls Today', '+12%'],
                        ['18', 'Bookings Captured', '+8%'],
                        ['3', 'Urgent Triaged', '—'],
                      ].map(([value, label, delta]) => (
                        <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#6B7280] mb-1">{label}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[28px] font-bold text-[#111827] leading-none">{value}</span>
                            {delta !== '—' && (
                              <span className="text-[12px] font-medium text-[#059669]">{delta}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Activity feed */}
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[14px] font-semibold text-[#111827]">Recent Activity</p>
                        <span className="flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                          Live
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          ['Urgent call escalated', 'Possible GDV — routed to on-call vet', '2m ago', '#DC2626'],
                          ['Booking captured', 'Vaccination appointment confirmed for Thursday', '11m ago', '#00BFA5'],
                          ['Enquiry resolved', 'Desexing prep info sent to pet owner', '18m ago', '#059669'],
                        ].map(([title, detail, time, color]) => (
                          <div key={title} className="flex gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[13px] font-semibold text-[#111827]">{title}</p>
                                <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{time}</span>
                              </div>
                              <p className="mt-0.5 text-[12px] text-[#6B7280]">{detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    {/* AI Agent status */}
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[14px] font-semibold text-[#111827]">Sarah AI</p>
                        <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#059669]">Active</span>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          ['Mode', 'All Calls'],
                          ['Calls handled', '21 today'],
                          ['Avg. duration', '1m 24s'],
                          ['Triage accuracy', '98%'],
                        ].map(([label, val]) => (
                          <div key={label} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2.5">
                            <span className="text-[12px] text-[#6B7280]">{label}</span>
                            <span className="text-[12px] font-semibold text-[#111827]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conversation preview */}
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                      <p className="text-[14px] font-semibold text-[#111827] mb-3">Latest Conversation</p>
                      <div className="space-y-2.5">
                        <div className="rounded-lg bg-[#E0F7F3] px-3 py-2.5">
                          <p className="text-[12px] text-[#00BFA5]">&quot;Hi, I&apos;m calling about my dog Max — he&apos;s been limping since this morning...&quot;</p>
                        </div>
                        <div className="rounded-lg bg-[#F9FAFB] px-3 py-2.5">
                          <p className="text-[12px] text-[#374151]">&quot;I understand your concern about Max. Let me get some details to help the vet team...&quot;</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E]">Urgent</span>
                        <span className="rounded-md bg-[#E0F7F3] px-2 py-0.5 text-[10px] font-semibold text-[#00BFA5]">Callback</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-[#dbe4eb] bg-white px-6 py-16 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="Trust"
            title="Built to feel credible, controlled, and operationally safe."
            body="Buyers need more than a feature list. They need to know the product was built for veterinary clinics, that call handling is reliable, and that teams stay in control."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {trustItems.map((item) => (
              <div key={item} className="rounded-full border border-[#dbe4eb] bg-[#f8fafb] px-4 py-2 text-sm font-medium text-[#586675]">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#dde5ec] bg-[#f8fafb] p-5">
              <ShieldCheck className="h-5 w-5 text-[#1A1A1A]" />
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">Reliability first</h3>
              <p className="mt-2 text-sm leading-6 text-[#62707f]">Clear escalation paths, structured outputs, and operational controls make the system easier to trust in a live clinic environment.</p>
            </div>
            <div className="rounded-3xl border border-[#dde5ec] bg-[#f8fafb] p-5">
              <Hospital className="h-5 w-5 text-[#1A1A1A]" />
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">Vertical-specific from day one</h3>
              <p className="mt-2 text-sm leading-6 text-[#62707f]">Messaging, workflows, and handoff structure are designed around veterinary clinics rather than retrofitted from another industry.</p>
            </div>
          </div>
        </section>

        <section className="px-1 py-24 sm:py-28">
          <div className="rounded-[36px] border border-[#E5E7EB] bg-[#E0F7F3] px-6 py-14 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00BFA5]">Final step</p>
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[#1A1A1A] sm:text-5xl">
                See how ClinicForce fits into your clinic before another week of missed calls.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#556475]">
                Book a walkthrough to see how coverage, escalation, bookings, and handoff can work for your clinic. At $15 a day, it&apos;s less than a part-time hire — and it&apos;s on when you need it and off when you don&apos;t.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center justify-center rounded-2xl bg-[#00BFA5] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(27,107,74,0.2)] transition hover:bg-[#00A98E]">
                Book a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <a href="#product-ui" className="inline-flex items-center justify-center rounded-2xl border border-[#cdd9e1] bg-white px-6 py-4 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#f9fbfc]">
                Review the Product
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
