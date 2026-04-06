import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const VERTICAL_LABELS: Record<string, string> = {
  vet:          'Veterinary',
  dental:       'Dental',
  gp:           'General Practice',
  chiro:        'Chiropractic',
  allied_health:'Allied Health',
  specialist:   'Specialist',
}

export default async function AdminPage() {
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: clinics } = await service
    .from('clinics')
    .select('id, name, slug, phone, vertical, onboarding_completed, created_at, suburb')
    .order('created_at', { ascending: false })

  const { data: invites } = await service
    .from('clinic_invites')
    .select('clinic_id, accepted_at, expires_at')

  // Count pending invites per clinic
  const pendingByClinic: Record<string, number> = {}
  invites?.forEach((inv) => {
    if (!inv.accepted_at && new Date(inv.expires_at) > new Date()) {
      pendingByClinic[inv.clinic_id] = (pendingByClinic[inv.clinic_id] ?? 0) + 1
    }
  })

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: '2rem',
              fontWeight: 400,
              color: '#1A1A1A',
              lineHeight: 1.2,
              marginBottom: '0.375rem',
            }}
          >
            Clinics
          </h1>
          <p style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', color: '#6B6B6B' }}>
            {clinics?.length ?? 0} clinic{clinics?.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Link
          href="/admin/clinics/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.25rem',
            backgroundColor: '#1B6B4A',
            color: '#ffffff',
            borderRadius: 10,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Clinic
        </Link>
      </div>

      {/* Table */}
      {!clinics?.length ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E8E4DE',
            borderRadius: 14,
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: "'DM Sans'", color: '#9B9B9B', fontSize: '0.9rem' }}>
            No clinics yet. Create your first clinic to get started.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E8E4DE',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 100px 100px 48px',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid #F0EDE8',
              backgroundColor: '#FAFAF9',
            }}
          >
            {['Clinic', 'Vertical', 'Location', 'Status', 'Invites', ''].map((h) => (
              <span
                key={h}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#9B9B9B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {clinics.map((clinic, i) => {
            const pending = pendingByClinic[clinic.id] ?? 0
            return (
              <div
                key={clinic.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 100px 100px 48px',
                  padding: '1rem 1.25rem',
                  alignItems: 'center',
                  borderBottom: i < clinics.length - 1 ? '1px solid #F0EDE8' : 'none',
                  transition: 'background-color 0.1s',
                }}
              >
                {/* Name */}
                <div>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.1rem' }}>
                    {clinic.name}
                  </p>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: '0.78rem', color: '#9B9B9B' }}>
                    {clinic.slug}
                  </p>
                </div>

                {/* Vertical */}
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.85rem', color: '#4B4B4B' }}>
                  {VERTICAL_LABELS[clinic.vertical] ?? clinic.vertical}
                </span>

                {/* Location */}
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.85rem', color: '#4B4B4B' }}>
                  {clinic.suburb ?? '—'}
                </span>

                {/* Status */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.625rem',
                    borderRadius: 999,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: clinic.onboarding_completed
                      ? 'rgba(27,107,74,0.08)'
                      : 'rgba(245,158,11,0.08)',
                    color: clinic.onboarding_completed ? '#1B6B4A' : '#B45309',
                    border: clinic.onboarding_completed
                      ? '1px solid rgba(27,107,74,0.2)'
                      : '1px solid rgba(245,158,11,0.2)',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                  {clinic.onboarding_completed ? 'Active' : 'Setup'}
                </span>

                {/* Invites */}
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.85rem', color: pending > 0 ? '#B45309' : '#9B9B9B' }}>
                  {pending > 0 ? `${pending} pending` : '—'}
                </span>

                {/* Action */}
                <Link
                  href={`/admin/clinics/${clinic.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    color: '#9B9B9B',
                    textDecoration: 'none',
                  }}
                  title="Manage clinic"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
