'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Building2, SearchX } from 'lucide-react'
import EmptyState from '@/app/components/ui/EmptyState'

export interface AdminClinic {
  id: string
  name: string
  slug: string
  vertical: string
  suburb: string | null
  phone: string | null
  onboarding_completed: boolean
  created_at: string
  user_count: number
  plan: string | null
  plan_status: string | null
  trial_ends_at: string | null
}

interface Props {
  clinics: AdminClinic[]
  totalUsers: number
  canCreateClinic?: boolean
}

const VERTICAL_LABELS: Record<string, string> = {
  vet: 'Veterinary',
  dental: 'Dental',
  gp: 'General Practice',
  chiro: 'Chiropractic',
  allied_health: 'Allied Health',
  specialist: 'Specialist',
}

const VERTICAL_OPTIONS = [
  { value: '', label: 'All Industries' },
  { value: 'vet', label: 'Veterinary' },
  { value: 'dental', label: 'Dental' },
  { value: 'gp', label: 'General Practice' },
  { value: 'chiro', label: 'Chiropractic' },
  { value: 'allied_health', label: 'Allied Health' },
  { value: 'specialist', label: 'Specialist' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'setup', label: 'Setup' },
  { value: 'trialing', label: 'Trial' },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getClinicStatus(clinic: AdminClinic): { label: string; color: string; bg: string; border: string } {
  if (clinic.onboarding_completed) {
    return { label: 'Active', color: '#059669', bg: '#ECFDF5', border: 'rgba(5,150,105,0.2)' }
  }
  return { label: 'Setup', color: '#D97706', bg: '#FFFBEB', border: 'rgba(217,119,6,0.2)' }
}

function getPlanLabel(plan: string | null): string {
  if (!plan) return '—'
  const map: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise', trial: 'Trial' }
  return map[plan] ?? plan.charAt(0).toUpperCase() + plan.slice(1)
}

export default function AdminDashboardClient({ clinics, totalUsers, canCreateClinic = true }: Props) {
  const [search, setSearch] = useState('')
  const [verticalFilter, setVerticalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // KPIs
  const totalClinics = clinics.length
  const activeClinics = clinics.filter((c) => c.onboarding_completed).length
  const activeTrials = clinics.filter((c) => c.plan_status === 'trialing').length

  // Filtered clinics
  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      // Search
      if (search) {
        const q = search.toLowerCase()
        const matchName = c.name.toLowerCase().includes(q)
        const matchSlug = c.slug.toLowerCase().includes(q)
        const matchSuburb = c.suburb?.toLowerCase().includes(q)
        if (!matchName && !matchSlug && !matchSuburb) return false
      }
      // Vertical
      if (verticalFilter && c.vertical !== verticalFilter) return false
      // Status
      if (statusFilter === 'active' && !c.onboarding_completed) return false
      if (statusFilter === 'setup' && c.onboarding_completed) return false
      if (statusFilter === 'trialing' && c.plan_status !== 'trialing') return false
      return true
    })
  }, [clinics, search, verticalFilter, statusFilter])

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)]">
            Clinic Admin
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            Create clinics, manage invitations, and review platform access
          </p>
        </div>
        {canCreateClinic && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/owners"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--border)] text-[var(--text-primary)] text-[14px] font-semibold hover:bg-[var(--bg-secondary)] active:scale-[0.98] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="4.5" r="2" />
                <path d="M1.5 12c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" />
                <circle cx="10" cy="4" r="1.5" />
                <path d="M12.5 11c0-1.5-1-2.5-2.2-2.7" />
              </svg>
              Owners
            </Link>
            <Link
              href="/admin/clinics/new"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 2v10M2 7h10" />
              </svg>
              New Clinic
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total Clinics"
          value={totalClinics}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="6" height="6" rx="1" />
              <rect x="10" y="2" width="6" height="6" rx="1" />
              <rect x="2" y="10" width="6" height="6" rx="1" />
              <rect x="10" y="10" width="6" height="6" rx="1" />
            </svg>
          }
        />
        <KPICard
          label="Active Clinics"
          value={activeClinics}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round">
              <path d="M15 5L7 13l-4-4" />
            </svg>
          }
          iconBg="#ECFDF5"
        />
        <KPICard
          label="Total Users"
          value={totalUsers}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="6" r="3" />
              <path d="M2 16v-1a5 5 0 0 1 10 0v1" />
              <path d="M12 4a3 3 0 0 1 0 5.2" />
              <path d="M16 16v-1a3.5 3.5 0 0 0-2-3.2" />
            </svg>
          }
        />
        <KPICard
          label="Active Trials"
          value={activeTrials}
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="7" />
              <path d="M9 5v4l2.5 2.5" />
            </svg>
          }
          iconBg="#FFFBEB"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M14 14l-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search clinics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 outline-none transition-all"
          />
        </div>
        <select
          value={verticalFilter}
          onChange={(e) => setVerticalFilter(e.target.value)}
          className="h-10 px-3 pr-8 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--brand)] transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
          }}
        >
          {VERTICAL_OPTIONS.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 pr-8 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--brand)] transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-[13px] text-[var(--text-tertiary)] mb-3">
        {filtered.length === clinics.length
          ? `${clinics.length} clinic${clinics.length !== 1 ? 's' : ''}`
          : `${filtered.length} of ${clinics.length} clinics`}
      </p>

      {/* Clinic Table */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_0.8fr_0.8fr_0.6fr_0.8fr_44px] gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          {['Clinic', 'Industry', 'Plan', 'Status', 'Users', 'Created', ''].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
              {h}
            </span>
          ))}
        </div>

        {!filtered.length ? (
          clinics.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-6 h-6" strokeWidth={1.5} />}
              title="No clinics yet"
              description="Create your first clinic to get started. Invites, coverage, and voice agents are all managed per clinic."
            />
          ) : (
            <EmptyState
              icon={<SearchX className="w-6 h-6" strokeWidth={1.5} />}
              title="No clinics match your filters"
              description="Try a different search term or clear the filters to see all clinics."
            />
          )
        ) : (
          filtered.map((clinic) => {
            const status = getClinicStatus(clinic)
            return (
              <div
                key={clinic.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_0.8fr_0.8fr_0.6fr_0.8fr_44px] gap-1 md:gap-3 px-5 py-3.5 items-center border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                {/* Clinic Name */}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                    {clinic.name}
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)] truncate">
                    {clinic.slug}{clinic.suburb ? ` · ${clinic.suburb}` : ''}
                  </p>
                </div>

                {/* Industry */}
                <span className="text-[13px] text-[var(--text-secondary)]">
                  {VERTICAL_LABELS[clinic.vertical] ?? clinic.vertical}
                </span>

                {/* Plan */}
                <span className="text-[13px] text-[var(--text-secondary)]">
                  {getPlanLabel(clinic.plan)}
                </span>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{
                      backgroundColor: status.bg,
                      color: status.color,
                      border: `1px solid ${status.border}`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                    {status.label}
                  </span>
                </div>

                {/* Users */}
                <span className="text-[13px] text-[var(--text-secondary)]">
                  {clinic.user_count}
                </span>

                {/* Created */}
                <span className="text-[13px] text-[var(--text-tertiary)]">
                  {formatDate(clinic.created_at)}
                </span>

                {/* Action */}
                <Link
                  href={`/admin/clinics/${clinic.id}`}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  title="View clinic"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function KPICard({ label, value, icon, iconBg }: { label: string; value: number; icon: React.ReactNode; iconBg?: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--text-secondary)]">
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg ?? 'var(--brand-light)' }}
        >
          {icon}
        </div>
      </div>
      <span className="text-[30px] font-bold text-[var(--text-primary)] font-heading leading-none">
        {value}
      </span>
    </div>
  )
}
