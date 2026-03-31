import { LandingReveal } from './LandingReveal'

const STATS = [
  { label: 'Calls missed weekly per clinic',       value: '47',  suffix: 'avg.' },
  { label: 'Revenue lost per missed booking',      value: '$138', suffix: 'est.' },
  { label: 'Callers who don\'t leave voicemail',   value: '63%', suffix: 'of total' },
  { label: 'Receptionists who cite phone overload', value: '81%', suffix: 'surveyed' },
]

export function LandingProblem() {
  return (
    <section style={{ maxWidth: 1300, margin: '0 auto', padding: '120px 48px' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: '#4A5470', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 20, height: 1, background: '#4A5470', display: 'inline-block' }} />
        The bottleneck
      </div>

      <LandingReveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.05, color: '#F0F4FF', marginBottom: 24 }}>
              Your front desk<br /><span style={{ color: '#4A5470' }}>can't be everywhere</span><br />at once.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: '#8B95B0', maxWidth: 440, fontWeight: 400 }}>
              Vet clinics miss calls every single day — not just after hours. During lunch, in a consult room, mid-checkout. Each one is a booking gone elsewhere, a question unanswered, or an urgent case that waited too long.
            </p>
          </div>

          {/* Right — stats */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
            {STATS.map((s, i) => (
              <LandingReveal key={s.label} delay={i * 100}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '24px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  ...(i === 0 ? { borderTop: '1px solid rgba(255,255,255,0.07)' } : {}),
                }}>
                  <div style={{ fontSize: 14, color: '#8B95B0', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 500, color: '#F0F4FF', letterSpacing: '-1px' }}>
                    {s.value}{' '}
                    <span style={{ fontSize: 14, color: '#4A5470', fontWeight: 400, letterSpacing: 0 }}>{s.suffix}</span>
                  </div>
                </div>
              </LandingReveal>
            ))}
          </div>
        </div>
      </LandingReveal>
    </section>
  )
}
