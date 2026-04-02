'use client'
import { LandingReveal } from './LandingReveal'

export function LandingCta() {
  return (
    <section style={{ maxWidth: 1300, margin: '0 auto', padding: '0 48px 120px' }}>
      <LandingReveal>
        <div style={{
          background: '#161C2E',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 32, padding: '80px',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Top glow */}
          <div aria-hidden style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(0,200,150,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 800, letterSpacing: '-3px', lineHeight: 1.0, color: '#F0F4FF', marginBottom: 20, position: 'relative' }}>
            Your clinic.<br />Always open.
          </h2>
          <p style={{ fontSize: 18, color: '#8B95B0', marginBottom: 40, fontWeight: 400, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6, position: 'relative' }}>
            Start with one location. See results in the first week. No long-term commitment required.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', position: 'relative' }}>
            <a
              href="https://calendly.com/ciks35/30min"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#00C896', color: '#080B12',
                fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700,
                padding: '14px 28px', borderRadius: 12, border: 'none',
                textDecoration: 'none', letterSpacing: '-0.3px',
                transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: '0 0 40px rgba(0,200,150,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00daa8'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,200,150,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00C896'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,200,150,0.2)' }}
            >
              Book a Demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="/overview"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: '#8B95B0', fontSize: 15, fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                padding: '14px 24px', borderRadius: 12, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F0F4FF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8B95B0'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              View the dashboard
            </a>
          </div>
          <p style={{ marginTop: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4A5470', letterSpacing: '0.5px', position: 'relative' }}>
            NO SETUP FEES &nbsp;·&nbsp; NO CONTRACTS &nbsp;·&nbsp; LIVE IN &lt;24 HOURS
          </p>
        </div>
      </LandingReveal>
    </section>
  )
}
