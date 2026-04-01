import { LandingReveal } from './LandingReveal'

const STEPS = [
  {
    num: '01', active: true,
    title: 'Answer',
    desc: 'VetForce picks up within one ring. No hold music. No phone tree. The caller is greeted warmly and feels heard from the first word.',
  },
  {
    num: '02', active: false,
    title: 'Capture',
    desc: 'Owner name, pet name, breed, age, and reason for the call — gathered naturally through conversation, not a form.',
  },
  {
    num: '03', active: false,
    title: 'Assess',
    desc: 'Routine enquiry or potential emergency? VetForce reads the call and escalates time-sensitive cases immediately to the right person.',
  },
  {
    num: '04', active: false,
    title: 'Handoff',
    desc: "A structured intake note lands in your team's queue — prioritised, complete, and ready to act on. No voicemail to decode.",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" style={{ background: '#0D1220', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '120px 0' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 48px' }}>
        <LandingReveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 80, alignItems: 'end' }}>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.05, color: '#F0F4FF', margin: 0 }}>
              From first ring<br />to clean handoff<br />in seconds.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#8B95B0', alignSelf: 'end', margin: 0 }}>
              A reception workflow that runs itself — no configuration required after setup. The AI handles the call end-to-end so your team picks up exactly where it left off.
            </p>
          </div>
        </LandingReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
          {/* Connector line */}
          <div aria-hidden style={{ position: 'absolute', top: 28, left: 28, right: 28, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.07), rgba(255,255,255,0.12), rgba(255,255,255,0.07))', pointerEvents: 'none' }} />

          {STEPS.map((step, i) => (
            <LandingReveal key={step.num} delay={i * 100}>
              <div style={{ padding: '0 32px 0 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500,
                  marginBottom: 32, position: 'relative', zIndex: 1,
                  ...(step.active
                    ? { background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', color: '#00C896' }
                    : { background: '#161C2E', border: '1px solid rgba(255,255,255,0.12)', color: '#8B95B0' }),
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', color: '#F0F4FF', marginBottom: 12 }}>{step.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: '#8B95B0', fontWeight: 400 }}>{step.desc}</div>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
