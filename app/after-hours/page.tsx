'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  CalendarX,
  Check,
  ChevronDown,
  MessageSquare,
  PhoneIncoming,
  Siren,
} from 'lucide-react'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import DemoModal from '@/components/landing/DemoModal'

const featureCards: [string, string, React.ComponentType<{ className?: string }>][] = [
  [
    'Books appointments after hours',
    'Clients call at 7 PM, 9 PM, Sunday morning. Stella answers and books directly into your system. You start Monday with a full schedule.',
    Calendar,
  ],
  [
    'Handles weekends and public holidays',
    'Public holidays, long weekends, school holidays. Your phone is always answered by an AI that knows your clinic.',
    CalendarClock,
  ],
  [
    'Answers client enquiries overnight',
    'Fees, services, what to bring, cancellation policy. Every question answered accurately from your clinic\u2019s own information.',
    MessageSquare,
  ],
  [
    'Captures every missed call',
    'No more voicemail. No more callback lists on Monday morning. Every after-hours caller is handled in the moment.',
    PhoneIncoming,
  ],
  [
    'Manages reschedules and cancellations',
    'A client calls Saturday to cancel Monday. Stella updates your calendar instantly and opens that slot for someone else.',
    CalendarX,
  ],
  [
    'Escalates urgent calls',
    'For emergencies, Stella transfers the call or sends an urgent notification. Nothing falls through.',
    Siren,
  ],
]

const exampleCalls = [
  {
    time: '7:43 PM',
    label: 'Evening booking',
    caller:
      "Hi, I'd like to book an appointment. My dog Oscar hasn't been eating well.",
    stella:
      'Of course! Let me find an available time for Oscar this week…',
    tags: ['New appointment booked at 7:43 PM', 'Zero staff involvement after hours'],
  },
  {
    time: 'Sat 10:15 AM',
    label: 'Weekend reschedule',
    caller: 'I need to move my Monday appointment. Something came up.',
    stella: 'No problem. Let me check the next available times for you…',
    tags: ['Monday slot cancelled, new slot booked', 'Calendar updated in real time'],
  },
  {
    time: 'Sun 8:30 PM',
    label: 'Holiday enquiry',
    caller:
      'What are your fees for a consult? And do you have anything available this week?',
    stella:
      'A standard consultation is [clinic fee]. I can see a few openings on Wednesday — would you like to book?',
    tags: ['Clinic-specific fees answered accurately', 'Client booked on Sunday evening'],
  },
]

const faqs: [string, string][] = [
  [
    'What hours does ClinicForce cover?',
    'Stella answers calls 24/7 — evenings, weekends, and public holidays. You choose when calls forward to Stella using conditional call forwarding on your existing clinic number. No number change required.',
  ],
  [
    'Can Stella book appointments after hours?',
    'Yes. Stella reads your live calendar and books into available slots in real time — correct appointment type, right duration, even at 10 PM on a Sunday.',
  ],
  [
    'What happens if a caller needs urgent help?',
    'Stella recognises when a call needs a human. It can transfer the call to an on-call number, send an urgent notification, or direct the caller to an emergency partner — based on how your clinic is configured.',
  ],
  [
    'How is this different from a traditional answering service?',
    'Traditional answering services take messages. Stella takes action — books appointments, answers clinic-specific questions, and updates your calendar in real time. No callback list. No Monday morning backlog.',
  ],
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-panel-${question.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className="border-b border-[#eef1f4] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#00D68F]"
      >
        <span className="text-base font-semibold text-[#1A1A1A]">{question}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        hidden={!open}
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-[500px] pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm leading-7 text-[#536171] pr-8">{answer}</p>
      </div>
    </div>
  )
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export default function AfterHoursPage() {
  const [demoOpen, setDemoOpen] = useState(false)
  const openDemo = () => setDemoOpen(true)

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <MarketingNavbar onBookDemo={openDemo} />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(23,196,190,0.10) 0%, rgba(23,196,190,0.03) 35%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:px-8 sm:py-28 lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#E6FBF2] px-3.5 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00D68F]">
              After-hours answering
            </span>
          </div>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#1A1A1A] sm:text-5xl lg:text-6xl">
            After Hours Answering Service for Clinics.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#536171]">
            Stella answers patient and client calls evenings, weekends, and public holidays — books appointments, handles enquiries, and escalates urgencies while your team is off the clock.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openDemo}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00D68F] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] transition hover:bg-[#00B578]"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['No setup fees', 'Live in 1–2 business days', 'No lock-in contracts'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#00D68F]" />
                <span className="text-xs font-medium text-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-12">

        {/* ─── PAIN POINT ─────────────────────────────────────── */}
        <section className="px-1 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
              Your phone rings at 7 PM. Nobody&apos;s there to answer.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#536171] sm:text-lg">
              Clients don&apos;t stop calling when your clinic closes. They call evenings to book, weekends to reschedule, and public holidays to ask questions. Without after-hours coverage, those calls go to voicemail — and most of those clients never call back.
            </p>
          </div>
        </section>

        {/* ─── WHAT STELLA HANDLES ─────────────────────────────── */}
        <section className="px-1 py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
              What Stella handles
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
              Full coverage the moment your clinic closes.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(([title, body, Icon]) => (
              <article
                key={title}
                className="rounded-3xl border border-[#d9e2ea] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-[#E6FBF2] p-3 text-[#00D68F]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1A1A1A]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6f7e]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ─── EXAMPLE CALLS ──────────────────────────────────── */}
        <section className="px-1 py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
              Example calls
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
              Real after-hours calls. Handled by Stella.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exampleCalls.map((call) => (
              <article
                key={call.time}
                className="flex flex-col rounded-3xl border border-[#dde5ec] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00D68F]">
                    {call.time}
                  </span>
                  <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-[11px] font-medium text-[#536171]">
                    {call.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#F3F4F6] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                        Caller
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#374151]">
                        &ldquo;{call.caller}&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#E6FBF2] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#00D68F]">
                        Stella
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#134e4a]">
                        &ldquo;{call.stella}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {call.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#ECFDF5] px-2 py-1 text-[11px] font-semibold text-[#059669]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────── */}
        <section className="px-1 py-20 sm:py-24">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
              FAQ
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
              Common questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl rounded-3xl border border-[#dde5ec] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
            {faqs.map(([q, a]) => (
              <FAQItem key={q} question={q} answer={a} />
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─────────────────────────────────────── */}
        <section className="px-1 py-20 sm:py-24">
          <div className="rounded-[36px] border border-[#E5E7EB] bg-[#E6FBF2] px-6 py-14 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[#1A1A1A] sm:text-5xl">
                Take back your time.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#556475]">
                Run a calmer clinic and grow 24/7.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={openDemo}
                className="inline-flex items-center justify-center rounded-2xl bg-[#00D68F] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(23,196,190,0.2)] transition hover:bg-[#00B578]"
              >
                Book a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
