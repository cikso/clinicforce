'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DataTable, { type DataTableColumn } from '@/app/components/ui/DataTable'

export interface ClinicOption {
  id: string
  name: string
  slug: string
  suburb: string | null
}

export interface OwnerRow {
  userId: string
  email: string
  name: string | null
  createdAt: string
  clinics: ClinicOption[]
}

export interface PendingOwnerInvite {
  id: string
  email: string
  invitedBy: string | null
  createdAt: string
  expiresAt: string | null
  clinics: ClinicOption[]
}

interface Props {
  owners: OwnerRow[]
  pendingInvites: PendingOwnerInvite[]
  allClinics: ClinicOption[]
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function OwnersClient({ owners, pendingInvites, allClinics }: Props) {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [editing, setEditing] = useState<OwnerRow | null>(null)

  const ownerColumns = useMemo<DataTableColumn<OwnerRow>[]>(() => [
    {
      id: 'owner',
      header: 'Owner',
      width: '2fr',
      sortValue: (o) => (o.name ?? o.email).toLowerCase(),
      cell: (o) => (
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
            {o.name ?? o.email.split('@')[0]}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] truncate">{o.email}</p>
        </div>
      ),
    },
    {
      id: 'clinics',
      header: 'Clinics',
      width: '3fr',
      sortValue: (o) => o.clinics.length,
      cell: (o) => (
        <div className="flex flex-wrap gap-1.5">
          {o.clinics.length === 0 ? (
            <span className="text-[12px] text-[var(--text-tertiary)] italic">No clinics</span>
          ) : (
            o.clinics.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]"
                title={c.suburb ?? undefined}
              >
                {c.name}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'joined',
      header: 'Joined',
      width: '0.8fr',
      sortValue: (o) => o.createdAt,
      cell: (o) => (
        <span className="text-[13px] text-[var(--text-tertiary)]">{formatDate(o.createdAt)}</span>
      ),
    },
  ], [])

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Clinic Admin
            </Link>
            <span className="text-[12px] text-[var(--text-tertiary)]">/</span>
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Owners</span>
          </div>
          <h1 className="text-[22px] font-heading font-bold text-[var(--text-primary)]">
            Clinic Owners
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            Invite owners and assign them to one or more clinics. Owners can manage every clinic in their portfolio.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Invite Owner
        </button>
      </div>

      {/* Active owners table (DataTable primitive — sortable headers) */}
      <div className="mb-6">
        <div className="px-5 py-2.5 mb-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
            Active Owners ({owners.length})
          </p>
        </div>
        <DataTable
          data={owners}
          columns={ownerColumns}
          getRowId={(o) => o.userId}
          onRowClick={(o) => setEditing(o)}
          defaultSort={{ columnId: 'joined', direction: 'desc' }}
          ariaLabel="Clinic owners"
          rowActions={() => (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--text-tertiary)]">
              <circle cx="8" cy="3" r="1" />
              <circle cx="8" cy="8" r="1" />
              <circle cx="8" cy="13" r="1" />
            </svg>
          )}
          emptyState={
            <p className="text-center text-[14px] text-[var(--text-tertiary)] py-6">
              No clinic owners yet. Invite one to get started.
            </p>
          }
        />
      </div>

      {/* Pending invites */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)]">
            Pending Invites ({pendingInvites.length})
          </p>
        </div>

        {pendingInvites.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-[var(--text-tertiary)]">No pending owner invites.</p>
          </div>
        ) : (
          pendingInvites.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1fr_2fr_auto] gap-3 px-5 py-3 items-center border-b border-[var(--border)] last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                  {inv.email}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Invited {formatDate(inv.createdAt)}
                  {inv.invitedBy ? ` by ${inv.invitedBy}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inv.clinics.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
                  border: '1px solid rgba(217,119,6,0.2)',
                }}
              >
                Pending
              </span>
            </div>
          ))
        )}
      </div>

      {showInvite && (
        <InviteModal
          allClinics={allClinics}
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); router.refresh() }}
        />
      )}

      {editing && (
        <ManageOwnerModal
          owner={editing}
          allClinics={allClinics}
          onClose={() => setEditing(null)}
          onChange={() => router.refresh()}
        />
      )}
    </div>
  )
}

/* ─────────── Invite modal ─────────── */

function InviteModal({
  allClinics, onClose, onSuccess,
}: {
  allClinics: ClinicOption[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(allClinics.map((c) => c.id)))
  }
  function clearAll() {
    setSelected(new Set())
  }

  function submit() {
    setError('')
    if (!email.trim()) { setError('Email is required.'); return }
    if (selected.size === 0) { setError('Select at least one clinic.'); return }

    startTransition(async () => {
      const res = await fetch('/api/admin/owners/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), clinic_ids: Array.from(selected) }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError((json as { error?: string }).error ?? 'Failed to send invite.')
        return
      }
      onSuccess()
    })
  }

  return (
    <ModalShell title="Invite Clinic Owner" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@clinic.com.au"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Clinics ({selected.size}/{allClinics.length})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-[12px] font-medium text-[var(--brand)] hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="border border-[var(--border)] rounded-lg max-h-[260px] overflow-y-auto divide-y divide-[var(--border)]">
            {allClinics.length === 0 ? (
              <p className="px-3 py-4 text-[13px] text-[var(--text-tertiary)] text-center">
                No clinics yet. Create one first.
              </p>
            ) : (
              allClinics.map((c) => {
                const isOn = selected.has(c.id)
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggle(c.id)}
                      className="w-4 h-4 accent-[var(--brand)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{c.name}</p>
                      {c.suburb && (
                        <p className="text-[11px] text-[var(--text-tertiary)] truncate">{c.suburb}</p>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/15">
            <span className="text-[12px] text-[#DC2626] font-medium">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--brand)] text-white text-[13px] font-semibold hover:bg-[var(--brand-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isPending && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isPending ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─────────── Manage owner modal ─────────── */

function ManageOwnerModal({
  owner, allClinics, onClose, onChange,
}: {
  owner: OwnerRow
  allClinics: ClinicOption[]
  onClose: () => void
  onChange: () => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const assignedIds = new Set(owner.clinics.map((c) => c.id))

  async function add(clinicId: string) {
    setError('')
    setBusyId(clinicId)
    const res = await fetch('/api/admin/owners/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: owner.userId, clinic_id: clinicId, name: owner.name }),
    })
    setBusyId(null)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError((json as { error?: string }).error ?? 'Failed to assign.')
      return
    }
    onChange()
  }

  async function remove(clinicId: string) {
    setError('')
    setBusyId(clinicId)
    const res = await fetch(
      `/api/admin/owners/assign?user_id=${owner.userId}&clinic_id=${clinicId}`,
      { method: 'DELETE' },
    )
    setBusyId(null)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError((json as { error?: string }).error ?? 'Failed to remove.')
      return
    }
    onChange()
  }

  return (
    <ModalShell title={`Manage ${owner.name ?? owner.email}`} onClose={onClose}>
      <p className="text-[12px] text-[var(--text-tertiary)] -mt-2 mb-3">
        Toggle a clinic to add or remove this owner&apos;s access.
      </p>

      <div className="border border-[var(--border)] rounded-lg max-h-[340px] overflow-y-auto divide-y divide-[var(--border)]">
        {allClinics.map((c) => {
          const isOn = assignedIds.has(c.id)
          const busy = busyId === c.id
          return (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{c.name}</p>
                {c.suburb && (
                  <p className="text-[11px] text-[var(--text-tertiary)] truncate">{c.suburb}</p>
                )}
              </div>
              <button
                onClick={() => (isOn ? remove(c.id) : add(c.id))}
                disabled={busy}
                className={
                  'h-8 px-3 rounded-md text-[12px] font-semibold transition-colors disabled:opacity-50 ' +
                  (isOn
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#DC2626]/20'
                    : 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]')
                }
              >
                {busy ? '…' : isOn ? 'Remove' : 'Add'}
              </button>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/15">
          <span className="text-[12px] text-[#DC2626] font-medium">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end pt-3">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-lg border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          Done
        </button>
      </div>
    </ModalShell>
  )
}

/* ─────────── Modal shell ─────────── */

function ModalShell({
  title, onClose, children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-primary)] rounded-xl shadow-xl border border-[var(--border)] w-full max-w-[520px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-heading font-bold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
