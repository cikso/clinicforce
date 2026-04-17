import { ImageResponse } from 'next/og'

// ─── Default site OG image ───────────────────────────────────────────────────
// Generates a 1200×630 PNG at request time. Vercel caches it at the edge, so
// we only actually render once per deploy. Pages can override by adding their
// own `opengraph-image.tsx` in the route segment.

export const alt = 'ClinicForce — AI Receptionist for Veterinary Clinics'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand tokens mirrored from globals.css so the OG stays on brand if the
// primary tokens shift. If you update --color-brand, update BRAND below.
const BRAND = '#00D68F'
const BRAND_DARK = '#00B578'
const INK = '#0D0E12'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: `linear-gradient(135deg, #FFFFFF 0%, #F4F9F7 60%, #E6FBF2 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: BRAND,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            CF
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: INK,
              letterSpacing: '-0.03em',
            }}
          >
            ClinicForce
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: BRAND_DARK,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            AI Front Desk — Built for Clinics
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              color: INK,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              maxWidth: 1000,
            }}
          >
            Your clinic&apos;s phones, answered.
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: '#566275',
              lineHeight: 1.35,
              maxWidth: 980,
              marginTop: 8,
            }}
          >
            24/7 AI receptionist that takes bookings, triages urgency, and keeps your team focused.
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 24,
            color: '#566275',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: BRAND,
              }}
            />
            <span>clinicforce.io</span>
          </div>
          <div style={{ fontWeight: 600, color: INK }}>
            Built for Australian vet clinics
          </div>
        </div>
      </div>
    ),
    size,
  )
}
