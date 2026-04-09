import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getStatus(inv: { accepted_at: string | null; expires_at: string }) {
  if (inv.accepted_at) return 'accepted'
  if (new Date(inv.expires_at) < new Date()) return 'expired'
  return 'pending'
}

function statusStyles(s: string) {
  if (s === 'accepted') return { bg: '#ECFDF5', color: '#059669', border: 'rgba(5,150,105,0.2)' }
  if (s === 'expired') return { bg: 'var(--bg-secondary)', color: 'var(--text-tertiary)', border: 'var(--border)' }
  return { bg: '#FFFBEB', color: '#D97706', border: 'rgba(217,119,6,0.2)' }
}

export default async function InvitesPage() {
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: invites } = await service
    .from('clinic_invites')
    .select('id, email, role, token, accepted_at, expires_at, created_at, invited_by, clinic_id, clinics(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const pendingCount = invites?.filter((i) => getStatus(i) === 'pending').length ?? 0

  return (
    <div className="max-w-[860px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)] mb-1">
          All Invites
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          {pendingCount} pending · {invites?.length ?? 0} total
        </p>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_80px_100px_120px] gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          {['Email', 'Clinic', 'Role', 'Status', 'Sent'].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
              {h}
            </span>
          ))}
        </div>

        {!invites?.length ? (
          <div className="py-12 text-center">
            <p className="text-[14px] text-[var(--text-tertiary)]">No invites yet.</p>
          </div>
        ) : (
          invites.map((inv) => {
            const status = getStatus(inv)
            const st = statusStyles(status)
            const clinicName = (inv.clinics as { name?: string } | null)?.name ?? '—'
            return (
              <div
                key={inv.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_80px_100px_120px] gap-1 md:gap-3 px-5 py-3.5 items-center border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <span className="text-[14px] text-[var(--text-primary)] truncate">
                  {inv.email}
                </span>
                <span className="text-[13px] text-[var(--text-secondary)]">{clinicName}</span>
                <span className="text-[13px] text-[var(--text-secondary)]">
                  {inv.role === 'clinic_admin' ? 'Admin' : 'Staff'}
                </span>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold w-fit"
                  style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="text-[13px] text-[var(--text-tertiary)]">
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
