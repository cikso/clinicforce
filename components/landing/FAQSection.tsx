'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs: [string, string][] = [
  [
    'How long does setup take?',
    'About 3 minutes of your time. You connect your practice management software, answer a few questions about your clinic, and our team handles the rest — configuring Stella with your services and protocols, then setting up call forwarding. We aim for a 1 to 2 business day go-live. No setup fees, no hardware to install, and no software to download.',
  ],
  [
    'Is ClinicForce compliant with Australian privacy law?',
    'Yes. ClinicForce is aligned with the Australian Privacy Principles (APPs) under the Privacy Act 1988. All patient data is encrypted in transit and at rest, and we undergo regular third-party security audits. We also hold cyber insurance as an additional safeguard.',
  ],
  [
    'How does ClinicForce work with my existing phone system?',
    'You keep your existing clinic phone number. When calls go unanswered (busy, lunch break, after hours), they automatically forward to your ClinicForce number via conditional call forwarding. Your clients never know the difference — Stella answers as your clinic.',
  ],
  [
    'Can I turn ClinicForce off if I don\'t need it?',
    'Yes — completely. From your dashboard you can switch coverage on or off in seconds. Set it to handle all calls, overflow only, after-hours only, or turn it off entirely. If your front desk is fully staffed and you want to run the phones yourself, just flip the toggle.',
  ],
  [
    'Can Stella actually book appointments?',
    'Yes — Stella can check your available slots and book appointments directly during the call. The booking appears instantly in your dashboard for confirmation. We\'re also building direct integrations with popular practice management systems.',
  ],
  [
    'What happens with emergency calls?',
    'Stella is trained to detect emergency keywords and symptoms. Urgent calls are immediately escalated — the on-call vet or dentist receives an SMS alert with full context within seconds. Routine calls are handled normally.',
  ],
  [
    'Does it work for dental clinics, GP practices, and other clinics too?',
    'Absolutely. ClinicForce is one platform that adapts to your industry. Veterinary clinics see pet-specific fields, dental clinics see patient fields, and GP practices see their own terminology. The AI adjusts its conversation style to match.',
  ],
  [
    'What if a caller wants to speak to a real person?',
    'Stella can transfer calls to your team at any time, either when the caller requests it or when the situation requires it. You control when transfers are enabled in your coverage settings.',
  ],
  [
    'How is this different from a traditional answering service?',
    'Traditional services cost $5–10 per call, have no clinical knowledge, and take messages that often get lost. ClinicForce costs a flat monthly fee, understands veterinary and medical terminology, creates structured summaries with urgency triage, and delivers everything to a real-time dashboard your team can action immediately.',
  ],
  [
    'Is my data secure?',
    'Yes. All data is encrypted in transit and at rest. We use Supabase (built on PostgreSQL) with row-level security. Your clinic\'s data is completely isolated from other clinics. We comply with Australian privacy regulations.',
  ],
  [
    'Can I try it before committing?',
    'Every plan includes a 14-day free trial with full access to all features. No credit card required. We\'ll help you set up and run test calls before going live.',
  ],
  [
    'What if I want to cancel?',
    'There are no lock-in contracts. Cancel anytime from your dashboard. Your data remains available for 30 days after cancellation.',
  ],
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[#eef1f4] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#00D68F]"
      >
        <span className="text-base font-semibold text-[#1A1A1A]">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-[500px] pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm leading-7 text-[#566275] pr-8">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQSection() {
  return (
    <section id="faq" className="px-1 py-24 sm:py-28">
      <div className="text-center mb-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
          FAQ
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#566275] sm:text-lg">
          Everything you need to know about ClinicForce.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl border border-[#E5EAF0] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        {faqs.map(([q, a]) => (
          <FAQItem key={q} question={q} answer={a} />
        ))}
      </div>
    </section>
  )
}
