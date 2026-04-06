import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function InvitesPage() {
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: invites } = await service
    .from('clinic_invites')
    .select('id, email, role, token, accepted_at, expires_at, created_at, invited_by, clinic_id, clinics(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const now = new Date()

  function getStatus(inv: { accepted_at: string | null; expires_at: string }) {
    if (inv.accepted_at) return 'accepted'
    if (new Date(inv.expires_at) < now) return 'expired'
    return 'pending'
  }

  const statusStyle = (s: string): React.CSSProperties => ({
    padding: '0.2rem 0.625rem',
    borderRadius: 999,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.72rem',
    fontWeight: 600,
    backgroundColor:
      s === 'accepted' ? 'rgba(27,107,74,0.07)'
      : s === 'expired' ? '#F5F4F2'
      : 'rgba(245,158,11,0.07)',
    color:
      s === 'accepted' ? '#1B6B4A'
      : s === 'expired' ? '#9B9B9B'
      : '#B45309',
    border: `1px solid ${
      s === 'accepted' ? 'rgba(27,107,74,0.2)'
      : s === 'expired' ? '#E8E4DE'
      : 'rgba(245,158,11,0.2)'
    }`,
  })

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2rem', fontWeight: 400, color: '#1A1A1A', marginBottom: '0.375rem' }}>
          All Invites
        </h1>
        <p style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', color: '#6B6B6B' }}>
          {invites?.filter(i => getStatus(i) === 'pending').length ?? 0} pending · {invites?.length ?? 0} total
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E4DE', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 100px 120px', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F0EDE8', backgroundColor: '#FAFAF9' }}>
          {['Email', 'Clinic', 'Role', 'Status', 'Sent'].map((h) => (
            <span key={h} style={{ fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>

        {!invites?.length ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'DM Sans'", color: '#9B9B9B', fontSize: '0.9rem' }}>No invites yet.</p>
          </div>
        ) : (
          invites.map((inv, i) => {
            const status = getStatus(inv)
            const clinicName = (inv.clinics as { name?: string } | null)?.name ?? '—'
            return (
              <div
                key={inv.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 80px 100px 120px',
                  padding: '0.875rem 1.25rem',
                  alignItems: 'center',
                  borderBottom: i < invites.length - 1 ? '1px solid #F0EDE8' : 'none',
                }}
              >
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inv.email}
                </span>
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.85rem', color: '#4B4B4B' }}>{clinicName}</span>
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.82rem', color: '#6B6B6B' }}>
                  {inv.role === 'clinic_admin' ? 'Admin' : 'Staff'}
                </span>
                <span style={statusStyle(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span style={{ fontFamily: "'DM Sans'", fontSize: '0.8rem', color: '#9B9B9B' }}>
                  {new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
