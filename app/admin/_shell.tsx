'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Clinics', href: '/admin', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { label: 'Invites', href: '/admin/invites', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )},
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F4',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          height: 60,
          backgroundColor: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1B6B4A',
              letterSpacing: '-0.01em',
            }}
          >
            ClinicForce
          </span>
          <span
            style={{
              padding: '0.2rem 0.625rem',
              backgroundColor: 'rgba(27,107,74,0.2)',
              border: '1px solid rgba(27,107,74,0.4)',
              borderRadius: 999,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#4ade80',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Admin
          </span>
        </div>

        <Link
          href="/overview"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.825rem',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Back to Dashboard
        </Link>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Sidebar ── */}
        <nav
          style={{
            width: 220,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #E8E4DE',
            padding: '1.5rem 0.75rem',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#B0B0B0',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              padding: '0 0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            Management
          </p>
          {NAV.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1B6B4A' : '#4B4B4B',
                  backgroundColor: isActive ? 'rgba(27,107,74,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  marginBottom: '0.125rem',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* ── Main content ── */}
        <main
          style={{
            flex: 1,
            padding: '2.5rem',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
