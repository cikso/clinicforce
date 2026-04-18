import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'
import EditClinic from './_edit-clinic'
import InvitePanel from './_invite-panel'
import CoverageControl from './_coverage-control'
import DeleteClinicButton from './_delete-clinic'
import EmptyState from '@/app/components/ui/EmptyState'

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

  const [{ data: clinic }, { data: invites }, { data: users }, { data: voiceAgent }] = await Promise.all([
    service.from('clinics').select('*').eq('id', id).single(),
    service.from('clinic_invites').select('*').eq('clinic_id', id).order('created_at', { ascending: false }),
    service.from('clinic_users').select('id, name, role, created_at').eq('clinic_id', id).order('created_at'),
    service.from('voice_agents').select('twilio_phone_number').eq('clinic_id', id).maybeSingle(),
  ])

  if (!clinic) notFound()

  return (
    <div className="max-w-[760px]">
      {/* Breadcrumb — matches Settings / Insights header pattern */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] mb-1.5 cf-enter">
        <Link href="/overview" className="hover:text-[var(--text-primary)] transition-colors">
          Dashboard
        </Link>
        <span aria-hidden>/</span>
        <Link href="/admin" className="hover:text-[var(--text-primary)] transition-colors">
          Clinic Admin
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-primary)] font-medium truncate">{clinic.name}</span>
      </nav>

      {/* Clinic header */}
      <header className="flex items-start justify-between mb-6 cf-enter">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)] tracking-[-0.01em]">
              {clinic.name}
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
              style={{
                backgroundColor: clinic.onboarding_completed ? 'var(--success-light)' : 'var(--warning-light)',
                color:           clinic.onboarding_completed ? 'var(--success)'       : 'var(--warning)',
                border:          clinic.onboarding_completed
                  ? '1px solid rgba(var(--success-rgb), 0.2)'
                  : '1px solid rgba(var(--warning-rgb), 0.2)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
              {clinic.onboarding_completed ? 'Active' : 'Pending setup'}
            </span>
          </div>
          <p className="text-[14px] text-[var(--text-secondary)]">
            {VERTICAL_LABELS[clinic.vertical] ?? clinic.vertical} · {clinic.slug}
          </p>
        </div>
      </header>

      {/* Editable details card */}
      <EditClinic clinic={{ ...clinic, voice_phone: voiceAgent?.twilio_phone_number ?? null }} />

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
          <EmptyState
            icon={<Users className="w-6 h-6" strokeWidth={1.5} />}
            title="No users yet"
            description="Users added to this clinic via invite will appear here."
            className="py-8"
          />
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
                    backgroundColor: u.role === 'clinic_admin' ? 'var(--success-light)' : 'var(--bg-secondary)',
                    color:           u.role === 'clinic_admin' ? 'var(--success)'       : 'var(--text-secondary)',
                    border:          u.role === 'clinic_admin'
                      ? '1px solid rgba(var(--success-rgb), 0.2)'
                      : '1px solid var(--border)',
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

