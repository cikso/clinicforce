'use client'

import { useRef } from 'react'
import { LandingReveal } from './LandingReveal'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="#00C896" strokeWidth="1.5"/>
        <path d="M10 6v4l3 2" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Always-on Coverage',
    desc: 'Activates the moment reception is unavailable. Lunch, meetings, sick days, after-hours. Every call answered, every time.',
    span: 5,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3L3 17h14L10 3z" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9v4M10 14.5v.5" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Urgency Detection',
    desc: 'Distinguishes a routine booking from a GDV presentation. Flags critical cases and escalates immediately.',
    span: 4,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="#00C896" strokeWidth="1.5"/>
        <path d="M7 9h6M7 12h4" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Structured Handoff Notes',
    desc: 'Every call ends with a clean SOAP-style summary — ready for your team to act on, not decode.',
    span: 4,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 4h12v9a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="#00C896" strokeWidth="1.5"/>
        <path d="M8 17h4" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'PMS Integration',
    desc: 'Designed to sync intake notes directly into Ezyvet, Provet Cloud, and leading practice management systems.',
    span: 4,
  },
]

const METRICS = [
  { label: 'Response time', value: '0.4', unit: 'seconds' },
  { label: 'Calls answered', value: '100', unit: 'percent' },
  { label: 'Setup time', value: '<1', unit: 'business day' },
  { label: 'Contracts required', value: 'None', unit: '' },
  { label: 'Uptime', value: '99.9', unit: 'percent' },
]

export function LandingFeatures() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleMouseMove = (i: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRefs.current[i]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
    card.style.setProperty('--mx', x + '%')
    card.style.setProperty('--my', y + '%')
  }

  return (
    <section id="platform" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 48px 120px' }}>
      <LandingReveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.05, color: '#F0F4FF', margin: 0 }}>
            Built for the<br />operational reality<br />of vet medicine.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#8B95B0', alignSelf: 'end', margin: 0 }}>
            Not a generic chatbot with a pet theme. Every feature is designed around the specific workflows, urgencies, and communication styles of veterinary front desks.
          </p>
        </div>
      </LandingReveal>

      {/* Bento grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: 240, gap: 16 }}>
        {/* Card 1 — span 5 */}
        <LandingReveal className="contents">
          <div
            ref={el => { cardRefs.current[0] = el }}
            onMouseMove={handleMouseMove(0)}
            style={{ gridColumn: 'span 5', gridRow: 'span 1', ...bentoCardStyle }}
          >
            <BentoSpotlight />
            <div style={bentoIconStyle}>{FEATURES[0].icon}</div>
            <div style={bentoTitleStyle}>{FEATURES[0].title}</div>
            <div style={bentoDescStyle}>{FEATURES[0].desc}</div>
          </div>
        </LandingReveal>

        {/* Card 2 — span 7 with mini chat */}
        <LandingReveal delay={100} className="contents">
          <div
            ref={el => { cardRefs.current[1] = el }}
            onMouseMove={handleMouseMove(1)}
            style={{ gridColumn: 'span 7', gridRow: 'span 1', ...bentoCardStyle, position: 'relative' }}
          >
            <BentoSpotlight />
            <div style={{ maxWidth: 260 }}>
              <div style={bentoIconStyle}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M4 6h8M4 14h6" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={bentoTitleStyle}>Natural Conversation Intake</div>
              <div style={bentoDescStyle}>Captures owner name, pet name, breed, age, and reason for call — through natural conversation, not a phone tree.</div>
            </div>
            {/* Mini chat UI */}
            <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, width: 200 }}>
              <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, lineHeight: 1.5, background: '#141928', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.07)', alignSelf: 'flex-start', maxWidth: 170 }}>
                "Hi, I'm calling about my cat Mango — she hasn't eaten in two days."
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 11, lineHeight: 1.5, background: 'rgba(0,200,150,0.1)', color: '#00C896', border: '1px solid rgba(0,200,150,0.2)', alignSelf: 'flex-end', maxWidth: 160, fontFamily: "'JetBrains Mono', monospace" }}>
                INTAKE CAPTURED — ESCALATING
              </div>
            </div>
          </div>
        </LandingReveal>

        {/* Cards 3–5 — span 4 each */}
        {FEATURES.slice(1).map((f, i) => (
          <LandingReveal key={f.title} delay={(i + 1) * 100} className="contents">
            <div
              ref={el => { cardRefs.current[i + 2] = el }}
              onMouseMove={handleMouseMove(i + 2)}
              style={{ gridColumn: 'span 4', gridRow: 'span 1', ...bentoCardStyle }}
            >
              <BentoSpotlight />
              <div style={bentoIconStyle}>{f.icon}</div>
              <div style={bentoTitleStyle}>{f.title}</div>
              <div style={bentoDescStyle}>{f.desc}</div>
            </div>
          </LandingReveal>
        ))}

        {/* Metrics bar — span 12 */}
        <LandingReveal className="contents">
          <div style={{
            gridColumn: 'span 12',
            background: '#161C2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24,
            display: 'flex', alignItems: 'center', gap: 0,
            padding: '28px 36px', height: 'auto',
            flexWrap: 'wrap',
          }}>
            {METRICS.map((m, i) => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 1, height: 52, background: 'rgba(255,255,255,0.07)', margin: '0 32px' }} />}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.5px', color: '#F0F4FF', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 500, color: i === 0 ? '#00C896' : '#F0F4FF', letterSpacing: '-2px', lineHeight: 1 }}>
                    {m.value}
                    {m.unit && <span style={{ fontSize: 16, color: '#4A5470', marginLeft: 4, letterSpacing: 0 }}>{m.unit}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </LandingReveal>
      </div>
    </section>
  )
}

function BentoSpotlight() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(0,200,150,0.04), transparent 60%)',
      pointerEvents: 'none', borderRadius: 'inherit',
      opacity: 0, transition: 'opacity 0.3s',
    }} className="bento-spotlight" />
  )
}

const bentoCardStyle: React.CSSProperties = {
  background: '#161C2E',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 24,
  padding: 32,
  overflow: 'hidden',
  position: 'relative',
  transition: 'border-color 0.3s, box-shadow 0.3s',
}

const bentoIconStyle: React.CSSProperties = {
  width: 40, height: 40,
  background: 'rgba(0,200,150,0.15)',
  border: '1px solid rgba(0,200,150,0.15)',
  borderRadius: 12,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: 20,
}

const bentoTitleStyle: React.CSSProperties = {
  fontSize: 17, fontWeight: 700, letterSpacing: '-0.5px',
  color: '#F0F4FF', marginBottom: 8,
}

const bentoDescStyle: React.CSSProperties = {
  fontSize: 14, lineHeight: 1.6, color: '#8B95B0', fontWeight: 400,
}
