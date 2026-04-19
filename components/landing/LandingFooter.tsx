'use client'

import Link from 'next/link'

type FooterLink = { label: string; href: string; internal?: boolean }

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Platform', href: '#' },
  { label: 'Integrations', href: '#' },
  { label: 'Trust & Security', href: '/trust', internal: true },
  { label: 'Privacy', href: '/privacy', internal: true },
  { label: 'Terms', href: '/terms', internal: true },
  { label: 'Contact', href: '#' },
]

export function LandingFooter() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: 48,
      maxWidth: 1300,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 24,
    }}>
      {/* Brand */}
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 15, color: '#F0F4FF', textDecoration: 'none', letterSpacing: '-0.2px' }}>
        <div style={{ width: 28, height: 28, background: '#00C896', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="#080B12" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        ClinicForce
      </a>

      {/* Links */}
      <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }}>
        {FOOTER_LINKS.map(({ label, href, internal }) => {
          const linkStyle = { fontSize: 13, color: '#4A5470', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }
          const onEnter = (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.color = '#8B95B0' }
          const onLeave = (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.color = '#4A5470' }
          return (
            <li key={label}>
              {internal ? (
                <Link href={href} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                  {label}
                </Link>
              ) : (
                <a href={href} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                  {label}
                </a>
              )}
            </li>
          )
        })}
      </ul>

      {/* Copyright */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4A5470', letterSpacing: '0.5px' }}>
        © 2026 ClinicForce &nbsp;·&nbsp; ALL SYSTEMS OPERATIONAL
      </div>
    </footer>
  )
}
