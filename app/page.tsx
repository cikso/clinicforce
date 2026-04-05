'use client'

import { useState, useEffect, useRef } from 'react'
import './landing.css'

const CALENDLY = 'https://calendly.com/ciks35/30min'

const MARQUEE_ITEMS = [
  'Call Answering', 'Urgency Triage', 'Intake Capture', 'Appointment Booking',
  'Structured Handoff', 'After-Hours Coverage', 'PMS Integration', 'SMS Follow-up',
  'Overflow Handling', 'Staff Relief', 'Zero Missed Calls', 'Live in 24 Hours',
]

const MESSAGES = [
  { side: 'owner', initials: 'MT', text: "Hi, I'm calling about my dog Buster — he's been retching but nothing is coming up and his stomach looks distended.", delay: 400 },
  { side: 'ai',    initials: 'VF', text: "I'm so sorry to hear that. Those symptoms — retching with a distended stomach — can be very serious. Can I confirm Buster's breed for me?", delay: 2800 },
  { side: 'owner', initials: 'MT', text: "He's a Great Dane. About 4 years old.", delay: 5200 },
  { side: 'ai',    initials: 'VF', text: "Thank you Michael. Given Buster's size and these symptoms, I'm flagging this as urgent and notifying the on-call vet right now. Can you head in immediately?", delay: 7000 },
]

const PILLARS = ['always-on', 'smarter-ops', 'growth'] as const
type Pillar = typeof PILLARS[number]

const LogoMark = () => (
  <div className="nav-logo-mark">
    <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
      <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="#0a0c0f" strokeWidth="1.5" fill="none"/>
      <circle cx="8" cy="8" r="2" fill="#0a0c0f"/>
    </svg>
  </div>
)

export default function LandingPage() {
  const [seconds, setSeconds] = useState(134)
  const [visibleMessages, setVisibleMessages] = useState<typeof MESSAGES>([])
  const [activePillar, setActivePillar] = useState<Pillar>('always-on')
  const convoRef = useRef<HTMLDivElement>(null)

  // Timer
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Live chat messages
  useEffect(() => {
    const timers = MESSAGES.map((msg, i) =>
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg])
      }, msg.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Scroll convo to bottom on new message
  useEffect(() => {
    if (convoRef.current) convoRef.current.scrollTop = convoRef.current.scrollHeight
  }, [visibleMessages])

  // Scroll fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.15 })
    document.querySelectorAll('.lp-root .fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Counter animation observer
  useEffect(() => {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target as HTMLElement
        const target = parseInt(el.dataset.target || '0', 10)
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
    }, { threshold: 0.5 })
    document.querySelectorAll('.lp-root .counter').forEach(el => counterObserver.observe(el))
    return () => counterObserver.disconnect()
  }, [])

  const timerStr = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="lp-root">

      {/* ─── Nav ─── */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <LogoMark />
            ClinicForce
          </div>
          <div className="nav-links">
            <a href="#features">Platform</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="/overview">Dashboard</a>
          </div>
          <div className="nav-actions">
            <button className="btn-ghost" onClick={() => window.location.href = '/overview'}>Log in</button>
            <button className="btn-primary" onClick={() => window.open(CALENDLY, '_blank')}>Book a Demo</button>
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
                  System online · Purpose-built for vet clinics
                </span>
              </div>
              <h1 className="hero-headline">
                The front desk<br />
                that never<br />
                <em>clocks out.</em>
              </h1>
              <p className="hero-sub">
                ClinicForce handles every call your team can't take — intake, triage, urgency detection, booking, and clean handoff. Installed in a day. Live the same week.
              </p>
              <div className="hero-actions">
                <button className="btn-lg" onClick={() => window.open(CALENDLY, '_blank')}>Book a Demo</button>
                <button className="btn-outline" onClick={() => window.location.href = '/overview'}>See the dashboard</button>
              </div>
              <div className="hero-trust">
                <div className="hero-trust-item"><div className="hero-trust-dot" />No lock-in contracts</div>
                <div className="hero-trust-item"><div className="hero-trust-dot" />Live in under 24 hours</div>
                <div className="hero-trust-item"><div className="hero-trust-dot" />No setup fees</div>
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
                    <div className="live-pulse" />
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
              <div className="stat-num"><span className="counter" data-target="47">0</span></div>
              <div className="stat-desc">Calls missed per clinic, per week on average</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">$<span className="counter" data-target="138">0</span></div>
              <div className="stat-desc">Estimated revenue lost per missed booking</div>
            </div>
            <div className="stat-block">
              <div className="stat-num"><span className="counter" data-target="63">0</span>%</div>
              <div className="stat-desc">Of callers who don't leave a voicemail</div>
            </div>
            <div className="stat-block">
              <div className="stat-num"><span className="counter" data-target="81">0</span>%</div>
              <div className="stat-desc">Of receptionists who cite phone overload as burnout driver</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section className="problem-section" id="problem">
        <div className="container">
          <div className="problem-inner">
            <div className="fade-in">
              <div style={{ marginBottom: 20 }}><span className="tag">The bottleneck</span></div>
              <h2 className="problem-headline">
                Your front desk<br />can't be <em>everywhere</em><br />at once.
              </h2>
              <p className="problem-body">
                Vet clinics miss calls every single day — not just after hours. During lunch breaks, in a consult room, mid-checkout. Each one is a booking gone elsewhere, a question unanswered, or an urgent case that waited too long.
              </p>
              <div className="problem-data">
                <div className="data-card">
                  <div className="data-num">38%</div>
                  <div className="data-label">of calls missed during business hours</div>
                </div>
                <div className="data-card">
                  <div className="data-num">$2,800</div>
                  <div className="data-label">average monthly revenue recovered per clinic</div>
                </div>
                <div className="data-card">
                  <div className="data-num">4.1 hrs</div>
                  <div className="data-label">saved per week for front desk staff</div>
                </div>
                <div className="data-card">
                  <div className="data-num">&lt; 1 day</div>
                  <div className="data-label">to go live after onboarding</div>
                </div>
              </div>
            </div>
            <div className="fade-in" style={{ animationDelay: '.15s' }}>
              <div className="problem-quote">
                <div className="quote-text">
                  "We were losing 3 to 5 bookings a day during lunch. ClinicForce was running by Wednesday afternoon, and by Friday our front desk coordinator said it felt like we'd hired someone new."
                </div>
                <div className="quote-attr">
                  <div className="quote-avatar">SR</div>
                  <div>
                    <div className="quote-name">Sarah Redmond</div>
                    <div className="quote-role">Practice Manager — Riverside Animal Hospital</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header fade-in">
            <div style={{ marginBottom: 16 }}><span className="tag">Platform</span></div>
            <h2 className="section-title">One platform. Every<br /><em>touchpoint covered.</em></h2>
            <p className="section-sub">Not a generic chatbot with a pet theme. Every feature is designed around the specific workflows, urgencies, and communication styles of veterinary front desks.</p>
          </div>

          <div className="pillar-tabs fade-in">
            <button className={`pillar-tab${activePillar === 'always-on' ? ' active' : ''}`} onClick={() => setActivePillar('always-on')}>Always-on Reception</button>
            <button className={`pillar-tab${activePillar === 'smarter-ops' ? ' active' : ''}`} onClick={() => setActivePillar('smarter-ops')}>Smarter Operations</button>
            <button className={`pillar-tab${activePillar === 'growth' ? ' active' : ''}`} onClick={() => setActivePillar('growth')}>Grow Your Practice</button>
          </div>

          {/* Pane 1: Always-on */}
          <div className={`pillar-pane${activePillar === 'always-on' ? ' active' : ''}`}>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .95.68l1.45 4.36a1 1 0 0 1-.23 1.04L9 10.5s1.06 2.15 2.5 3.5 3.5 2.5 3.5 2.5l1.43-1.44a1 1 0 0 1 1.04-.23l4.36 1.45A1 1 0 0 1 22 17v3a2 2 0 0 1-2 2C9.4 22 2 14.6 2 7a2 2 0 0 1 1-1.73z"/></svg>
              </div>
              <div className="feature-title">24/7 call answering</div>
              <div className="feature-desc">Activates the moment reception is unavailable — lunch, meetings, sick days, after-hours. Every call answered, every time. No missed opportunities.</div>
              <span className="feature-pill">Live now</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="feature-title">Emergency triage</div>
              <div className="feature-desc">Distinguishes a routine booking from a GDV presentation. Flags critical cases, escalates immediately and notifies the on-call vet via SMS with full details.</div>
              <span className="feature-pill">Live now</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
              </div>
              <div className="feature-title">Natural intake capture</div>
              <div className="feature-desc">Captures owner name, pet name, breed, age, and reason for call through natural conversation — not a phone tree. Clean SOAP-style notes ready for your team.</div>
              <span className="feature-pill">Live now</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="feature-title">Overflow handling</div>
              <div className="feature-desc">When your team is busy, ClinicForce steps in. Handles multiple simultaneous calls with zero hold time. Your callers never hear a busy signal again.</div>
              <span className="feature-pill">Live now</span>
            </div>
          </div>

          {/* Pane 2: Smarter Ops */}
          <div className={`pillar-pane${activePillar === 'smarter-ops' ? ' active' : ''}`}>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="feature-title">Live appointment booking</div>
              <div className="feature-desc">Sarah checks availability and books directly into Ezyvet, Provet Cloud, and leading practice management systems. Confirmation SMS sent instantly to the pet owner.</div>
              <span className="feature-pill">Phase 2 — Coming soon</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="feature-title">Post-call SMS</div>
              <div className="feature-desc">Automatic confirmation SMS to the pet owner after every call. Booking reference, vet name, pre-visit instructions. Reduces no-shows and keeps owners informed.</div>
              <span className="feature-pill">Phase 2 — Coming soon</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div className="feature-title">Appointment reminders</div>
              <div className="feature-desc">Interactive SMS reminders 48h and 2h before appointments. Clients confirm or reschedule directly via text — no manual follow-up required from your team.</div>
              <span className="feature-pill">Phase 3</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="feature-title">Digital intake forms</div>
              <div className="feature-desc">Post-call SMS with a link to pre-visit forms. Pet history, consent, vaccination records. Auto-populated from call intake data. Writes back to your PMS.</div>
              <span className="feature-pill">Phase 3</span>
            </div>
          </div>

          {/* Pane 3: Growth */}
          <div className={`pillar-pane${activePillar === 'growth' ? ' active' : ''}`}>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div className="feature-title">Automated review requests</div>
              <div className="feature-desc">Post-visit follow-up SMS: "How was Bella's visit?" Satisfied clients are automatically directed to your Google review link. Build your 5-star reputation on autopilot.</div>
              <span className="feature-pill">Phase 3</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.4 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
              </div>
              <div className="feature-title">AI outbound recall</div>
              <div className="feature-desc">Sarah calls lapsed patients: "Max's annual checkup is overdue." Reactivates revenue from your existing client list. AI outbound recall achieves 3–5× higher engagement than email.</div>
              <span className="feature-pill">Phase 3</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div className="feature-title">Practice analytics</div>
              <div className="feature-desc">Call volume trends, peak hour heatmaps, urgency breakdowns, and monthly revenue recovered. Data-driven insights to optimise staffing and identify growth opportunities.</div>
              <span className="feature-pill">Phase 2 — Coming soon</span>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div className="feature-title">Practice Health Score</div>
              <div className="feature-desc">A single composite metric: call answer rate + booking conversion + no-show rate + review score. Know at a glance how your clinic is performing, every single day.</div>
              <span className="feature-pill">Phase 3</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="how-section" id="how">
        <div className="container">
          <div className="section-header fade-in">
            <div style={{ marginBottom: 16 }}><span className="tag">How it works</span></div>
            <h2 className="section-title">From first ring to<br /><em>clean handoff</em> in seconds.</h2>
            <p className="section-sub">A reception workflow that runs itself — no configuration required after setup. ClinicForce handles the call end-to-end so your team picks up exactly where it left off.</p>
          </div>
          <div className="steps-grid">
            <div className="step fade-in">
              <div className="step-num">01 — Answer</div>
              <div className="step-title">Instant pickup</div>
              <div className="step-desc">ClinicForce answers within one ring. No hold music. No phone tree. The caller is greeted warmly and feels heard from the first word.</div>
              <div className="step-visual"><span className="hl">INBOUND</span> · +61 2 8734 ****<br />Connected in <span className="hl">0.4s</span><br />"Hi, you've reached Greenfield Vet..."</div>
            </div>
            <div className="step fade-in" style={{ animationDelay: '.1s' }}>
              <div className="step-num">02 — Capture</div>
              <div className="step-title">Natural intake</div>
              <div className="step-desc">Owner name, pet name, breed, age, and reason for the call — gathered through natural conversation, not a form.</div>
              <div className="step-visual"><span className="hl">Owner:</span> James Park<br /><span className="hl">Pet:</span> Max · Labrador · 4yr<br /><span className="hl">Reason:</span> Limping, won't bear weight</div>
            </div>
            <div className="step fade-in" style={{ animationDelay: '.2s' }}>
              <div className="step-num">03 — Assess</div>
              <div className="step-title">Urgency detection</div>
              <div className="step-desc">Routine enquiry or potential emergency? ClinicForce reads the call and escalates time-sensitive cases immediately to the right person.</div>
              <div className="step-visual"><span className="hl">URGENCY:</span> HIGH<br />Possible fracture / trauma<br />SMS → on-call vet · 2:41 PM</div>
            </div>
            <div className="step fade-in" style={{ animationDelay: '.3s' }}>
              <div className="step-num">04 — Handoff</div>
              <div className="step-title">Structured note</div>
              <div className="step-desc">A SOAP-style intake note lands in your team's queue — prioritised, complete, and ready to act on. No voicemail to decode.</div>
              <div className="step-visual"><span className="hl">Reason:</span> Limping / won't bear weight<br /><span className="hl">Onset:</span> This morning<br /><span className="hl">Priority:</span> Same-day review</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Case Study ─── */}
      <section className="case-section" id="results">
        <div className="container">
          <div className="fade-in">
            <div style={{ marginBottom: 24 }}><span className="tag">Real results</span></div>
          </div>
          <div className="case-inner fade-in">
            <div className="case-header">
              <div>
                <span className="tag">Pilot clinic</span>
                <div className="case-title" style={{ marginTop: 12 }}>An Australian vet clinic<br />saw results in the first week.</div>
                <div className="case-subtitle">After deploying ClinicForce to handle lunch breaks, overflow, and after-hours calls, the practice recovered significant revenue and freed up their front desk team to focus on in-clinic care.</div>
              </div>
              <div className="case-clinic">
                <div className="case-clinic-name">Sydney Metro Vet Clinic</div>
                <div>Sydney, NSW</div>
                <div style={{ marginTop: 4 }}>Single-location · Mixed practice</div>
              </div>
            </div>
            <div className="case-metrics">
              <div className="metric">
                <div className="metric-num">+<span>23</span>%</div>
                <div className="metric-label">Increase in captured booking requests</div>
              </div>
              <div className="metric">
                <div className="metric-num"><span>4.1</span> hrs</div>
                <div className="metric-label">Saved per week for front desk staff</div>
              </div>
              <div className="metric">
                <div className="metric-num">$<span>2,800</span></div>
                <div className="metric-label">Average monthly revenue recovered</div>
              </div>
              <div className="metric">
                <div className="metric-num"><span>0</span></div>
                <div className="metric-label">Urgent cases missed since deployment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="compare-section" id="compare">
        <div className="container">
          <div className="section-header fade-in">
            <div style={{ marginBottom: 16 }}><span className="tag">How we compare</span></div>
            <h2 className="section-title">Built for vet clinics.<br /><em>Not retrofitted.</em></h2>
            <p className="section-sub">Generic AI answering services aren't built for the urgency, terminology, or workflows of veterinary practice. ClinicForce is.</p>
          </div>
          <div className="compare-table fade-in">
            <div className="compare-head">
              <div className="compare-col-head" />
              <div className="compare-col-head highlight">ClinicForce</div>
              <div className="compare-col-head">Dodo</div>
              <div className="compare-col-head">Generic AI</div>
              <div className="compare-col-head">Human answering</div>
            </div>
            {[
              ['Vet-native urgency triage',  '✓', '✓', '✗', 'Depends'],
              ['24/7 active coverage',        '✓', '✓', '✓', '✗'],
              ['SOAP-style handoff notes',    '✓', 'Basic', '✗', '✗'],
              ['PMS / Ezyvet integration',    '✓', '✓', '✗', '✗'],
              ['Setup in under 24 hours',     '✓', '✗', '✓', '✗'],
              ['No long-term contracts',      '✓', '✗', 'Varies', '✗'],
              ['Appointment booking',         'Phase 2', '✓', 'Basic', '✓'],
              ['Australia-based support',     '✓', '✗', '✗', 'Varies'],
            ].map(([feature, vf, dodo, generic, human]) => (
              <div key={feature} className="compare-row">
                <div className="compare-cell feature-name">{feature}</div>
                {[vf, dodo, generic, human].map((val, j) => (
                  <div key={j} className="compare-cell">
                    <span className={val === '✓' ? 'check' : val === '✗' ? 'cross' : 'partial'}>{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header fade-in">
            <div style={{ marginBottom: 16 }}><span className="tag">Pricing</span></div>
            <h2 className="section-title">Simple, transparent<br /><em>pricing.</em></h2>
            <p className="section-sub">No setup fees. No lock-in. Go live in under 24 hours. Most clinics recover their entire monthly fee within the first week.</p>
          </div>
          <div className="pricing-grid fade-in">
            {/* Starter */}
            <div className="price-card">
              <div className="price-name">Starter</div>
              <div className="price-amount"><span>$</span>399</div>
              <div className="price-period">per month · billed monthly</div>
              <div className="price-divider" />
              <ul className="price-features">
                <li>After-hours coverage (6 PM–8 AM)</li>
                <li>Lunch break coverage</li>
                <li>Up to 300 calls / month</li>
                <li>AI triage + urgency detection</li>
                <li>Structured handover notes</li>
                <li>Call inbox dashboard</li>
                <li>Email support</li>
              </ul>
              <button className="price-btn price-btn-outline" onClick={() => window.open(CALENDLY, '_blank')}>Book a Demo</button>
            </div>

            {/* Growth (featured) */}
            <div className="price-card featured">
              <div className="price-popular">Most popular</div>
              <div className="price-name">Growth</div>
              <div className="price-amount"><span>$</span>499</div>
              <div className="price-period">per month · billed monthly</div>
              <div className="price-divider" />
              <ul className="price-features">
                <li>Everything in Starter</li>
                <li>Full daytime overflow coverage</li>
                <li>Unlimited calls</li>
                <li>Appointment booking via Sarah</li>
                <li>Post-call SMS to pet owners</li>
                <li>PMS handover note export</li>
                <li>Priority support</li>
                <li>Practice analytics dashboard</li>
              </ul>
              <button className="price-btn price-btn-fill" onClick={() => window.open(CALENDLY, '_blank')}>Book a Demo</button>
            </div>

            {/* Enterprise */}
            <div className="price-card">
              <div className="price-name">Enterprise</div>
              <div className="price-amount" style={{ fontSize: 36, lineHeight: 1.2, paddingTop: 8 }}>Custom</div>
              <div className="price-period">multi-location · clinic groups</div>
              <div className="price-divider" />
              <ul className="price-features">
                <li>Everything in Growth</li>
                <li>Multi-location management</li>
                <li>Aggregate analytics across clinics</li>
                <li>AI outbound recall campaigns</li>
                <li>Automated review management</li>
                <li>Dedicated account manager</li>
                <li>Custom PMS integration</li>
                <li>White-label option available</li>
              </ul>
              <button className="price-btn price-btn-outline" onClick={() => window.location.href = 'mailto:hello@clinicforce.ai'}>Contact Sales</button>
            </div>
          </div>
          <p className="price-note">No setup fees · No lock-in contracts · Cancel anytime · Most clinics recover their full subscription cost in the first week</p>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="testi-section">
        <div className="container">
          <div className="section-header fade-in">
            <div style={{ marginBottom: 16 }}><span className="tag">What clinics say</span></div>
            <h2 className="section-title">Practices see the<br /><em>difference in week one.</em></h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card fade-in">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"Before ClinicForce, we were missing calls every single lunch break. Now I actually leave the clinic knowing every call is being handled properly. It's genuinely felt like hiring another team member."</div>
              <div className="testi-attr">
                <div className="testi-avatar">SR</div>
                <div>
                  <div className="testi-name">Sarah Redmond</div>
                  <div className="testi-role">Practice Manager · Riverside Animal Hospital</div>
                </div>
              </div>
            </div>
            <div className="testi-card fade-in" style={{ animationDelay: '.1s' }}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"The urgency triage is what sold us. Sarah caught a potential GDV in the first week — that dog came in immediately. A voicemail system would have been a disaster. This is the standard of care we expect."</div>
              <div className="testi-attr">
                <div className="testi-avatar">JH</div>
                <div>
                  <div className="testi-name">Dr. James Harlow</div>
                  <div className="testi-role">Principal Vet · Harlow Animal Clinic</div>
                </div>
              </div>
            </div>
            <div className="testi-card fade-in" style={{ animationDelay: '.2s' }}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"We went live Wednesday afternoon. By Friday I'd already recovered four bookings that would have gone to voicemail. The handover notes are cleaner than what our own staff write in a rush."</div>
              <div className="testi-attr">
                <div className="testi-avatar">KL</div>
                <div>
                  <div className="testi-name">Karen Lawson</div>
                  <div className="testi-role">Clinic Owner · Lakeside Vet Clinic</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-inner fade-in">
          <span className="tag" style={{ marginBottom: 28, display: 'inline-flex' }}>Your clinic. Always open.</span>
          <h2 className="cta-title">Start this week.<br /><em>See results by Friday.</em></h2>
          <p className="cta-sub">Start with one location. No long-term commitment. No setup fees. Live in under 24 hours — or we'll set it up for free.</p>
          <div className="cta-actions">
            <button className="btn-lg" onClick={() => window.open(CALENDLY, '_blank')}>Book a Demo</button>
            <button className="btn-outline" onClick={() => window.location.href = '/overview'}>View the dashboard</button>
          </div>
          <p className="cta-note">No setup fees · No lock-in contracts · Live in &lt;24 hours</p>
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
              <div className="footer-tagline">AI-powered front desk for veterinary clinics. Purpose-built for the urgencies and workflows of vet medicine.</div>
              <div className="footer-status">
                <div className="status-dot" />
                All systems operational
              </div>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <ul className="footer-links">
                <li><a href="#features">Reception AI</a></li>
                <li><a href="#features">Triage &amp; Urgency</a></li>
                <li><a href="#features">Appointment Booking</a></li>
                <li><a href="#features">Analytics</a></li>
                <li><a href="/overview">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Integrations</a></li>
                <li><a href="#">Case Studies</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 ClinicForce · All rights reserved</div>
            <div>hello@clinicforce.ai</div>
          </div>
        </div>
      </footer>

    </div>
  )
}
