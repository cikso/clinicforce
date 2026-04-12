import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import InvitePanel from './_invite-panel'
import CoverageControl from './_coverage-control'
import DeleteClinicButton from './_delete-clinic'

interface PageProps {
  params: Promise<{ id: string }>
}

const VERTICAL_LABELS: Record<string, string> = {
  vet: 'Veterinary', dental: 'Dental', gp: 'General Practice',
  chiro: 'Chiropractic', allied_health: 'Allied Health', specialist: 'Specialist',
}

const ROLE_LABELS: Record<string, string> = {
  clinic_admin: 'Admin',
  staff: 'Staff',
  receptionist: 'Receptionist',
  vet: 'Vet',
  nurse: 'Nurse',
  platform_owner: 'Platform Owner',
}

export const dynamic = 'force-dynamic'

export default async function ClinicDetailPage({ params }: PageProps) {
  const { id } = await params

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const [{ data: clinic }, { data: invites }, { data: users }] = await Promise.all([
    service.from('clinics').select('*').eq('id', id).single(),
    service.from('clinic_invites').select('*').eq('clinic_id', id).order('created_at', { ascending: false }),
    service.from('clinic_users').select('id, name, role, created_at').eq('clinic_id', id).order('created_at'),
  ])

  if (!clinic) notFound()

  return (
    <div className="max-w-[760px]">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 2L4 7l6 5" />
        </svg>
        All Clinics
      </Link>

      {/* Clinic header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)]">
              {clinic.name}
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
              style={{
                backgroundColor: clinic.onboarding_completed ? '#ECFDF5' : '#FFFBEB',
                color: clinic.onboarding_completed ? '#059669' : '#D97706',
                border: `1px solid ${clinic.onboarding_completed ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)'}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
              {clinic.onboarding_completed ? 'Active' : 'Pending Setup'}
            </span>
          </div>
          <p className="text-[14px] text-[var(--text-secondary)]">
            {VERTICAL_LABELS[clinic.vertical] ?? clinic.vertical} · {clinic.slug}
          </p>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)] mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-4">
          Clinic details
        </p>
        <div className="grid grid-cols-3 gap-5">
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

      {/* Coverage Control */}
      <CoverageControl
        clinicId={clinic.id}
        clinicName={clinic.name}
        initialMode={clinic.coverage_mode ?? 'after_hours'}
        activatedAt={clinic.coverage_mode_activated_at ?? null}
        activatedBy={clinic.coverage_mode_activated_by ?? null}
      />

      {/* Users card */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)] mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-4">
          Users ({users?.length ?? 0})
        </p>
        {!users?.length ? (
          <p className="text-[14px] text-[var(--text-tertiary)]">No users yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  {u.name ?? '—'}
                </p>
                <span
                  className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                  style={{
                    backgroundColor: u.role === 'clinic_admin' ? '#ECFDF5' : 'var(--bg-secondary)',
                    color: u.role === 'clinic_admin' ? '#059669' : 'var(--text-secondary)',
                    border: `1px solid ${u.role === 'clinic_admin' ? 'rgba(5,150,105,0.2)' : 'var(--border)'}`,
                  }}
                >
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite panel — client component */}
      <InvitePanel clinicId={clinic.id} clinicName={clinic.name} invites={invites ?? []} />

      {/* Danger zone */}
      <div className="mt-8">
        <DeleteClinicButton clinicId={clinic.id} clinicName={clinic.name} />
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className={`text-[14px] ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}
