'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import Link from 'next/link'
import {
  NPS_COMMENTS,
  TRUST_PILLS,
  VERTICALS,
  VERTICAL_TABS,
  type VerticalKey,
} from './data'
import './landing-v2.css'

/* ─── Inline icons (Lucide-style, kept local so the page stays self-contained) ─── */

const CheckIcon = ({ size = 12, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8.5L6.5 12L13 4" />
  </svg>
)

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 4l4 4-4 4" />
  </svg>
)

const PhoneIcon = ({ size = 18, strokeWidth = 1.8 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 12.5c-1.2 0-2.4-.2-3.5-.6a.8.8 0 0 0-.8.2l-1.6 2A12.1 12.1 0 0 1 4.5 8.5L6.4 7a.8.8 0 0 0 .2-.8C6.2 5 6 3.8 6 2.6a.8.8 0 0 0-.8-.8H2.6a.8.8 0 0 0-.8.8A13.4 13.4 0 0 0 15.2 16a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8z" />
  </svg>
)

/* Tab icons — copied verbatim from the Claude Design handoff so shapes match. */
const TAB_ICONS: Record<VerticalKey, ReactElement> = {
  all: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 2v2" /><path d="M5 2v2" />
      <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
      <path d="M8 15a6 6 0 0 0 12 0v-3" /><circle cx="20" cy="10" r="2" />
    </svg>
  ),
  vet: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><circle cx="4" cy="8" r="2" />
      <path d="M8 14c-1.5 1.5-3 3-3 5.5A2.5 2.5 0 0 0 7.5 22h9a2.5 2.5 0 0 0 2.5-2.5c0-2.5-1.5-4-3-5.5-1-1-1.5-3-3-3s-2 2-3 3z" />
    </svg>
  ),
  dental: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  gp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
      <path d="M8 15v3a3 3 0 0 0 6 0v-2" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
  chiro: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
}

/* ─── Main component ──────────────────────────────────────────────────── */

const ORB_SUB_SEQUENCE: VerticalKey[] = ['vet', 'dental', 'gp', 'chiro']

export default function ClinicForceLandingV2() {
  /* ─── Vertical state + persistence ─── */
  const [currentVertical, setCurrentVertical] = useState<VerticalKey>('all')
  const [orbSubVertical, setOrbSubVertical] = useState<VerticalKey>('vet')

  // Initialise from URL hash or sessionStorage on mount.
  useEffect(() => {
    try {
      const hash = window.location.hash.replace('#', '') as VerticalKey
      if (hash && (hash in VERTICALS)) {
        setCurrentVertical(hash)
        return
      }
      const saved = window.sessionStorage.getItem('cf.vertical') as VerticalKey | null
      if (saved && saved in VERTICALS) setCurrentVertical(saved)
    } catch {
      /* ignore */
    }
  }, [])

  // Persist on change.
  useEffect(() => {
    try {
      window.sessionStorage.setItem('cf.vertical', currentVertical)
      if (history.replaceState) history.replaceState(null, '', '#' + currentVertical)
    } catch { /* ignore */ }
  }, [currentVertical])

  // Drive orbSubVertical: follow currentVertical unless 'all', in which case
  // rotate through vet → dental → gp → chiro every 4.5s.
  useEffect(() => {
    if (currentVertical !== 'all') {
      setOrbSubVertical(currentVertical)
      return
    }
    setOrbSubVertical(ORB_SUB_SEQUENCE[0])
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % ORB_SUB_SEQUENCE.length
      setOrbSubVertical(ORB_SUB_SEQUENCE[i])
    }, 4500)
    return () => window.clearInterval(id)
  }, [currentVertical])

  /* ─── Orb cyclers (each runs independently, matching the original HTML) ─── */
  const [cIdx, setCIdx] = useState(0)
  const [bIdx, setBIdx] = useState(0)
  const [sIdx, setSIdx] = useState(0)
  const [nIdx, setNIdx] = useState(0)

  // Reset item indices when the orb's source vertical changes.
  useEffect(() => {
    setCIdx(0); setBIdx(0); setSIdx(0)
  }, [orbSubVertical])

  useEffect(() => {
    const idC = window.setInterval(() => setCIdx((i) => (i + 1) % 4), 4500)
    const idB = window.setInterval(() => setBIdx((i) => (i + 1) % 4), 4800)
    const idS = window.setInterval(() => setSIdx((i) => (i + 1) % 4), 5100)
    const idN = window.setInterval(() => setNIdx((i) => (i + 1) % NPS_COMMENTS.length), 5000)
    return () => {
      window.clearInterval(idC); window.clearInterval(idB)
      window.clearInterval(idS); window.clearInterval(idN)
    }
  }, [])

  /* ─── Ticking call duration (0:42 → 2:59 → wrap) ─── */
  const [callSec, setCallSec] = useState(42)
  useEffect(() => {
    const id = window.setInterval(() => setCallSec((s) => (s + 1) % 180), 1000)
    return () => window.clearInterval(id)
  }, [])

  /* ─── Industry-switcher sliding underline ─── */
  const switcherRef = useRef<HTMLDivElement>(null)
  const [sliderStyle, setSliderStyle] = useState<CSSProperties>({ left: 0, width: 0 })

  // Measure any pill element directly. Used both on click (pass the clicked
  // button) and on mount/resize (find the currently-active pill in the DOM).
  const measurePill = useCallback((pill: HTMLElement | null | undefined) => {
    if (!pill) return
    setSliderStyle({ left: pill.offsetLeft, width: pill.offsetWidth })
  }, [])

  const measureActivePill = useCallback(() => {
    const root = switcherRef.current
    measurePill(root?.querySelector<HTMLButtonElement>('.is-pill.active'))
  }, [measurePill])

  // Initial measurement + re-measure on font load and resize. Click-triggered
  // updates bypass this path entirely (see handleTabClick below) because
  // React commit timing in concurrent mode can return stale offsetLeft on
  // the newly-active pill.
  useLayoutEffect(() => {
    measureActivePill()
  }, [measureActivePill])

  useEffect(() => {
    const fontReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready
    if (fontReady) fontReady.then(measureActivePill).catch(() => { /* ignore */ })
    window.addEventListener('resize', measureActivePill)
    return () => window.removeEventListener('resize', measureActivePill)
  }, [measureActivePill])

  const handleTabClick = useCallback(
    (key: VerticalKey, ev: React.MouseEvent<HTMLButtonElement>) => {
      // Measure the clicked pill directly — reliable, no layout-timing
      // dependency. Then update the vertical state.
      measurePill(ev.currentTarget)
      setCurrentVertical(key)
    },
    [measurePill],
  )

  /* ─── Nav scrolled state ─── */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ─── Reveal-on-scroll (matches `.reveal.visible`) ─── */
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    root.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* ─── Count-up numbers ─── */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const target = Number(el.dataset.count ?? '0')
          const numEl = el.querySelector<HTMLElement>('.num')
          if (!numEl) continue
          const start = performance.now()
          const dur = 1400
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur)
            const eased = 1 - Math.pow(1 - p, 3)
            numEl.textContent = String(Math.round(target * eased))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.unobserve(el)
        }
      },
      { threshold: 0.4 },
    )
    root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* ─── CTA cursor spotlight ─── */
  const onCtaMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  /* ─── Derived display values ─── */
  const v = VERTICALS[currentVertical]
  const orbV = VERTICALS[orbSubVertical]
  const caller  = orbV.callers[cIdx % orbV.callers.length]
  const booking = orbV.bookings[bIdx % orbV.bookings.length]
  const sms     = orbV.smses[sIdx % orbV.smses.length]
  const drift   = NPS_COMMENTS[nIdx]
  const [trust1, trust2, trust3] = TRUST_PILLS[currentVertical]
  const callTime = `00:${String(callSec).padStart(2, '0')}`

  return (
    <div ref={rootRef} className="cf-landing-v2">
      {/* ─── Navigation ─── */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} aria-label="Primary">
        <div className="container-wide nav-inner">
          <Link href="/" className="logo">
            <div className="logo-mark">CF</div>
            ClinicForce
          </Link>
          <div className="nav-links">
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <Link href="/veterinary-clinics/case-studies">Customers</Link>
            <Link href="/blog">Blog</Link>
            <a href="#footer">Company</a>
          </div>
          <div className="nav-right">
            <Link href="https://app.clinicforce.io" className="nav-signin">Clinic Login</Link>
            <a className="btn btn-primary" href="#cta" onMouseMove={onCtaMouseMove}>
              Book a demo <span className="arrow"><ArrowRight /></span>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Hero A ─── */}
      <section className="hero hero-a active">
        <div className="container-wide hero-grid">
          <div className="hero-text">
            <div className="switcher-label">WHICH CLINIC ARE YOU?</div>
            <div ref={switcherRef} className="industry-switcher" role="tablist">
              <div className="is-slider" style={sliderStyle} aria-hidden />
              {VERTICAL_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={currentVertical === t.key}
                  className={`is-pill${currentVertical === t.key ? ' active' : ''}`}
                  onClick={(e) => handleTabClick(t.key, e)}
                >
                  {TAB_ICONS[t.key]}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="hero-badge">
              <span className="hero-badge-pill">NEW</span>
              <span>{v.badge}</span>
            </div>

            <h1 className="h1-a" dangerouslySetInnerHTML={{ __html: v.headline }} />
            <p className="hero-sub">{v.sub}</p>
            <p className="mono-tag">{v.mono}</p>

            <div className="hero-cta-row">
              <a
                className="btn btn-primary btn-lg"
                href="#cta"
                onMouseMove={onCtaMouseMove}
              >
                Book a demo <span className="arrow"><ArrowRight /></span>
              </a>
              <a className="btn btn-secondary btn-lg" href="#product">
                See how it works <ArrowRight />
              </a>
            </div>

            <div className="trust-row">
              <span className="trust-pill"><CheckIcon /><span>{trust1}</span></span>
              <span className="trust-pill"><CheckIcon /><span>{trust2}</span></span>
              <span className="trust-pill"><CheckIcon /><span>{trust3}</span></span>
            </div>

            <div className="integrations-row" dangerouslySetInnerHTML={{ __html: v.integrations }} />
          </div>

          {/* Hero visual — Operations Orb */}
          <div className="hero-visual-slot">
            <div className="vis-orb">
              <svg className="orb-rings" viewBox="0 0 560 560" aria-hidden>
                <circle cx="280" cy="280" r="270" fill="none" stroke="#E5EAF0" strokeWidth="1" opacity="0.4" />
                <circle cx="280" cy="280" r="210" fill="none" stroke="#E5EAF0" strokeWidth="1" opacity="0.5" />
                <circle cx="280" cy="280" r="150" fill="none" stroke="#E5EAF0" strokeWidth="1" opacity="0.6" />
              </svg>

              <div className="orb-center">
                <div className="orb-ping" />
                <div className="orb-ping orb-ping-2" />
                <div className="orb-core">
                  <div className="orb-label">STELLA</div>
                  <div className="orb-live"><span className="orb-live-dot" />LIVE</div>
                </div>
              </div>

              <svg className="orb-lines" viewBox="0 0 560 560" aria-hidden>
                <line x1="280" y1="230" x2="280" y2="110" stroke="#E5EAF0" strokeWidth="1" strokeDasharray="2 4" className="orb-line line-top" />
                <line x1="330" y1="280" x2="450" y2="280" stroke="#E5EAF0" strokeWidth="1" strokeDasharray="2 4" className="orb-line line-right" />
                <line x1="280" y1="330" x2="280" y2="450" stroke="#E5EAF0" strokeWidth="1" strokeDasharray="2 4" className="orb-line line-bot" />
                <line x1="230" y1="280" x2="110" y2="280" stroke="#E5EAF0" strokeWidth="1" strokeDasharray="2 4" className="orb-line line-left" />
              </svg>

              {/* 12 o'clock — AI ANSWERING */}
              <div className="orb-card orb-card-top" style={{ '--d': '0ms' } as CSSProperties} data-tip="AI call answering">
                <div className="oc-head">
                  <span className="oc-tag">AI ANSWERING</span>
                  <span className="oc-time">{callTime}</span>
                </div>
                <div className="oc-body">
                  <div className="oc-main">{caller}</div>
                  <div className="oc-sub">Call answered</div>
                </div>
                <div className="oc-wave"><span /><span /><span /><span /><span /></div>
              </div>

              {/* 3 o'clock — BOOKINGS */}
              <div className="orb-card orb-card-right" style={{ '--d': '120ms' } as CSSProperties} data-tip="Live calendar bookings">
                <div className="oc-head">
                  <span className="oc-tag">BOOKING</span>
                  <span className="oc-time">Thu 10:15</span>
                </div>
                <div className="oc-body">
                  <div className="oc-main">{booking}</div>
                  <div className="oc-sub">Dr. Patel</div>
                </div>
                <div className="oc-check"><CheckIcon size={14} strokeWidth={2.5} /></div>
              </div>

              {/* 6 o'clock — SMS */}
              <div className="orb-card orb-card-bot" style={{ '--d': '240ms' } as CSSProperties} data-tip="SMS reminders & recalls">
                <div className="oc-head">
                  <span className="oc-tag">SMS</span>
                  <span className="oc-time">3:42 PM</span>
                </div>
                <div className="oc-body">
                  <div className="oc-main">{sms}</div>
                  <div className="oc-sub">Delivered</div>
                </div>
                <div className="oc-bar"><span /></div>
              </div>

              {/* 9 o'clock — SURVEYS */}
              <div className="orb-card orb-card-left" style={{ '--d': '360ms' } as CSSProperties} data-tip="Post-visit NPS surveys">
                <div className="oc-head">
                  <span className="oc-tag">NPS</span>
                  <span className="oc-time oc-delta">+14</span>
                </div>
                <div className="oc-body">
                  <div className="oc-main">
                    <span className="oc-score">72</span>
                    <span className="oc-score-unit">/100</span>
                  </div>
                  <svg className="oc-spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden>
                    <path d="M0,20 L20,16 L40,14 L60,10 L80,7 L100,4" fill="none" stroke="#00D68F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="oc-drift">{drift}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Credentials strip ─── */}
      <div className="credentials">
        <div className="container">
          <div className="cred-row">
            <span className="cred-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" />
              </svg>
              Trained on 50,000+ real clinic calls
            </span>
            <span className="cred-sep" />
            <span className="cred-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="6" width="8" height="15" /><rect x="13" y="3" width="8" height="18" />
                <path d="M6 10h2M6 14h2M16 7h2M16 11h2M16 15h2" />
              </svg>
              Trained on vet, dental, GP, and chiro clinic calls
            </span>
            <span className="cred-sep" />
            <span className="cred-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
              </svg>
              AU Privacy Act compliant · AU data residency
            </span>
            <span className="cred-sep" />
            <span className="cred-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
              Integrates with 12+ clinical PMS platforms
            </span>
          </div>
        </div>
      </div>

      {/* ─── Logos wall ─── */}
      <section className="logos-wall">
        <div className="container">
          <div className="logos-tagline">Trusted by clinics across Australia.</div>
          <div className="logos-grid">
            {[
              <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" /></svg>,
              <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></svg>,
              <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16" /></svg>,
              <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l9 8-9 10L3 11l9-8z" /></svg>,
              <svg key="5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="12" r="5" /><circle cx="16" cy="12" r="5" /></svg>,
              <svg key="6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12h6l2-7 2 14 2-7h6" /></svg>,
            ].map((icon, i) => (
              <a key={i} href="#" className="logo-ghost">{icon}{`{LOGO_${i + 1}}`}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 01 — AI Answering ─── */}
      <section id="product">
        <div className="container">
          <div className="two-col">
            <div className="col-text reveal">
              <div className="eyebrow">01 — AI Answering</div>
              <h2 className="section-heading" style={{ marginTop: 14 }}>{v.sec1H}</h2>
              <p>{v.sec1B}</p>
              <p>If it&apos;s routine, she books it. If it&apos;s an emergency, she escalates to your on-call team within seconds. Every call comes back as a structured handover note with transcript, urgency, and the next action already queued up.</p>
            </div>
            <div className="col-visual reveal">
              <div className="phone-visual">
                <div className="phone-row">
                  <div className="phone-icon"><PhoneIcon /></div>
                  <div>
                    <div className="caller-name">Sarah Williams</div>
                    <div className="status">CONNECTED · 00:42</div>
                  </div>
                  <div className="wave-mini">
                    {[0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48].map((d, i) => (
                      <span key={i} style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
                <div className="transcript-lines">
                  <div className="transcript-line"><b>Stella:</b> Hills Veterinary, you&apos;ve reached Stella. How can I help?</div>
                  <div className="transcript-line"><b>Caller:</b> Hi — Luna&apos;s due for her annual. Do you have anything this week?</div>
                  <div className="transcript-line"><b>Stella:</b> I can see Dr. Patel has Thursday at 10:15, or Friday at 4pm.</div>
                  <div className="transcript-line"><b>Caller:</b> Thursday works great.</div>
                </div>
                <div className="booking-confirm">
                  <div className="check"><CheckIcon size={12} strokeWidth={2.5} /></div>
                  <div className="text">
                    <b>Booked.</b> <span>Luna · Annual · Thu 10:15 with Dr. Patel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 02 — Bookings (Calendar) ─── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="two-col flip">
            <div className="col-text reveal">
              <div className="eyebrow">02 — Bookings</div>
              <h2 className="section-heading" style={{ marginTop: 14 }}>{v.sec2H}</h2>
              <p>{v.sec2B}</p>
              <p>Which means Sunday at 10pm, when Mrs. Nguyen is finally settling Cleo down, she doesn&apos;t leave a voicemail — she leaves with an appointment.</p>
              <div className="integrations-caption">
                Integrates with{' '}
                <span className="logos-inline">
                  ezyVet <span className="dot-sep">·</span> RxWorks <span className="dot-sep">·</span> Cliniko <span className="dot-sep">·</span> Vetport
                </span>
              </div>
            </div>
            <div className="col-visual reveal">
              <Calendar />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 03 — Reminders (SMS) ─── */}
      <section>
        <div className="container">
          <div className="two-col">
            <div className="col-text reveal">
              <div className="eyebrow">03 — Reminders</div>
              <h2 className="section-heading" style={{ marginTop: 14 }}>{v.sec3H}</h2>
              <p>{v.sec3B}</p>
              <p>Every reply threads back into the same call record. Your front desk sees confirmations, reschedules, and cancellations all in one timeline — no SMS inbox, no missed texts, no WhatsApp chaos.</p>
            </div>
            <div className="col-visual reveal">
              <PhoneMock />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 04 — Surveys (NPS card) ─── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="two-col flip">
            <div className="col-text reveal">
              <div className="eyebrow">04 — Surveys</div>
              <h2 className="section-heading" style={{ marginTop: 14 }}>{v.sec4H}</h2>
              <p>{v.sec4B}</p>
              <p>{v.sec4B2}</p>
            </div>
            <div className="col-visual reveal">
              <NpsCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why clinic-specific ─── */}
      <section className="why-section">
        <div className="container">
          <div className="inner reveal">
            <div className="eyebrow">WHY CLINIC-SPECIFIC</div>
            <h2>Your clinic doesn&apos;t answer calls like a law firm. Your AI shouldn&apos;t either.</h2>
            <p>Generic AI phone tools are built for restaurants, real estate, tradespeople — industries where every call is a booking request. Clinics are different. A pet owner calling at 10pm isn&apos;t always booking an appointment; sometimes they&apos;re panicking. A patient describing chest tightness needs a different response than a patient asking about clinic hours. Stella knows the difference.</p>
            <p>ClinicForce is built on thousands of real clinic calls across veterinary, dental, general practice, and chiropractic. Stella understands clinical vocabulary, recognises urgency patterns, books into real clinic software — ezyVet, Best Practice, Dental4Windows — and hands your team a handover note in language your clinicians already use. Not a generic transcription. A clinical-quality summary.</p>
            <a className="cta-ghost" href="#product">See how Stella handles clinic calls <span className="arrow"><ArrowRight /></span></a>
          </div>
        </div>
      </section>

      {/* ─── Numbers ─── */}
      <section className="numbers-section">
        <div className="container">
          <div className="numbers-grid">
            <div className="stat reveal">
              <div className="stat-value" data-count="43"><span className="num">0</span><span className="unit">%</span></div>
              <div className="stat-label">of clinic calls go unanswered industry-wide</div>
            </div>
            <div className="stat reveal">
              <div className="stat-value"><span>24</span><span className="unit">/7</span></div>
              <div className="stat-label">coverage with Stella — nights, weekends, holidays</div>
            </div>
            <div className="stat reveal">
              <div className="stat-value" data-count="48"><span className="num">0</span><span className="unit">h</span></div>
              <div className="stat-label">from sign-up to Stella answering your first call</div>
            </div>
            <div className="stat reveal">
              <div className="stat-value"><span>$0</span></div>
              <div className="stat-label">long-term contract — pause or cancel any month</div>
            </div>
          </div>
          <div className="numbers-caption">Stat 1 from the 2024 AVPMA benchmark. Stats 2–4 are ClinicForce terms.</div>
        </div>
      </section>

      {/* ─── Quote lift ─── */}
      <section className="quote-section">
        <div className="container">
          <div className="reveal">
            <div className="quote-mark">&ldquo;</div>
            <p className="quote-text">
              Stella booked 14 appointments last Sunday night. We used to lose most of those to the clinic that answered first. Now we <em style={{ color: 'var(--brand-dark)', fontStyle: 'normal', fontWeight: 700 }}>are</em> the one that answers first.
            </p>
            <div className="quote-author">
              <div className="quote-avatar">SC</div>
              <div className="quote-meta">
                <div className="name">Dr. Sam Carpenter</div>
                <div className="role">Hills Veterinary Practice · Chatswood</div>
              </div>
            </div>
            <Link href="/veterinary-clinics/case-studies" className="quote-case">
              Read the case study <span className="arrow"><ArrowRight /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="eyebrow" style={{ textAlign: 'center' }}>Pricing</div>
          <h2 className="section-heading" style={{ margin: '14px auto 0', textAlign: 'center' }}>One flat rate. Everything included.</h2>
          <div className="pricing-card reveal">
            <div className="price-head">
              <div className="price-tag">$13<span className="per">/ day</span></div>
              <div className="price-sub">$390 / month<br />billed monthly</div>
            </div>
            <div className="features-list">
              {[
                'Unlimited inbound calls handled by Stella',
                'Unlimited SMS reminders, recalls, and surveys',
                'Live in 48 hours — white-glove onboarding',
                'No lock-in contract, cancel anytime',
                'Free number porting — keep your existing line',
              ].map((f) => (
                <div key={f} className="feature-row">
                  <span className="feature-check"><CheckIcon size={11} strokeWidth={2.5} /></span>
                  {f}
                </div>
              ))}
            </div>
            <a className="btn btn-primary btn-lg" href="#cta" style={{ width: '100%', justifyContent: 'center' }} onMouseMove={onCtaMouseMove}>
              Book a demo <span className="arrow"><ArrowRight /></span>
            </a>
          </div>
          <p className="pricing-sub">Need a custom plan for 10+ clinics? <a href="#cta">Talk to us →</a></p>
        </div>
      </section>

      {/* ─── CTA banner ─── */}
      <div className="cta-banner reveal" id="cta">
        <h2>Take back your time.</h2>
        <p>See Stella answer a real clinic call in a 15-minute demo.</p>
        <a className="btn btn-primary btn-lg" href="mailto:hello@clinicforce.io?subject=Book a demo" onMouseMove={onCtaMouseMove}>
          Book a demo <span className="arrow"><ArrowRight /></span>
        </a>
      </div>

      {/* ─── Footer ─── */}
      <footer className="cf-footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col" style={{ maxWidth: 280 }}>
              <Link href="/" className="logo" style={{ marginBottom: 14 }}>
                <div className="logo-mark">CF</div>
                ClinicForce
              </Link>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                The AI front desk for veterinary, dental, GP, and chiropractic clinics. Built in Australia.
              </p>
            </div>
            <div className="footer-col">
              <h5>Product</h5>
              <ul>
                <li><a href="#product">Call Answering</a></li>
                <li><a href="#product">Bookings</a></li>
                <li><a href="#product">SMS</a></li>
                <li><a href="#product">Surveys</a></li>
                <li><Link href="/after-hours">After-hours</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <ul>
                <li><Link href="/veterinary-clinics">For veterinary clinics</Link></li>
                <li><Link href="/veterinary-clinics/case-studies">Case studies</Link></li>
                <li><a href="#cta">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Resources</h5>
              <ul>
                <li><Link href="/blog">Blog</Link></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><Link href="https://app.clinicforce.io">Clinic Login</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Legal</h5>
              <ul>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ClinicForce. Built for Australian clinics.</span>
            <span>Made in Sydney</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Section sub-components ─────────────────────────────────────────── */

function Calendar() {
  const DAYS = [
    { label: 'Mon', num: 14, today: false },
    { label: 'Tue', num: 15, today: false },
    { label: 'Wed', num: 16, today: false },
    { label: 'Thu', num: 17, today: true },
    { label: 'Fri', num: 18, today: false },
  ] as const

  return (
    <div className="calendar">
      <div className="cal-header">
        <div className="cal-title">This week · Dr. Patel &amp; Dr. Chen</div>
        <div className="cal-nav">← Week 42 →</div>
      </div>
      <div className="cal-grid">
        <div />
        {DAYS.map((d) => (
          <div key={d.label} className={`cal-dayhead${d.today ? ' today' : ''}`}>
            {d.label}<span className="num">{d.num}</span>
          </div>
        ))}

        <div className="cal-time">6am</div>
        <div className="cal-cell" />
        <div className="cal-cell">
          <div className="cal-event stella d1">
            Bella · Emergency<span className="mono">06:10 · booked Tue 03:47</span>
          </div>
        </div>
        <div className="cal-cell" />
        <div className="cal-cell" />
        <div className="cal-cell" />

        <div className="cal-time">9am</div>
        <div className="cal-cell"><div className="cal-event">Max · Vaccination</div></div>
        <div className="cal-cell"><div className="cal-event">Luna · Check-up</div></div>
        <div className="cal-cell"><div className="cal-event">Buddy · Dental</div></div>
        <div className="cal-cell">
          <div className="cal-event stella d2">
            Cleo · Annual<span className="mono">booked Sun 22:14</span>
          </div>
        </div>
        <div className="cal-cell"><div className="cal-event">Rocky · Lameness</div></div>

        <div className="cal-time">12pm</div>
        <div className="cal-cell" />
        <div className="cal-cell"><div className="cal-event">Pepper · Post-op</div></div>
        <div className="cal-cell" />
        <div className="cal-cell" />
        <div className="cal-cell"><div className="cal-event">Oscar · Recheck</div></div>

        <div className="cal-time">3pm</div>
        <div className="cal-cell"><div className="cal-event">Bruno · Dental</div></div>
        <div className="cal-cell" />
        <div className="cal-cell">
          <div className="cal-event stella d3">
            Molly · De-sex<span className="mono">booked Mon 19:30</span>
          </div>
        </div>
        <div className="cal-cell"><div className="cal-event">Kira · Vacc</div></div>
        <div className="cal-cell" />

        <div className="cal-time">6pm</div>
        <div className="cal-cell" />
        <div className="cal-cell" />
        <div className="cal-cell" />
        <div className="cal-cell" />
        <div className="cal-cell">
          <div className="cal-event stella d4">
            Scout · Follow-up<span className="mono">booked Wed 21:08</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMock() {
  return (
    <div className="phone-mock">
      <div className="phone-screen">
        <div className="sms-header">
          <div className="sms-avatar">HV</div>
          <div className="sms-sender">Hills Veterinary</div>
          <div className="sms-number">+61 2 8417 5500</div>
        </div>
        <div className="sms-bubbles">
          <div>
            <div className="sms-bubble">
              Hi Tom — quick reminder: Buddy&apos;s annual check-up is <b>tomorrow at 10:00 AM</b> with Dr. Patel. Reply <b>YES</b> to confirm or <b>R</b> to reschedule.
            </div>
            <div className="sms-meta">
              <svg className="sms-check" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8.5L6.5 12L13 4" />
              </svg>{' '}
              Delivered · 3:42 PM
            </div>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <div className="sms-bubble sent">YES</div>
            <div className="sms-meta sent">3:44 PM</div>
          </div>
          <div>
            <div className="sms-bubble">
              Thanks Tom — Buddy&apos;s confirmed for tomorrow at 10:00 AM. See you then.
            </div>
            <div className="sms-meta">
              <svg className="sms-check" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8.5L6.5 12L13 4" />
              </svg>{' '}
              Delivered · 3:44 PM
            </div>
          </div>
          <div>
            <div className="sms-bubble" style={{ marginTop: 10 }}>
              <b>Recall:</b> Luna is due for her annual vaccinations this month. Shall I book a time? Reply with a day that suits.
            </div>
            <div className="sms-meta">
              <svg className="sms-check" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8.5L6.5 12L13 4" />
              </svg>{' '}
              Delivered · Just now
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NpsCard() {
  return (
    <div className="nps-card">
      <div className="nps-head">
        <div>
          <div className="nps-title">Net Promoter Score</div>
          <div className="nps-delta">+14 vs last 90 days</div>
        </div>
        <div className="nps-score">72<span className="unit">/100</span></div>
      </div>
      <svg className="nps-chart" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="cfNpsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D68F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00D68F" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,68 L30,62 L60,70 L90,58 L120,55 L150,50 L180,52 L210,42 L240,38 L270,32 L300,28 L330,22 L360,18 L400,14 L400,100 L0,100 Z" fill="url(#cfNpsGrad)" />
        <path d="M0,68 L30,62 L60,70 L90,58 L120,55 L150,50 L180,52 L210,42 L240,38 L270,32 L300,28 L330,22 L360,18 L400,14" fill="none" stroke="#00D68F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="400" cy="14" r="4" fill="#00D68F" />
        <circle cx="400" cy="14" r="8" fill="#00D68F" opacity="0.2" />
      </svg>
      <div className="comment-pills">
        <span className="comment-pill pos">&ldquo;Sarah was so helpful&rdquo;</span>
        <span className="comment-pill pos">&ldquo;Quick response&rdquo;</span>
        <span className="comment-pill pos">&ldquo;Felt heard&rdquo;</span>
        <span className="comment-pill">&ldquo;Easy booking&rdquo;</span>
        <span className="comment-pill pos">&ldquo;Dr. Chen was amazing&rdquo;</span>
        <span className="comment-pill pos">
          <span className="badge pos">PROMOTER</span>
          Posted to Google ↗
        </span>
        <span className="comment-pill neg">
          <span className="badge">DETRACTOR</span>
          Follow-up task created
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
        <span>142 responses · 90 days</span>
        <span>38 → Google · 3 detractors handled ✓</span>
      </div>
    </div>
  )
}
