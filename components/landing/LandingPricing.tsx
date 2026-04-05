'use client'

import { LandingReveal } from './LandingReveal'

const STARTER_FEATURES = [
  'After-hours coverage (6pm–8am)',
  'Lunch break coverage',
  'Up to 300 calls / month',
  'AI triage + urgency detection',
  'Handover notes for your team',
  'Email support',
]

const GROWTH_FEATURES = [
  'Everything in Starter',
  'Daytime overflow coverage',
  'Unlimited calls',
  'Priority support',
  'Appointment booking via Sarah',
  'PMS handover note export',
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="rgba(0,200,150,0.15)" stroke="rgba(0,200,150,0.3)" strokeWidth="1" />
      <path d="M5 8l2 2 4-4" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LandingPricing() {
  return (
    <section style={{ maxWidth: 1300, margin: '0 auto', padding: '0 48px 120px' }}>
      <LandingReveal>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
            letterSpacing: '2px', textTransform: 'uppercase', color: '#4A5470',
            marginBottom: 20,
          }}>
            <span style={{ width: 20, height: 1, background: '#4A5470', display: 'inline-block' }} />
            Pricing
            <span style={{ width: 20, height: 1, background: '#4A5470', display: 'inline-block' }} />
          </div>
          <h2 style={{
            fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 800,
            letterSpacing: '-2.5px', lineHeight: 1.05, color: '#F0F4FF',
            margin: '0 0 16px',
          }}>
            Simple, transparent pricing.
          </h2>
          <p style={{ fontSize: 17, color: '#8B95B0', fontWeight: 400, margin: 0 }}>
            No setup fees. No lock-in. Live in under 24 hours.
          </p>
        </div>
      </LandingReveal>

      <LandingReveal delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 860, margin: '0 auto' }}>

          {/* Starter */}
          <div style={{
            background: '#0D1220',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '40px 36px',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4A5470', marginBottom: 16 }}>Starter</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-3px', color: '#F0F4FF', lineHeight: 1 }}>$399</span>
                <span style={{ fontSize: 15, color: '#4A5470', fontWeight: 400 }}>/mo</span>
              </div>
              <p style={{ fontSize: 14, color: '#4A5470', marginTop: 10, lineHeight: 1.5, fontWeight: 400 }}>
                Perfect for single-location clinics.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {STARTER_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#8B95B0', fontWeight: 400 }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(255,255,255,0.06)', color: '#F0F4FF',
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                padding: '13px 24px', borderRadius: 12,
                textDecoration: 'none', letterSpacing: '-0.2px',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >
              Book a Demo
            </a>
          </div>

          {/* Growth */}
          <div style={{
            background: '#0D1220',
            border: '1px solid rgba(0,200,150,0.4)',
            borderRadius: 20,
            padding: '40px 36px',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 0 40px rgba(0,200,150,0.05)',
          }}>
            {/* Most popular badge */}
            <div style={{
              position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
              background: '#00C896', color: '#080B12',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 100,
              whiteSpace: 'nowrap',
            }}>
              Most popular
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#00C896', marginBottom: 16 }}>Growth</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-3px', color: '#F0F4FF', lineHeight: 1 }}>$499</span>
                <span style={{ fontSize: 15, color: '#4A5470', fontWeight: 400 }}>/mo</span>
              </div>
              <p style={{ fontSize: 14, color: '#4A5470', marginTop: 10, lineHeight: 1.5, fontWeight: 400 }}>
                For busy clinics that need full-day coverage.
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {GROWTH_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#8B95B0', fontWeight: 400 }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#00C896', color: '#080B12',
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
                padding: '13px 24px', borderRadius: 12,
                textDecoration: 'none', letterSpacing: '-0.2px',
                border: 'none', transition: 'all 0.2s',
                boxShadow: '0 0 32px rgba(0,200,150,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00daa8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00C896'; e.currentTarget.style.transform = '' }}
            >
              Book a Demo
            </a>
          </div>
        </div>
      </LandingReveal>

      <LandingReveal delay={200}>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontSize: 15, color: '#8B95B0', marginBottom: 12, fontWeight: 400 }}>
            Multi-location or enterprise?{' '}
            <a
              href="mailto:hello@clinicforce.io"
              style={{ color: '#00C896', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
            >
              Let&rsquo;s talk. →
            </a>
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4A5470', letterSpacing: '0.5px' }}>
            NO SETUP FEES &nbsp;·&nbsp; NO LOCK-IN CONTRACTS &nbsp;·&nbsp; CANCEL ANYTIME
          </p>
        </div>
      </LandingReveal>
    </section>
  )
}
