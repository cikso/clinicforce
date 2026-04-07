'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './landing.css'

const CALENDLY = 'https://calendly.com/ciks35/30min'

const HERO_MESSAGES = [
  {
    speaker: 'Owner',
    tone: 'caller',
    text: "Hi, my dog's retching but nothing is coming up and his stomach looks swollen.",
    delay: 400,
  },
  {
    speaker: 'ClinicForce',
    tone: 'ai',
    text: 'Those symptoms can be urgent. I am flagging this now and notifying the on-call vet while I confirm a few details.',
    delay: 2100,
  },
  {
    speaker: 'Owner',
    tone: 'caller',
    text: "He's a Great Dane, four years old, and it's been getting worse for the last 20 minutes.",
    delay: 4100,
  },
  {
    speaker: 'ClinicForce',
    tone: 'ai',
    text: 'Thank you. This is marked high priority. Please head straight to the clinic. Dr Patel has been alerted with Buster\'s intake note.',
    delay: 6200,
  },
]

const PROOF_STEPS = [
  {
    step: '01',
    title: 'Answer in one ring',
    copy: 'The caller reaches a calm voice instantly, even during lunch breaks, consults, or after-hours overflow.',
  },
  {
    step: '02',
    title: 'Capture the right details',
    copy: 'Owner, pet, symptoms, history, and booking intent are collected in natural conversation instead of a phone tree.',
  },
  {
    step: '03',
    title: 'Classify urgency live',
    copy: 'Potential emergencies are separated from routine bookings and pushed to the right person with context attached.',
  },
  {
    step: '04',
    title: 'Hand off cleanly',
    copy: 'Your team receives a structured note, urgency tag, and next action so no one starts the day decoding voicemail.',
  },
]

const PILLARS = [
  {
    title: 'Emergency-aware triage',
    copy: 'Built around real veterinary urgency patterns, not generic contact centre scripts.',
    label: 'Urgent cases',
  },
  {
    title: 'Overflow without friction',
    copy: 'ClinicForce catches lunch rushes, multiple simultaneous calls, and after-hours demand without putting owners on hold.',
    label: 'Operational relief',
  },
  {
    title: 'Reception-quality handoff',
    copy: 'Every call becomes an actionable note your staff can actually work from the moment they open the dashboard.',
    label: 'Team confidence',
  },
]

const OUTCOMES = [
  { value: '+23%', label: 'captured booking requests in week one' },
  { value: '4.1 hrs', label: 'saved weekly for front-desk staff' },
  { value: '$2.8k', label: 'average monthly revenue recovered' },
  { value: '0', label: 'urgent cases missed since deployment' },
]

const PRICING = [
  {
    name: 'Starter',
    price: '$399',
    note: 'For single-location clinics needing after-hours and lunch-break coverage.',
    featured: false,
    features: [
      'After-hours coverage',
      'Lunch break overflow',
      'Up to 300 calls per month',
      'Urgency detection and triage',
      'Structured handoff notes',
      'Dashboard access for your team',
    ],
  },
  {
    name: 'Growth',
    price: '$499',
    note: 'For busy clinics that want full-day overflow support and deeper workflow coverage.',
    featured: true,
    features: [
      'Everything in Starter',
      'Unlimited calls',
      'Daytime overflow coverage',
      'Priority support',
      'Appointment booking workflows',
      'PMS-ready handoff export',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    note: 'For multi-site groups that need rollout support, reporting, and custom integrations.',
    featured: false,
    features: [
      'Multi-location oversight',
      'Group-level analytics',
      'Custom onboarding support',
      'Dedicated account management',
      'Custom integration work',
      'White-label options',
    ],
  },
]

export default function LandingPage() {
  const [callSeconds, setCallSeconds] = useState(146)
  const [visibleMessages, setVisibleMessages] = useState<typeof HERO_MESSAGES>([])

  useEffect(() => {
    const ticker = setInterval(() => setCallSeconds((current) => current + 1), 1000)
    return () => clearInterval(ticker)
  }, [])

  useEffect(() => {
    const timers = HERO_MESSAGES.map((message) =>
      setTimeout(() => {
        setVisibleMessages((current) => [...current, message])
      }, message.delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const timerLabel = `${String(Math.floor(callSeconds / 60)).padStart(2, '0')}:${String(
    callSeconds % 60
  ).padStart(2, '0')}`

  return (
    <div className="lp-root">
      <nav className="lp-nav">
        <div className="container lp-nav-inner">
          <a className="lp-brand" href="#hero">
            <span className="lp-brand-mark">CF</span>
            ClinicForce
          </a>

          <div className="lp-nav-links">
            <a href="#proof">Proof</a>
            <a href="#platform">Platform</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className="lp-nav-actions">
            <Link href="/login" className="lp-link-btn">
              Log in
            </Link>
            <a className="lp-solid-btn" href={CALENDLY} target="_blank" rel="noreferrer">
              Book a demo
            </a>
          </div>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              Vet-native front desk AI
            </div>

            <h1>
              The front desk for veterinary clinics that cannot afford to miss what matters.
            </h1>

            <p className="hero-sub">
              ClinicForce answers overflow and after-hours calls, identifies urgency in real time,
              captures the right intake details, and hands your team an action-ready note before the
              call is even over.
            </p>

            <div className="hero-actions">
              <a className="lp-solid-btn hero-primary" href={CALENDLY} target="_blank" rel="noreferrer">
                Book a demo
              </a>
              <a className="lp-ghost-btn" href="#proof">
                See a real workflow
              </a>
            </div>

            <div className="hero-proof-points">
              <div>Live in under 24 hours</div>
              <div>No setup fees</div>
              <div>No lock-in contracts</div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>0.4s</strong>
                <span>average answer time</span>
              </div>
              <div className="hero-stat">
                <strong>24/7</strong>
                <span>coverage across overflow and after-hours</span>
              </div>
              <div className="hero-stat">
                <strong>SOAP-style</strong>
                <span>handoff notes ready for your team</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="live-board">
              <div className="live-board-header">
                <div>
                  <div className="panel-kicker">LIVE TRIAGE</div>
                  <div className="panel-title">Buster · Great Dane · 4 yrs</div>
                </div>
                <div className="live-timer">{timerLabel}</div>
              </div>

              <div className="live-board-topline">
                <div className="mini-card">
                  <span className="mini-label">Caller</span>
                  <strong>Michael Tan</strong>
                </div>
                <div className="mini-card">
                  <span className="mini-label">Symptoms</span>
                  <strong>Retching, distended abdomen</strong>
                </div>
              </div>

              <div className="transcript-card">
                {visibleMessages.map((message, index) => (
                  <div
                    key={`${message.speaker}-${index}`}
                    className={`transcript-line ${message.tone === 'ai' ? 'ai' : 'caller'}`}
                  >
                    <span className="transcript-speaker">{message.speaker}</span>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="signal-grid">
                <div className="signal-card signal-urgent">
                  <span className="signal-label">Urgency</span>
                  <strong>High</strong>
                  <p>Possible GDV pattern detected from symptoms and breed.</p>
                </div>
                <div className="signal-card">
                  <span className="signal-label">Escalation</span>
                  <strong>SMS sent</strong>
                  <p>Dr Patel notified with summary, caller details, and arrival instruction.</p>
                </div>
              </div>

              <div className="handoff-preview">
                <div className="handoff-preview-header">
                  <span>Handoff note</span>
                  <span className="handoff-badge">Ready for team</span>
                </div>
                <ul>
                  <li>Chief concern: repeated non-productive retching</li>
                  <li>Risk signal: giant breed + abdominal distension</li>
                  <li>Disposition: immediate presentation advised</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="container proof-strip-inner">
          <div className="proof-strip-item">
            <span className="proof-strip-number">38%</span>
            <span>of missed calls happen during business hours</span>
          </div>
          <div className="proof-strip-item">
            <span className="proof-strip-number">$2,800</span>
            <span>average monthly revenue recovered per clinic</span>
          </div>
          <div className="proof-strip-item">
            <span className="proof-strip-number">4.1 hrs</span>
            <span>saved weekly for front-desk staff</span>
          </div>
        </div>
      </section>

      <section className="workflow-section" id="proof">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow subtle">How the workflow proves itself</div>
            <h2>From first ring to clean handoff in under three minutes.</h2>
            <p>
              This is where ClinicForce becomes more than a generic answering tool. It handles the
              operational reality of veterinary calls: uncertain symptoms, urgent escalation, and
              staff who need context instead of voicemail.
            </p>
          </div>

          <div className="workflow-grid">
            {PROOF_STEPS.map((step) => (
              <article className="workflow-card" key={step.step}>
                <div className="workflow-step">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>

          <div className="workflow-proof-panel">
            <div className="proof-panel-block">
              <span className="proof-panel-label">Call classification</span>
              <strong>Routine booking, same-day concern, or emergency pattern</strong>
              <p>
                ClinicForce does not just answer the phone. It decides what the clinic needs to know
                now, what can wait, and who should receive the handoff.
              </p>
            </div>

            <div className="proof-panel-divider" />

            <div className="proof-panel-block">
              <span className="proof-panel-label">Operational output</span>
              <strong>SMS alert + dashboard note + next action</strong>
              <p>
                Every interaction resolves into something useful for staff: a booking path, a triage
                escalation, or a complete note for follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="case-study-section">
        <div className="container case-study-grid">
          <div className="case-study-copy">
            <div className="eyebrow subtle">Pilot clinic outcome</div>
            <h2>One Australian clinic used ClinicForce during lunch rush and after-hours. The first-week impact was obvious.</h2>
            <p>
              Instead of stacking voicemail and hoping owners called back, the practice captured more
              booking demand, reduced front-desk stress, and routed urgent cases with far more
              confidence.
            </p>

            <blockquote>
              "By Friday it already felt like we had added another capable front-desk operator. The
              biggest difference was not just fewer missed calls. It was how much calmer the team
              felt walking in each morning."
            </blockquote>

            <div className="case-study-attribution">
              <strong>Sarah Redmond</strong>
              <span>Practice Manager · Sydney metro mixed practice</span>
            </div>
          </div>

          <div className="case-study-metrics">
            {OUTCOMES.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow subtle">Platform focus</div>
            <h2>Three things a 9 to 5 answering service cannot do for a clinic like yours.</h2>
            <p>
              The point is not more AI. The point is better judgement, better handoff, and fewer
              moments where your front desk becomes the bottleneck.
            </p>
          </div>

          <div className="pillar-grid">
            {PILLARS.map((pillar) => (
              <article className="pillar-card" key={pillar.title}>
                <span className="pillar-label">{pillar.label}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-head centered">
            <div className="eyebrow subtle">Pricing</div>
            <h2>Simple pricing. Clear rollout. No long-term commitment.</h2>
            <p>
              Most clinics do not need a complicated packaging story. They need a fast decision and a
              clear path to go live this week.
            </p>
          </div>

          <div className="pricing-grid">
            {PRICING.map((tier) => (
              <article
                key={tier.name}
                className={`pricing-card${tier.featured ? ' featured' : ''}`}
              >
                {tier.featured && <div className="pricing-badge">Most popular</div>}
                <div className="pricing-head">
                  <span className="pricing-name">{tier.name}</span>
                  <strong>{tier.price}</strong>
                  <p>{tier.note}</p>
                </div>

                <ul className="pricing-list">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <a className={tier.featured ? 'lp-solid-btn' : 'lp-ghost-btn'} href={CALENDLY} target="_blank" rel="noreferrer">
                  {tier.name === 'Enterprise' ? 'Talk to sales' : 'Book a demo'}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-shell">
          <div>
            <div className="eyebrow subtle">Start this week</div>
            <h2>Make the homepage promise true in the clinic: no missed context, no dead-end voicemail, no guessing what is urgent.</h2>
          </div>

          <div className="cta-actions">
            <a className="lp-solid-btn" href={CALENDLY} target="_blank" rel="noreferrer">
              Book a demo
            </a>
            <Link href="/login" className="lp-link-btn dark">
              Existing customer login
            </Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="container lp-footer-inner">
          <div>
            <div className="lp-brand footer-brand">
              <span className="lp-brand-mark">CF</span>
              ClinicForce
            </div>
            <p>
              AI-powered front desk operations for veterinary clinics, built for urgent calls,
              overloaded teams, and cleaner handoff.
            </p>
          </div>

          <div className="footer-links">
            <a href="#proof">Proof</a>
            <a href="#platform">Platform</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:hello@clinicforce.io">hello@clinicforce.io</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
