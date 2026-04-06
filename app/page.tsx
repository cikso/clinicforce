'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import './landing.css'

const CALENDLY = 'https://calendly.com/ciks35/30min'

const MARQUEE_ITEMS = [
  'Call Answering', 'Urgency Triage', 'Intake Capture', 'Appointment Booking',
  'Structured Handoff', 'After-Hours Coverage', 'PMS Integration', 'SMS Follow-up',
  'Overflow Handling', 'Staff Relief', 'Zero Missed Calls', 'Live in 24 Hours',
]

const MESSAGES = [
  { side: 'owner', initials: 'MT', text: "Hi, I'm calling about my dog Buster — he's been retching but nothing is coming up and his stomach looks distended.", delay: 400 },
  { side: 'ai',    initials: 'CF', text: "I'm so sorry to hear that. Those symptoms — retching with a distended stomach — can be very serious. Can I confirm Buster's breed for me?", delay: 2800 },
  { side: 'owner', initials: 'MT', text: "He's a Great Dane. About 4 years old.", delay: 5200 },
  { side: 'ai',    initials: 'CF', text: "Thank you Michael. Given Buster's size and these symptoms, I'm flagging this as urgent and notifying the on-call vet right now. Can you head in immediately?", delay: 7000 },
]

const LogoMark = () => (
  <div className="nav-logo-mark">
    <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
      <path d="M8 1.5L14.2 5V11L8 14.5L1.8 11V5L8 1.5Z" stroke="#fff" strokeWidth="1.4" fill="none" />
      <circle cx="8" cy="8" r="2" fill="#fff" />
    </svg>
  </div>
)

const FEATURES = [
  {
    icon: 'call',
    title: 'AI Call Handling',
    desc: 'Every inbound call answered within one ring — no hold music, no phone tree. Natural conversation captures owner name, patient details, and reason for visit instantly.',
  },
  {
    icon: 'nights_stay',
    title: 'After-Hours Coverage',
    desc: 'ClinicForce stays active when your front desk clocks off. Evenings, weekends, public holidays — every call is handled and a structured handover note is waiting for your team in the morning.',
  },
  {
    icon: 'swap_calls',
    title: 'Smart Overflow',
    desc: 'When your team is in consult or on another line, ClinicForce steps in seamlessly. Multiple simultaneous calls handled without a single caller reaching voicemail.',
  },
  {
    icon: 'emergency',
    title: 'Urgency Detection',
    desc: 'Routine booking or potential GDV? ClinicForce reads the call and escalates time-sensitive presentations immediately, notifying the on-call vet via SMS with full case context.',
  },
]

export default function LandingPage() {
  const [seconds, setSeconds] = useState(134)
  const [visibleMessages, setVisibleMessages] = useState<typeof MESSAGES>([])
  const convoRef = useRef<HTMLDivElement>(null)

  // Live timer
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Animated live chat messages
  useEffect(() => {
    const timers = MESSAGES.map(msg =>
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg])
      }, msg.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Scroll convo to bottom on new message
  useEffect(() => {
    if (convoRef.current) {
      convoRef.current.scrollTop = convoRef.current.scrollHeight
    }
  }, [visibleMessages])

  // Counter animation using IntersectionObserver
  useEffect(() => {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          const target = parseInt(el.dataset.target ?? '0', 10)
          const duration = 1800
          const start = performance.now()
          function update(time: number) {
            const progress = Math.min((time - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = String(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(update)
          }
          requestAnimationFrame(update)
          counterObserver.unobserve(el)
        })
      },
      { threshold: 0.5 }
    )
    document.querySelectorAll('.lp-root .counter').forEach(el => counterObserver.observe(el))
    return () => counterObserver.disconnect()
  }, [])

  const timerStr = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="lp-root">

      {/* ─── Fixed Nav ─── */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <LogoMark />
            ClinicForce
          </div>
          <div className="nav-links">
            <a href="#features">Platform</a>
            <a href="#industries">Industries</a>
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            <Link href="/overview" className="btn-ghost">
              Clinic Login
            </Link>
            <button
              className="btn-primary"
              onClick={() => window.open(CALENDLY, '_blank')}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-grid">

            {/* Left: Copy */}
            <div className="fade-in">
              <div className="hero-eyebrow">
                <span className="tag">
                  <span className="live-pulse" />
                  System online · Purpose-built for clinics
                </span>
              </div>
              <h1 className="hero-headline">
                The front desk<br />
                that never{' '}
                <em>clocks off.</em>
              </h1>
              <p className="hero-sub">
                ClinicForce handles every call your team can&apos;t take — intake, triage, urgency detection, booking, and clean handoff. Installed in a day. Live the same week.
              </p>
              <div className="hero-actions">
                <button
                  className="btn-lg"
                  onClick={() => window.open(CALENDLY, '_blank')}
                >
                  Book a Demo
                </button>
                <Link href="/overview" className="btn-outline">
                  See the Dashboard
                </Link>
              </div>
              <div className="hero-trust">
                <div className="hero-trust-item">
                  <div className="hero-trust-dot" />
                  No lock-in
                </div>
                <div className="hero-trust-item">
                  <div className="hero-trust-dot" />
                  Live in 24 hours
                </div>
                <div className="hero-trust-item">
                  <div className="hero-trust-dot" />
                  No setup fees
                </div>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-num">0.4s</span>
                  <span className="hero-stat-label">Avg. response time</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">100%</span>
                  <span className="hero-stat-label">Call answer rate</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">24/7</span>
                  <span className="hero-stat-label">Active coverage</span>
                </div>
              </div>
            </div>

            {/* Right: Live Call Terminal */}
            <div className="fade-in" style={{ animationDelay: '.2s' }}>
              <div className="terminal">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                    <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
                    <div className="terminal-dot" style={{ background: '#28c840' }} />
                  </div>
                  <div className="terminal-title">ClinicForce / Live Call</div>
                  <div className="terminal-live">
                    <span className="live-pulse" />
                    LIVE
                  </div>
                </div>
                <div className="terminal-body">
                  <div className="call-meta">
                    <div className="call-meta-item">
                      <div className="call-meta-label">Caller</div>
                      <div className="call-meta-val">Michael Tan</div>
                    </div>
                    <div className="call-meta-item">
                      <div className="call-meta-label">Patient</div>
                      <div className="call-meta-val">Buster · GD</div>
                    </div>
                    <div className="call-meta-item">
                      <div className="call-meta-label">Duration</div>
                      <div className="call-meta-val call-timer">{timerStr}</div>
                    </div>
                  </div>
                  <div className="call-convo" ref={convoRef}>
                    {visibleMessages.map((msg, i) => (
                      <div key={i} className={`call-line${msg.side === 'owner' ? ' owner' : ''}`}>
                        {msg.side === 'owner' ? (
                          <>
                            <div className="call-bubble bubble-owner">{msg.text}</div>
                            <div className="call-avatar avatar-owner">{msg.initials}</div>
                          </>
                        ) : (
                          <>
                            <div className="call-avatar avatar-ai">{msg.initials}</div>
                            <div className="call-bubble bubble-ai">{msg.text}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="call-status">
                    <div className="status-left">
                      <div className="status-badge badge-urgent">URGENT</div>
                      <div className="status-text">Escalated to on-call vet</div>
                    </div>
                    <div className="status-right">Intake note sent</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <div className="marquee-section">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className="marquee-item">
              {item}<span className="marquee-sep"> · </span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Stats Bar ─── */}
      <section className="stats-bar fade-in">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-block">
              <div className="stat-num">
                <span className="counter" data-target="47">0</span>
              </div>
              <div className="stat-desc">Calls missed per clinic per week on average</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">
                $<span className="counter" data-target="138">0</span>
              </div>
              <div className="stat-desc">Revenue lost per missed booking</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">
                <span className="counter" data-target="63">0</span>%
              </div>
              <div className="stat-desc">Of callers who don&apos;t leave a voicemail</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">
                <span className="counter" data-target="81">0</span>%
              </div>
              <div className="stat-desc">Of receptionists cite phone overload as burnout driver</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="social-proof-section">
        <div className="container">
          <div className="blockquote-wrap fade-in">
            <span className="blockquote-mark">&ldquo;</span>
            <blockquote className="blockquote-text">
              The morning phone rush used to be the most stressful part of our day. Now, I walk in to a clean dashboard of prioritized handovers. ClinicForce literally saved my team&apos;s sanity.
            </blockquote>
            <div className="blockquote-attr">
              <div className="blockquote-avatar">SJ</div>
              <div>
                <div className="blockquote-name">Sarah Jenkins</div>
                <div className="blockquote-role">Practice Manager, Riverdale Medical Group</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header fade-in">
            <div className="section-eyebrow">
              <span className="tag">Platform</span>
            </div>
            <h2 className="section-title">Built for the way clinics<br />actually run.</h2>
            <p className="section-sub">
              Not a generic chatbot with a pet theme. Every feature is designed around the specific workflows, urgencies, and communication styles of veterinary front desks.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card fade-in">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Product Showcase ─── */}
      <section className="showcase-section">
        <div className="container">
          <div className="showcase-grid">

            {/* Left: copy */}
            <div className="fade-in">
              <div className="section-eyebrow" style={{ marginBottom: 16 }}>
                <span className="tag">Dashboard</span>
              </div>
              <h2 className="section-title">A clear view of every interaction.</h2>
              <div className="showcase-checkpoints">
                <div className="showcase-checkpoint">
                  <div className="checkpoint-icon">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                  <div className="checkpoint-text">
                    <strong>Structured handover notes</strong> waiting for your team every morning — no voicemails to decode, no details lost.
                  </div>
                </div>
                <div className="showcase-checkpoint">
                  <div className="checkpoint-icon">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                  <div className="checkpoint-text">
                    <strong>Urgency-ranked queue</strong> so your team always knows which case needs attention first.
                  </div>
                </div>
                <div className="showcase-checkpoint">
                  <div className="checkpoint-icon">
                    <span className="material-symbols-outlined">check</span>
                  </div>
                  <div className="checkpoint-text">
                    <strong>Full call transcript and audio</strong> available on every interaction for review and compliance.
                  </div>
                </div>
              </div>
              <p className="showcase-desc">
                Your clinic&apos;s entire call activity, prioritised and formatted — so nothing slips through and your team starts every shift already ahead.
              </p>
            </div>

            {/* Right: Patient handover card */}
            <div className="fade-in" style={{ animationDelay: '.15s' }}>
              <div className="handover-card">
                <div className="handover-header">
                  <div className="handover-header-title">Patient Handover</div>
                  <span className="handover-tag routine">Routine</span>
                </div>
                <div className="handover-body">
                  <div className="handover-field">
                    <div className="handover-label">Owner</div>
                    <div className="handover-value">John Miller</div>
                  </div>
                  <div className="handover-field">
                    <div className="handover-label">Patient</div>
                    <div className="handover-value">Pepper · Domestic Shorthair · 3 yr</div>
                  </div>
                  <div className="handover-field">
                    <div className="handover-label">Reason for Visit</div>
                    <div className="handover-value">Dental cleaning — annual schedule</div>
                  </div>
                  <div className="handover-note">
                    Owner confirmed Pepper is due for her annual dental. No current concerns. Happy to proceed under general anaesthetic. Requested morning appointment if available.
                  </div>
                </div>
                <div className="handover-footer">
                  <span className="handover-footer-text">Received 08:14 AM · Today</span>
                  <span className="handover-footer-text">Awaiting scheduling</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="how-section" id="how">
        <div className="container">
          <div className="section-header fade-in">
            <div className="section-eyebrow" style={{ marginBottom: 16 }}>
              <span className="tag">How it works</span>
            </div>
            <h2 className="section-title">From first ring to clean handover<br />in seconds.</h2>
            <p className="section-sub">
              A reception workflow that runs itself — no configuration required after setup. ClinicForce handles the call end-to-end so your team picks up exactly where it left off.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step fade-in">
              <div className="step-num">01 — Calls come in</div>
              <div className="step-title">Instant pickup</div>
              <div className="step-desc">ClinicForce answers within one ring — no hold music, no phone tree. The caller is greeted warmly and feels heard from the first word.</div>
            </div>
            <div className="step fade-in" style={{ animationDelay: '.1s' }}>
              <div className="step-num">02 — AI answers</div>
              <div className="step-title">Natural intake</div>
              <div className="step-desc">Owner name, pet name, breed, age, and reason for the call — gathered through natural conversation, not a robotic form or menu.</div>
            </div>
            <div className="step fade-in" style={{ animationDelay: '.2s' }}>
              <div className="step-num">03 — Urgency identified</div>
              <div className="step-title">Smart assessment</div>
              <div className="step-desc">Routine enquiry or potential emergency? ClinicForce reads the call and escalates time-sensitive cases immediately to the right person.</div>
            </div>
            <div className="step fade-in" style={{ animationDelay: '.3s' }}>
              <div className="step-num">04 — Clean handover</div>
              <div className="step-title">Structured note</div>
              <div className="step-desc">A SOAP-style intake note lands in your team&apos;s queue — prioritised, complete, and ready to act on. No voicemail to decode.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Clinic Portal Section ─── */}
      <section className="portal-section" id="portal">
        <div className="container">
          <div className="portal-card fade-in">
            <div className="portal-lock">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <h2 className="portal-title">Already a ClinicForce customer?</h2>
            <p className="portal-subtitle">
              Access your clinic dashboard, view incoming calls, manage your team and monitor urgency alerts in real time.
            </p>
            <Link href="/overview" className="btn-portal">
              Go to Dashboard
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
            <p className="portal-secondary">
              Or contact support at{' '}
              <a href="mailto:hello@clinicforce.io">hello@clinicforce.io</a>
            </p>
            <div className="portal-secure">
              <span className="material-symbols-outlined">shield</span>
              Secure clinic portal
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dark CTA Band ─── */}
      <section className="cta-section" id="pricing">
        <div className="container">
          <div className="cta-inner fade-in">
            <h2 className="cta-title">Stop missing calls.<br />Start capturing them.</h2>
            <p className="cta-sub">
              Join 200+ clinics using ClinicForce to handle every call, capture every booking, and give their team their time back. No setup fees. Live in under 24 hours.
            </p>
            <div className="cta-actions">
              <button
                className="btn-cta-primary"
                onClick={() => window.open(CALENDLY, '_blank')}
              >
                Book a Demo
              </button>
              <button className="btn-cta-link">
                View Pricing
              </button>
            </div>
            <p className="cta-note">No lock-in · No setup fees · Live in &lt;24 hours</p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <div>
              <div className="footer-logo">
                <LogoMark />
                ClinicForce
              </div>
              <div className="footer-tagline">
                AI-powered front desk for veterinary clinics. Purpose-built for the urgencies and workflows of vet medicine.
              </div>
              <div className="footer-status">
                <div className="status-dot" />
                All systems operational
              </div>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links">
                <li><a href="#features">AI Call Handling</a></li>
                <li><a href="#features">After-Hours Coverage</a></li>
                <li><a href="#features">Urgency Detection</a></li>
                <li><a href="#how">How It Works</a></li>
                <li><Link href="/overview">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Industries</div>
              <ul className="footer-links">
                <li><a href="#">Veterinary Clinics</a></li>
                <li><a href="#">Emergency Practices</a></li>
                <li><a href="#">Specialist Referrals</a></li>
                <li><a href="#">Multi-location Groups</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Case Studies</a></li>
                <li><a href="#">Integrations</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="mailto:hello@clinicforce.io">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 ClinicForce · All rights reserved</div>
            <div>hello@clinicforce.io</div>
          </div>
        </div>
      </footer>

    </div>
  )
}
