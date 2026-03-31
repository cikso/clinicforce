const ITEMS = [
  'Call Answering', 'Urgency Detection', 'Intake Capture',
  'Appointment Booking', 'Structured Handoff', 'After-Hours Coverage',
  'PMS Integration', 'SMS Follow-up', 'Overflow Handling',
  'Staff Relief', 'Zero Missed Calls', 'Live in 24 Hours',
]

export function LandingTrustStrip() {
  const all = [...ITEMS, ...ITEMS]

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '20px 0',
      overflow: 'hidden',
      position: 'relative',
      background: 'rgba(255,255,255,0.015)',
    }}>
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: 'lp-marquee 30s linear infinite',
      }}>
        {all.map((text, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '0 48px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, fontWeight: 500,
            color: '#4A5470',
            letterSpacing: '1px', textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ width: 4, height: 4, background: '#00C896', borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
