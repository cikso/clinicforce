'use client'

import Link from 'next/link'
import { FAQItem } from './FAQSection'

const SECURITY_FAQS: [string, string][] = [
  [
    "Is my clinic's data safe?",
    "Yes. Your data is stored in Australia (AWS Sydney) on SOC 2 Type 2 certified infrastructure, encrypted in transit and at rest, and accessible only to you and a small number of named, certified providers. We're built around Australian privacy law, not retrofitted from a US system.",
  ],
  [
    'Where is my data stored?',
    'In Australia. Specifically, AWS Sydney, via Supabase. Some live voice processing happens in the US during the call itself — but no audio, transcripts, or records are permanently stored overseas.',
  ],
  [
    'Do you use our calls to train AI models?',
    'No. The language models powering our conversations are contractually prohibited from training on customer content, and we configure our voice platform to minimise data retention.',
  ],
  [
    "Who can access my clinic's data?",
    'You, your team, and a small number of audited infrastructure providers — Supabase, Twilio, ElevenLabs, Stripe, and Vercel. Each is bound by a data processing agreement and holds SOC 2 Type 2 or equivalent certifications. We name every one of them publicly on our Trust page.',
  ],
  [
    "What happens if there's a data breach?",
    "We follow the Australian Notifiable Data Breaches (NDB) scheme. If we become aware of an eligible breach, we notify affected clinics within 72 hours and the OAIC where required. We'd work with you on any communication to your clients.",
  ],
  [
    'Can I delete my data whenever I want?',
    'Yes. You can export records from the dashboard any time. If you cancel, we delete your data within 30 days and overwrite backups within a further 90 days.',
  ],
]

export default function SecurityFAQSection() {
  return (
    <section id="security-faq" className="px-1 py-24 sm:py-28">
      <div className="text-center mb-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
          Security &amp; Privacy
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
          Security &amp; Privacy
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#566275] sm:text-lg">
          The questions clinics ask most often about how we handle data.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl border border-[#E5EAF0] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        {SECURITY_FAQS.map(([q, a]) => (
          <FAQItem key={q} question={q} answer={a} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/trust"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B578] underline decoration-[#00B578]/40 underline-offset-4 transition-colors hover:text-[#00A06A] hover:decoration-[#00B578]"
        >
          Full details on our Trust &amp; Security page <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  )
}
