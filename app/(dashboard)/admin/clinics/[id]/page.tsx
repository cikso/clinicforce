import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InvitePanel from './_invite-panel'

interface PageProps {
  params: Promise<{ id: string }>
}

const VERTICAL_LABELS: Record<string, string> = {
  vet: 'Veterinary', dental: 'Dental', gp: 'General Practice',
  chiro: 'Chiropractic', allied_health: 'Allied Health', specialist: 'Specialist',
}

export const dynamic = 'force-dynamic'

export default async function ClinicDetailPage({ params }: PageProps) {
  const { id } = await params

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: clinic }, { data: invites }, { data: users }] = await Promise.all([
    service.from('clinics').select('*').eq('id', id).single(),
    service.from('clinic_invites').select('*').eq('clinic_id', id).order('created_at', { ascending: false }),
    service.from('clinic_users').select('id, name, role, created_at').eq('clinic_id', id).order('created_at'),
  ])

  if (!clinic) notFound()

  const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <span style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', color: value ? '#1A1A1A' : '#C0C0C0' }}>{value ?? '—'}</span>
    </div>
  )

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Back */}
      <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#6B6B6B', textDecoration: 'none', marginBottom: '1.75rem' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        All Clinics
      </Link>

      {/* Clinic header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: '#1A1A1A' }}>
              {clinic.name}
            </h1>
            <span style={{
              padding: '0.2rem 0.625rem', borderRadius: 999, fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600,
              backgroundColor: clinic.onboarding_completed ? 'rgba(27,107,74,0.08)' : 'rgba(245,158,11,0.08)',
              color: clinic.onboarding_completed ? '#1B6B4A' : '#B45309',
              border: clinic.onboarding_completed ? '1px solid rgba(27,107,74,0.2)' : '1px solid rgba(245,158,11,0.2)',
            }}>
              {clinic.onboarding_completed ? 'Active' : 'Pending Setup'}
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans'", fontSize: '0.85rem', color: '#9B9B9B' }}>
            {VERTICAL_LABELS[clinic.vertical] ?? clinic.vertical} · {clinic.slug}
          </p>
        </div>
      </div>

      {/* Details card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E4DE', borderRadius: 14, padding: '1.75rem', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>Clinic details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
          <DetailRow label="Phone" value={clinic.phone} />
          <DetailRow label="Email" value={clinic.email} />
          <DetailRow label="Website" value={clinic.website} />
          <DetailRow label="Address" value={clinic.address} />
          <DetailRow label="Suburb" value={clinic.suburb} />
          <DetailRow label="Timezone" value={clinic.timezone} />
          <DetailRow label="Emergency partner" value={clinic.after_hours_partner} />
          <DetailRow label="Emergency phone" value={clinic.after_hours_phone} />
          <DetailRow label="Emergency address" value={clinic.emergency_partner_address} />
        </div>
      </div>

      {/* Users card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E4DE', borderRadius: 14, padding: '1.75rem', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
          Users ({users?.length ?? 0})
        </p>
        {!users?.length ? (
          <p style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#9B9B9B' }}>No users yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {users.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < users.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                <div>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A' }}>{u.name ?? '—'}</p>
                </div>
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: 999, fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600,
                  backgroundColor: u.role === 'clinic_admin' ? 'rgba(27,107,74,0.07)' : '#F5F4F2',
                  color: u.role === 'clinic_admin' ? '#1B6B4A' : '#6B6B6B',
                  border: u.role === 'clinic_admin' ? '1px solid rgba(27,107,74,0.2)' : '1px solid #E8E4DE',
                }}>
                  {u.role === 'clinic_admin' ? 'Admin' : u.role === 'staff' ? 'Staff' : 'Receptionist'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite panel — client component */}
      <InvitePanel clinicId={clinic.id} clinicName={clinic.name} invites={invites ?? []} />
    </div>
  )
}
