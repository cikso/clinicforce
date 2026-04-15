import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'

export const metadata: Metadata = { title: 'Audit log — ClinicForce' }
export const dynamic = 'force-dynamic'

type AuditRow = {
  id: string
  clinic_id: string | null
  actor_email: string | null
  action: string
  resource: string | null
  ip: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function badgeVariantFor(action: string): 'routine' | 'info' | 'urgent' | 'neutral' {
  if (action.startsWith('auth.login.failed') || action.startsWith('billing.usage.blocked')) {
    return 'urgent'
  }
  if (action.startsWith('mfa.') || action.startsWith('invite.') || action.startsWith('billing.')) {
    return 'info'
  }
  if (action.startsWith('admin.')) return 'neutral'
  return 'routine'
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default async function AuditLogPage() {
  const profile = await getClinicProfile()
  if (!profile) redirect('/login')

  const canRead =
    profile.userRole === 'clinic_admin' || profile.isPlatformOwner
  if (!canRead) redirect('/settings')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Platform owner sees everything; clinic_admin is scoped to their clinic.
  const scopedQuery = service
    .from('audit_log')
    .select('id, clinic_id, actor_email, action, resource, ip, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const query = profile.isPlatformOwner
    ? scopedQuery
    : scopedQuery.eq('clinic_id', profile.clinicId)

  const { data, error } = await query
  const rows: AuditRow[] = error ? [] : ((data ?? []) as AuditRow[])

  return (
    <div className="space-y-5 max-w-[960px]">
      <Card
        header={{
          title: 'Audit log',
          subtitle: profile.isPlatformOwner
            ? 'Platform-wide — last 200 events'
            : 'Security events for your clinic — last 200 events',
        }}
      >
        {error && (
          <p className="text-[12px] text-[var(--error)] mb-3">
            Could not load audit log: {error.message}
          </p>
        )}
        {rows.length === 0 ? (
          <p className="text-[13px] text-[var(--text-secondary)]">No events recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold border-b border-[var(--border-subtle)]">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Actor</th>
                  <th className="py-2 pr-3">Resource</th>
                  <th className="py-2 pr-3">IP</th>
                  {profile.isPlatformOwner && <th className="py-2 pr-3">Clinic</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b border-[var(--border-subtle)] align-top">
                    <td className="py-2 pr-3 font-mono-data whitespace-nowrap">{formatWhen(row.created_at)}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={badgeVariantFor(row.action)}>{row.action}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-[var(--text-secondary)] break-all">
                      {row.actor_email ?? <span className="text-[var(--text-tertiary)]">—</span>}
                    </td>
                    <td className="py-2 pr-3 text-[var(--text-secondary)] break-all">
                      {row.resource ?? <span className="text-[var(--text-tertiary)]">—</span>}
                    </td>
                    <td className="py-2 pr-3 font-mono-data text-[var(--text-secondary)]">{row.ip ?? '—'}</td>
                    {profile.isPlatformOwner && (
                      <td className="py-2 pr-3 font-mono-data text-[var(--text-tertiary)] break-all">
                        {row.clinic_id ?? '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
