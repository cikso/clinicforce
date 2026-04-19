'use client'

import { FAQItem } from './FAQSection'

const QUESTIONS: [string, string][] = [
  [
    "Where is my clinic's data stored?",
    'All data — call recordings, transcripts, patient messages, clinic configuration — is stored in AWS ap-southeast-2 in Sydney, Australia. It never leaves the country. Our stack runs on SOC 2 Type 2 certified infrastructure, and data is encrypted in transit (TLS 1.2+) and at rest (AES-256).',
  ],
  [
    "Do I need to change my clinic's phone number?",
    'No. You keep your existing number. We set you up with conditional call forwarding — your AI receptionist picks up only when you want it to (overflow, lunch cover, after-hours, weekends, or always). Patients see your familiar number on their phone as always.',
  ],
  [
    'How does this comply with the Privacy Act 1988?',
    "ClinicForce was designed against the 13 Australian Privacy Principles (APPs) from day one. We collect only what's necessary, we're transparent about how data is used, patients can request their data, and we have a documented breach response process. We'll happily share our Privacy Impact Assessment with practice managers during onboarding.",
  ],
  [
    "What happens if the AI can't answer a caller's question?",
    'The AI is trained to know what it doesn\u2019t know. For anything clinical, urgent, or outside its brief, it takes a structured message and hands it straight to your team — with caller name, phone, reason, and urgency flag. You can also configure instant transfer to a human for specific trigger phrases ("emergency", "poisoning", "chest pain", and so on).',
  ],
  [
    'Does the AI sound like a robot?',
    "We use the most natural-sounding voice technology available in 2026. Most callers don\u2019t realise they\u2019re speaking with an AI until they\u2019re told. That said, we believe in disclosure — so your AI introduces itself by name and mentions it\u2019s an assistant at the start of every call. It\u2019s honest and it still converts.",
  ],
  [
    'How quickly can we go live?',
    'Sign-up takes about 3 minutes. We typically have clinics live within 1–2 business days — often same-day. There are no setup fees and no long onboarding process.',
  ],
  [
    'Are there any long-term contracts?',
    "No. We bill monthly in Australian dollars. You can cancel any time from your dashboard. If ClinicForce isn\u2019t working for you, we don\u2019t want to lock you in.",
  ],
]

export default function QuestionsFAQSection() {
  return (
    <section id="faq" className="questions-faq">
      <div className="container">
        <div className="qfaq-grid">
          <div className="qfaq-intro reveal">
            <div className="eyebrow">Frequently asked</div>
            <h2 className="section-heading" style={{ marginTop: 14 }}>
              Questions
              <br />
              we hear a lot.
            </h2>
            <p className="qfaq-lead">
              Can&apos;t find what you&apos;re after? Email{' '}
              <a href="mailto:hello@clinicforce.io">hello@clinicforce.io</a> — you&apos;ll
              hear back from a person in Sydney, usually within a few hours.
            </p>
          </div>

          <div className="qfaq-list reveal">
            {QUESTIONS.map(([q, a]) => (
              <FAQItem key={q} question={q} answer={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
