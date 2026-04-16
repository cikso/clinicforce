import Link from 'next/link'

export default function OnboardingCompletePage() {
  const CHECKLIST = [
    'Clinic details saved',
    'Opening hours configured',
    'Call handling configured',
  ]

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Success icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(23,196,190,0.1)',
          border: '2px solid rgba(23,196,190,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.75rem',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00D68F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: '2.25rem',
          fontWeight: 700,
          color: '#1A1A1A',
          lineHeight: 1.2,
          marginBottom: '0.75rem',
        }}
      >
        You&apos;re all set up
      </h1>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '1rem',
          color: '#6B6B6B',
          lineHeight: 1.6,
          marginBottom: '2.25rem',
          maxWidth: 400,
        }}
      >
        Your AI receptionist is configured and ready to take calls. Head to your dashboard to go live.
      </p>

      {/* Checklist */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #E8E4DE',
          borderRadius: 14,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {CHECKLIST.map((item, i) => (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0',
              borderBottom: i < CHECKLIST.length - 1 ? '1px solid #F0EDE8' : 'none',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: '#00D68F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                color: '#1A1A1A',
                fontWeight: 500,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/overview"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          maxWidth: 360,
          padding: '0.9rem 1.5rem',
          backgroundColor: '#00D68F',
          color: '#ffffff',
          borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.95rem',
          fontWeight: 600,
          textDecoration: 'none',
          justifyContent: 'center',
        }}
      >
        Go to Dashboard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.8rem',
          color: '#B0B0B0',
          marginTop: '1.25rem',
        }}
      >
        You can update these settings anytime from your clinic settings page.
      </p>
    </div>
  )
}
