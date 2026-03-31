'use client'

export function LandingNavbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: 1200,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'rgba(8,11,18,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo */}
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px', color: '#F0F4FF', textDecoration: 'none' }}>
        <div style={{ width: 28, height: 28, background: '#00C896', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="#080B12" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        VetForce
      </a>

      {/* Links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: 32, listStyle: 'none', margin: 0, padding: 0 }}>
        {(['Platform', 'How It Works', 'Outcomes'] as const).map(label => (
          <li key={label}>
            <a
              href={`#${label.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: '#8B95B0', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F0F4FF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8B95B0')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Status pill + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
          color: '#00C896',
          background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)',
          padding: '5px 12px', borderRadius: 100, letterSpacing: '0.5px',
        }}>
          <span style={{ width: 6, height: 6, background: '#00C896', borderRadius: '50%', display: 'inline-block', animation: 'lp-pulse-dot 2s ease-in-out infinite' }} />
          SYSTEM ONLINE
        </div>
        <a
          href="/overview"
          style={{ color: '#8B95B0', background: 'none', border: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F0F4FF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8B95B0')}
        >
          Log in
        </a>
        <a
          href="#"
          style={{
            background: '#00C896', color: '#080B12', border: 'none',
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
            cursor: 'pointer', padding: '9px 20px', borderRadius: 10,
            letterSpacing: '-0.2px', textDecoration: 'none',
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#00daa8'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,200,150,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#00C896'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
        >
          Book Demo
        </a>
      </div>
    </nav>
  )
}
