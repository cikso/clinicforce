'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import DemoModal from './DemoModal'
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
  ['Receptionist control toggle', 'Let the clinic decide when ClinicForce takes overflow, after-hours, or wider call coverage.', ToggleLeft],
  ['Action queue for follow-up', 'Organise callbacks, same-day concerns, and unresolved items in one operational queue.', MessageSquareMore],
  ['Clinic-specific knowledge base', 'Responses reflect your hours, services, policies, and front-desk workflow rather than a generic script.', BookOpenText],
] as const

const trustReasons = [
  ['Fewer missed opportunities', 'More calls are answered, more bookings are captured, and fewer owners fall through the cracks.'],
  ['Better response consistency', 'Inbound calls are handled with the same structure every time, even when the clinic is busy.'],
  ['Less pressure on reception', 'Teams spend less time being interrupted and more time helping the people already in the clinic.'],
  ['More operational control', 'The clinic decides how coverage, escalation, and follow-up should work instead of adapting to a generic answering service.'],
] as const

const trustItems = [
  'Built for veterinary clinics',
  'Designed for real front-desk operations',
  'Operational controls built in',
  'Reliability and escalation-first workflow',
]

const testimonials = [
  ['ClinicForce made our lunch hour feel manageable again. We stopped treating voicemail as our overflow plan and started seeing a cleaner queue every afternoon.', 'Sarah Redmond', 'Practice Manager', 'Sydney Metro Mixed Practice'],
  ['What stood out was the structure. Calls were not just answered. They were routed properly, summarised properly, and easy for the team to act on.', 'Dr James Harlow', 'Clinic Director', 'Companion Animal Clinic Group'],
] as const

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
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#0d7b72]">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#0d1b2a] sm:text-4xl">{title}</h2>
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
      <div className="mb-5 inline-flex rounded-2xl bg-[#eef8f7] p-3 text-[#0d7b72]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#0d1b2a]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#5f6f7e]">{body}</p>
    </article>
  )
}

export function ClinicForceLanding() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#0d1b2a]">
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 sm:px-8 lg:px-12">
        <header className="sticky top-0 z-30 mb-8 rounded-[28px] border border-[#dbe4eb]/80 bg-white/88 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10243a] text-sm font-semibold tracking-[0.16em] text-white">CF</div>
              <div>
                <div className="text-base font-semibold tracking-[-0.03em] text-[#0d1b2a]">ClinicForce</div>
                <div className="text-sm text-[#6a7785]">AI phone and front-desk assistant for veterinary clinics</div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#62707f]">
              <a href="#problem" className="transition hover:text-[#10243a]">Problem</a>
              <a href="#how-it-works" className="transition hover:text-[#10243a]">How it works</a>
              <a href="#features" className="transition hover:text-[#10243a]">Features</a>
              <a href="#product-ui" className="transition hover:text-[#10243a]">Product</a>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/login`} className="transition hover:text-[#10243a]">Log in</a>
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center rounded-2xl bg-[#10243a] px-5 py-3 text-white shadow-[0_12px_24px_rgba(16,36,58,0.12)] transition hover:bg-[#0d1b2a]">
                Book a Demo
              </button>
            </nav>
          </div>
        </header>

        <section className="grid gap-14 rounded-[40px] border border-[#dde5ec] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:px-12 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce7e5] bg-[#f4faf9] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0d7b72]">
              <Hospital className="h-3.5 w-3.5" />
              Built for busy veterinary clinics
            </div>

            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.06em] text-[#0d1b2a] sm:text-6xl lg:text-[4.4rem]">
              Keep every clinic call moving, even when the front desk is full.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#586778]">
              ClinicForce helps veterinary clinics answer calls, cover overflow, support after-hours,
              capture bookings, and route urgent enquiries without putting more pressure on the
              reception team.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center justify-center rounded-2xl bg-[#0d7b72] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(13,123,114,0.16)] transition hover:bg-[#0b6a62]">
                Book a Demo
              </button>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-2xl border border-[#d8e0e8] bg-white px-6 py-4 text-sm font-semibold text-[#10243a] transition hover:border-[#c7d4df] hover:bg-[#f9fbfc]">
                See How It Works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#637282]">
              <span className="rounded-full border border-[#dde5ec] bg-[#f8fafb] px-4 py-2">Designed for real front-desk operations</span>
              <span className="rounded-full border border-[#dde5ec] bg-[#f8fafb] px-4 py-2">Clear escalation paths for urgent calls</span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['24/7', 'Coverage for overflow, after-hours, and short-staffed periods.'],
                ['Action-ready', 'Every call ends with a usable note, not a vague recording.'],
                ['Clinic-led', 'Teams stay in control of routing, coverage, and follow-up.'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-3xl border border-[#dde5ec] bg-[#f8fafb] p-5">
                  <div className="text-2xl font-semibold tracking-[-0.04em] text-[#0d1b2a]">{value}</div>
                  <p className="mt-2 text-sm leading-6 text-[#61717f]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dce5ed] bg-[#0f2136] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:p-5">
            <div className="rounded-[28px] bg-[#f5f8fb] p-4 sm:p-5">
              <div className="flex items-center justify-between rounded-3xl border border-[#d6e0e8] bg-white px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7d8b]">Live operations</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#10243a]">Reception overview</h3>
                </div>
                <div className="rounded-full bg-[#ebf7f5] px-3 py-1 text-xs font-semibold text-[#0d7b72]">All systems active</div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-[#d6e0e8] bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7d8b]">Current call</p>
                      <h4 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#10243a]">Limping Labrador, same-day concern</h4>
                    </div>
                    <div className="rounded-full bg-[#eef8f7] px-3 py-1 text-xs font-semibold text-[#0d7b72]">AI handling</div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#dde5ec] bg-[#f8fafb] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71808e]">Caller</p>
                      <p className="mt-2 text-sm font-medium text-[#10243a]">Emma Lewis</p>
                    </div>
                    <div className="rounded-2xl border border-[#dde5ec] bg-[#f8fafb] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#71808e]">Intent</p>
                      <p className="mt-2 text-sm font-medium text-[#10243a]">Same-day clinical assessment</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-[#d9e2ea] bg-[#f9fbfc] p-4">
                    <div className="space-y-3">
                      <div className="max-w-[85%] rounded-2xl border border-[#dde5ec] bg-white px-4 py-3 text-sm leading-6 text-[#425364]">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8996]">Caller</p>
                        My dog is limping after the park and will not put weight on his back leg.
                      </div>
                      <div className="ml-auto max-w-[88%] rounded-2xl bg-[#eaf7f5] px-4 py-3 text-sm leading-6 text-[#11403d]">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0d7b72]">ClinicForce</p>
                        I can help with that. I am collecting details now and preparing a same-day handoff for the clinic team.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-[#1b3149] bg-[#10243a] p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#91a7bc]">Reception controls</p>
                        <p className="mt-1 text-lg font-semibold tracking-[-0.03em]">Coverage mode</p>
                      </div>
                      <ToggleLeft className="h-7 w-7 text-[#58c2b4]" />
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-[#d2dbe4]">
                      {[
                        ['Overflow handling', 'On'],
                        ['After-hours coverage', 'On'],
                        ['Urgent escalation', 'Clinician SMS'],
                      ].map(([label, status]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl border border-[#243d57] px-4 py-3">
                          <span>{label}</span>
                          <span className="font-semibold text-[#8be0d7]">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#d6e0e8] bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7d8b]">Action queue</p>
                    <div className="mt-4 space-y-3">
                      {[
                        ['Call back owner', 'Routine follow-up', 'Today'],
                        ['Confirm booking slot', 'Reception', '2:30 PM'],
                        ['Review urgent handoff', 'Clinician', 'Now'],
                      ].map(([title, team, time]) => (
                        <div key={title} className="flex items-center justify-between rounded-2xl border border-[#dde5ec] bg-[#f9fbfc] px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-[#10243a]">{title}</p>
                            <p className="text-xs text-[#70808f]">{team}</p>
                          </div>
                          <span className="text-xs font-semibold text-[#0d7b72]">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#d6e0e8] bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7d8b]">Today</p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        ['42', 'Calls handled'],
                        ['11', 'Bookings captured'],
                        ['3', 'Urgent escalations'],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-2xl bg-[#f8fafb] p-4">
                          <div className="text-2xl font-semibold tracking-[-0.04em] text-[#10243a]">{value}</div>
                          <p className="mt-1 text-xs leading-5 text-[#6d7a88]">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="problem" className="px-1 py-24 sm:py-28">
          <SectionHeading
            eyebrow="The problem"
            title="Most clinics do not have a phone problem. They have a capacity problem."
            body="Calls arrive in the middle of consults, checkout, lunch breaks, and short-staffed shifts. The result is missed demand, inconsistent handling, and more pressure on the same front-desk team."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {painPoints.map(([title, body, Icon]) => (
              <article key={title} className="rounded-3xl border border-[#dde5ec] bg-white p-6 shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
                <div className="mb-5 inline-flex rounded-2xl bg-[#f3f7fb] p-3 text-[#10243a]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#0d1b2a]">{title}</h3>
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
                <div className="mb-5 text-sm font-semibold tracking-[0.22em] text-[#0d7b72]">{step}</div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#10243a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6f7e]">{body}</p>
              </article>
            ))}
          </div>
        </section>

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
        </section>

        <section className="grid gap-10 rounded-[36px] border border-[#dbe4eb] bg-[#10243a] px-6 py-16 text-white shadow-[0_22px_55px_rgba(15,23,42,0.12)] sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#7ad3c8]">Why clinics choose ClinicForce</p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Premium software is not just about answering calls. It is about making the clinic run more cleanly.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c6d3df] sm:text-lg">
              Clinics choose ClinicForce because it reduces call leakage, creates more consistent handling, and gives reception teams room to work without losing control of inbound demand.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustReasons.map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-[#22384f] bg-[#12283f] p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-[#17314c] p-3 text-[#7ad3c8]">
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
            title="A dashboard that looks and behaves like an operating tool, not a reporting afterthought."
            body="The interface gives clinics a live view of call handling, action queues, reception controls, and activity history. The goal is clarity, not noise."
          />

          <div className="mt-12 overflow-hidden rounded-[36px] border border-[#dbe4eb] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
            <div className="grid xl:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="border-b border-[#e1e8ee] bg-[#fbfcfd] p-6 xl:border-b-0 xl:border-r">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10243a] text-sm font-semibold tracking-[0.16em] text-white">CF</div>
                  <div>
                    <p className="font-semibold tracking-[-0.03em] text-[#10243a]">ClinicForce</p>
                    <p className="text-sm text-[#6f7c89]">Northside Veterinary</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {([
                    ['Overview', Hospital],
                    ['Calls', PhoneCall],
                    ['Action Queue', ClipboardList],
                    ['Clinic Knowledge', BookOpenText],
                    ['Settings', ShieldCheck],
                  ] as [string, ComponentType<{ className?: string }>][]).map(([label, Icon]) => {
                    const ItemIcon = Icon
                    return (
                      <div key={label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${label === 'Overview' ? 'bg-[#10243a] text-white' : 'text-[#61717f]'}`}>
                        <ItemIcon className="h-4 w-4" />
                        {label}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 rounded-3xl border border-[#dbe5eb] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7c89]">Coverage status</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-[#10243a]">Front-desk support</span>
                    <span className="rounded-full bg-[#ecf8f5] px-3 py-1 text-xs font-semibold text-[#0d7b72]">Active</span>
                  </div>
                </div>
              </aside>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        ['98%', 'Calls answered'],
                        ['14', 'Bookings captured today'],
                        ['5', 'Urgent cases routed'],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-3xl border border-[#dde5ec] bg-[#f8fafb] p-5">
                          <div className="text-3xl font-semibold tracking-[-0.05em] text-[#10243a]">{value}</div>
                          <p className="mt-2 text-sm text-[#667381]">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-[#dde5ec] p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7d8b]">Activity feed</p>
                          <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#10243a]">What happened in the last hour</h3>
                        </div>
                        <span className="rounded-full bg-[#eef8f7] px-3 py-1 text-xs font-semibold text-[#0d7b72]">Live</span>
                      </div>

                      <div className="mt-5 space-y-4">
                        {[
                          ['Urgent call escalated', 'Possible gastric distress routed to on-call clinician', '2 minutes ago'],
                          ['Booking captured', 'Vaccination appointment request confirmed for Thursday', '11 minutes ago'],
                          ['Routine enquiry resolved', 'Desexing preparation information sent to owner', '18 minutes ago'],
                        ].map(([title, detail, time]) => (
                          <div key={title} className="flex gap-4 rounded-2xl border border-[#e1e8ee] bg-[#fbfcfd] p-4">
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0d7b72]" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-semibold text-[#10243a]">{title}</p>
                                <span className="text-xs font-medium text-[#6f7d8b]">{time}</span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-[#61717f]">{detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-[#dde5ec] bg-[#10243a] p-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8ba2b7]">AI status</p>
                      <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Ready for clinic demand</h3>
                      <div className="mt-5 space-y-3">
                        {[
                          ['Knowledge base synced', 'Today'],
                          ['Overflow routing active', 'Now'],
                          ['After-hours logic active', 'Today'],
                        ].map(([label, status]) => (
                          <div key={label} className="flex items-center justify-between rounded-2xl border border-[#223a52] px-4 py-3">
                            <span className="text-sm text-[#d1dbe5]">{label}</span>
                            <span className="text-xs font-semibold text-[#7ad3c8]">{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#dde5ec] bg-white p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7d8b]">Reception controls</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Overflow mode', 'Enabled'],
                          ['Booking capture', 'Enabled'],
                          ['Clinician escalation', 'SMS + dashboard'],
                          ['Owner follow-up queue', 'Enabled'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between rounded-2xl bg-[#f8fafb] px-4 py-3">
                            <span className="text-sm text-[#10243a]">{label}</span>
                            <span className="text-xs font-semibold text-[#0d7b72]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 rounded-[36px] border border-[#dbe4eb] bg-white px-6 py-16 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
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
                <ShieldCheck className="h-5 w-5 text-[#10243a]" />
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#10243a]">Reliability first</h3>
                <p className="mt-2 text-sm leading-6 text-[#62707f]">Clear escalation paths, structured outputs, and operational controls make the system easier to trust in a live clinic environment.</p>
              </div>
              <div className="rounded-3xl border border-[#dde5ec] bg-[#f8fafb] p-5">
                <Hospital className="h-5 w-5 text-[#10243a]" />
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#10243a]">Vertical-specific from day one</h3>
                <p className="mt-2 text-sm leading-6 text-[#62707f]">Messaging, workflows, and handoff structure are designed around veterinary clinics rather than retrofitted from another industry.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {testimonials.map(([quote, name, role, clinic]) => (
              <article key={name} className="rounded-3xl border border-[#dde5ec] bg-[#fbfcfd] p-6">
                <div className="mb-5 flex items-center gap-2 text-[#0d7b72]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">Built for veterinary clinics</span>
                </div>
                <p className="text-lg leading-8 tracking-[-0.02em] text-[#10243a]">"{quote}"</p>
                <div className="mt-6 border-t border-[#e2e8ee] pt-5">
                  <p className="font-semibold text-[#10243a]">{name}</p>
                  <p className="text-sm text-[#667482]">{role} · {clinic}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-1 py-24 sm:py-28">
          <div className="rounded-[36px] border border-[#d7e2e8] bg-[#eff8f6] px-6 py-14 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#0d7b72]">Final step</p>
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[#0d1b2a] sm:text-5xl">
                See how ClinicForce fits into your clinic before another week of missed calls.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#556475]">
                Book a walkthrough to see how coverage, escalation, bookings, and handoff can work for your clinic without creating more front-desk complexity.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => setDemoOpen(true)} className="inline-flex items-center justify-center rounded-2xl bg-[#10243a] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(16,36,58,0.12)] transition hover:bg-[#0d1b2a]">
                Book a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <a href="#product-ui" className="inline-flex items-center justify-center rounded-2xl border border-[#cdd9e1] bg-white px-6 py-4 text-sm font-semibold text-[#10243a] transition hover:bg-[#f9fbfc]">
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
