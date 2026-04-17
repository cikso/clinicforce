import { createClient } from '@supabase/supabase-js'
import { Mail } from 'lucide-react'
import EmptyState from '@/app/components/ui/EmptyState'
import InvitesTable, { type InviteRow } from './InvitesTable'

export const dynamic = 'force-dynamic'

function getStatus(inv: { accepted_at: string | null; expires_at: string | null }): 'pending' | 'accepted' | 'expired' {
  if (inv.accepted_at) return 'accepted'
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) return 'expired'
  return 'pending'
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

  const rows: InviteRow[] = (invites ?? []).map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    created_at: inv.created_at,
    status: getStatus(inv),
    clinicName: (inv.clinics as { name?: string } | null)?.name ?? '—',
  }))

  const pendingCount = rows.filter((r) => r.status === 'pending').length

  return (
    <div className="max-w-[860px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)] mb-1">
          All Invites
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          {pendingCount} pending · {rows.length} total
        </p>
      </div>

      <InvitesTable
        rows={rows}
        emptyState={
          <EmptyState
            icon={<Mail className="w-6 h-6" strokeWidth={1.5} />}
            title="No invites yet"
            description="Invitations sent to new clinics will appear here with their status."
          />
        }
      />
    </div>
  )
}
