'use client'

import { LandingReveal } from './LandingReveal'

const OUTCOMES = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-7" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    num: '+23%',
    label: 'Increase in captured booking requests',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v5l3 2" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="5" stroke="#00C896" strokeWidth="1.5"/></svg>,
    num: '4.1 hrs',
    label: 'Saved per week for front desk staff',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-5 3 3 2.5-3 2.5 5" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    num: '$2,800',
    label: 'Avg. recovered monthly revenue',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C4.69 2 2 4.69 2 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 3v3.5l2.5 1.5" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    num: '< 1 day',
    label: 'Time to go live after onboarding',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="#00C896" strokeWidth="1.5"/><path d="M6 8l1.5 1.5L10 6" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    num: '0 missed',
    label: 'Urgent cases since deployment',
  },
]

export function LandingBenefits() {
  return (
    <section id="outcomes" style={{ maxWidth: 1300, margin: '0 auto', padding: '120px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
      {/* Left — testimonial */}
      <LandingReveal>
        <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.08, color: '#F0F4FF', marginBottom: 48 }}>
          Practices see the difference<br />in the first week.
        </h2>

        <div style={{
          background: '#161C2E',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24, padding: 40,
          boxShadow: '0 24px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,200,150,0.3), transparent)' }} />
          <p style={{ fontSize: 18, lineHeight: 1.65, color: '#F0F4FF', fontWeight: 400, marginBottom: 28, letterSpacing: '-0.2px' }}>
            &ldquo;We were losing <strong style={{ color: '#00C896', fontWeight: 600 }}>3 to 5 bookings a day</strong> during lunch. VetForce was running by Wednesday afternoon, and by Friday our front desk coordinator said it felt like we&rsquo;d hired someone new.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2A3550, #1C2438)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#8B95B0' }}>SR</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FF', letterSpacing: '-0.2px' }}>Sarah Redmond</div>
              <div style={{ fontSize: 12, color: '#4A5470', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>Practice Manager — Northbridge Animal Hospital</div>
            </div>
          </div>
        </div>
      </LandingReveal>

      {/* Right — outcome pills */}
      <LandingReveal delay={200}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {OUTCOMES.map(o => (
            <div
              key={o.num}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px',
                background: '#161C2E',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                transition: 'border-color 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,200,150,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <div style={{ width: 36, height: 36, background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.15)', borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {o.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', color: '#00C896', lineHeight: 1 }}>{o.num}</div>
                <div style={{ fontSize: 13, color: '#8B95B0', marginTop: 2, fontWeight: 400 }}>{o.label}</div>
              </div>
            </div>
          ))}
        </div>
      </LandingReveal>
    </section>
  )
}
