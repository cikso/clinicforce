'use client'

import { useEffect, useRef, useState } from 'react'

const WAVE_HEIGHTS = [8,14,20,28,18,32,24,16,10,22,34,18,12,26,20,14,30,22,16,10,18,28,20,12,24,32,18,14,22,16,10,28,20,14,18,24,16,12,26,20]
const AI_TEXT = "This sounds like it could be a GDV — I'm flagging this as urgent and notifying the team right now. Can you head to the clinic immediately?"

export function LandingHero() {
  const [timerSecs, setTimerSecs]   = useState(134)
  const [aiTyped, setAiTyped]       = useState('')
  const [showTyping, setShowTyping] = useState(true)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const typeRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    typeRef.current = setTimeout(() => {
      setShowTyping(false)
      let i = 0
      const type = () => {
        if (i < AI_TEXT.length) {
          setAiTyped(AI_TEXT.slice(0, ++i))
          typeRef.current = setTimeout(type, 28)
        }
      }
      type()
    }, 1800)
    return () => { if (typeRef.current) clearTimeout(typeRef.current) }
  }, [])

  const mm = String(Math.floor(timerSecs / 60)).padStart(2, '0')
  const ss = String(timerSecs % 60).padStart(2, '0')

  return (
    <section style={{
      minHeight: '100dvh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'center',
      maxWidth: 1300,
      margin: '0 auto',
      padding: '120px 48px 80px',
      gap: 80,
      position: 'relative',
    }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: '40%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(100,120,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
          letterSpacing: '1.5px', textTransform: 'uppercase', color: '#00C896',
          marginBottom: 28,
          animation: 'lp-fade-up 0.6s ease forwards 0.2s',
        }}>
          <span style={{ width: 24, height: 1, background: '#00C896', display: 'inline-block' }} />
          Purpose-built for veterinary clinics
        </div>

        <h1 style={{
          fontSize: 'clamp(44px, 5.5vw, 76px)', fontWeight: 800,
          lineHeight: 1.0, letterSpacing: '-3px', color: '#F0F4FF',
          marginBottom: 24,
          animation: 'lp-fade-up 0.7s ease forwards 0.35s',
        }}>
          The front desk<br />that never<br /><em style={{ fontStyle: 'normal', color: '#00C896' }}>clocks out.</em>
        </h1>

        <p style={{
          fontSize: 18, fontWeight: 400, lineHeight: 1.65, color: '#8B95B0',
          maxWidth: 480, marginBottom: 40,
          animation: 'lp-fade-up 0.7s ease forwards 0.5s',
        }}>
          ClinicForce handles every call your team can't take — intake, triage, urgency detection, and clean handoff. Installed in a day. Live the same week.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          animation: 'lp-fade-up 0.7s ease forwards 0.65s',
        }}>
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
              transition: 'all 0.2s', letterSpacing: '-0.2px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F0F4FF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8B95B0'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
            </svg>
            See it live
          </a>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          marginTop: 52, paddingTop: 40,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          animation: 'lp-fade-up 0.7s ease forwards 0.8s',
        }}>
          {[
            { num: '0.4s', label: 'Avg. response time' },
            { num: '100%', label: 'Call answer rate' },
            { num: '24/7', label: 'Active coverage' },
          ].map((stat, i) => (
            <div key={stat.num} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)', margin: '0 32px' }} />}
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: '#F0F4FF', lineHeight: 1 }}>{stat.num}</div>
                <div style={{ fontSize: 12, color: '#4A5470', fontWeight: 500, marginTop: 4, letterSpacing: '0.2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', animation: 'lp-fade-left 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.4s' }}>
        <div style={{
          background: '#161C2E', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24, padding: 28,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,200,150,0.4), transparent)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color: '#00C896', letterSpacing: '0.5px' }}>
              <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
                <span style={{ position: 'absolute', inset: 0, background: '#00C896', borderRadius: '50%' }} />
                <span style={{ position: 'absolute', inset: -3, border: '1.5px solid #00C896', borderRadius: '50%', opacity: 0.4, animation: 'lp-ring-pulse 2s ease-in-out infinite' }} />
              </span>
              LIVE CALL — HANDLING
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, color: '#4A5470' }}>{mm}:{ss}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[{ label: 'PATIENT', value: 'Buster, Great Dane' }, { label: 'OWNER', value: 'Michael Tan' }].map(m => (
              <div key={m.label} style={{ background: '#141928', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#4A5470', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FF', letterSpacing: '-0.3px' }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32, marginBottom: 20 }}>
            {WAVE_HEIGHTS.map((h, i) => (
              <div key={i} style={{
                width: 3, height: h, background: '#00C896', borderRadius: 2,
                transformOrigin: 'center',
                animation: `lp-wave ${1.2 + (i % 4) * 0.15}s ease-in-out infinite ${(i * 0.06).toFixed(2)}s`,
              }} />
            ))}
          </div>

          <div style={{ background: '#0D1220', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', background: 'rgba(255,200,100,0.15)', color: '#FFC864', border: '1px solid rgba(255,200,100,0.2)', marginTop: 1 }}>MT</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: '#D4BF8A', flex: 1, paddingTop: 2 }}>&ldquo;He&rsquo;s been retching but nothing&rsquo;s coming up — his stomach feels hard and distended.&rdquo;</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', background: 'rgba(0,200,150,0.15)', color: '#00C896', border: '1px solid rgba(0,200,150,0.2)', marginTop: 1 }}>VF</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: '#8B95B0', flex: 1, paddingTop: 2, minHeight: 22 }}>
                {showTyping ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span key={i} style={{ width: 5, height: 5, background: '#00C896', borderRadius: '50%', display: 'inline-block', animation: `lp-typing 1.2s ease-in-out infinite ${delay}s`, opacity: 0.5 }} />
                    ))}
                  </div>
                ) : aiTyped}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)', borderRadius: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4A5470', letterSpacing: '0.8px', textTransform: 'uppercase' }}>URGENCY ASSESSMENT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#00C896', borderRadius: 2, width: 0, animation: 'lp-fill-bar 1.2s cubic-bezier(0.16,1,0.3,1) forwards 1.2s' }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, color: '#00C896' }}>HIGH</div>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: -18, right: 24,
          background: '#0D1220', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 16px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'lp-float-in 0.7s cubic-bezier(0.16,1,0.3,1) forwards 1.4s',
        }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 5l5 4 5-4" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="#00C896" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#F0F4FF' }}>Summary sent to Dr. Patel</div>
            <div style={{ fontSize: 11, color: '#4A5470', marginTop: 1 }}>Intake note + urgency flag — just now</div>
          </div>
        </div>
      </div>
    </section>
  )
}
