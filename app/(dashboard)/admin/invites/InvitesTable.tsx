'use client'

import { useMemo } from 'react'
import DataTable, { type DataTableColumn } from '@/app/components/ui/DataTable'

export interface InviteRow {
  id: string
  email: string
  role: string
  created_at: string
  status: 'pending' | 'accepted' | 'expired'
  clinicName: string
}

const STATUS_RANK: Record<InviteRow['status'], number> = {
  pending: 0, expired: 1, accepted: 2,
}

const STATUS_STYLE: Record<InviteRow['status'], { bg: string; color: string; border: string }> = {
  accepted: { bg: 'var(--success-light)', color: 'var(--success)', border: 'color-mix(in srgb, var(--success) 20%, transparent)' },
  pending:  { bg: 'var(--warning-light)', color: 'var(--warning)', border: 'color-mix(in srgb, var(--warning) 20%, transparent)' },
  expired:  { bg: 'var(--bg-secondary)',  color: 'var(--text-tertiary)', border: 'var(--border)' },
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function InvitesTable({ rows, emptyState }: { rows: InviteRow[]; emptyState: React.ReactNode }) {
  const columns = useMemo<DataTableColumn<InviteRow>[]>(() => [
    {
      id: 'email',
      header: 'Email',
      width: '2fr',
      sortValue: (r) => r.email.toLowerCase(),
      cell: (r) => (
        <span className="text-[14px] text-[var(--text-primary)] truncate">{r.email}</span>
      ),
    },
    {
      id: 'clinic',
      header: 'Clinic',
      width: '1.5fr',
      sortValue: (r) => r.clinicName.toLowerCase(),
      cell: (r) => <span className="text-[13px] text-[var(--text-secondary)] truncate">{r.clinicName}</span>,
    },
    {
      id: 'role',
      header: 'Role',
      width: '80px',
      sortValue: (r) => r.role,
      cell: (r) => (
        <span className="text-[13px] text-[var(--text-secondary)]">
          {r.role === 'clinic_admin' ? 'Admin' : 'Staff'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: '100px',
      sortValue: (r) => STATUS_RANK[r.status],
      cell: (r) => {
        const s = STATUS_STYLE[r.status]
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold w-fit"
            style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
          >
            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          </span>
        )
      },
    },
    {
      id: 'sent',
      header: 'Sent',
      width: '120px',
      sortValue: (r) => r.created_at,
      cell: (r) => (
        <span className="text-[13px] text-[var(--text-tertiary)]">{formatShortDate(r.created_at)}</span>
      ),
    },
  ], [])

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      defaultSort={{ columnId: 'sent', direction: 'desc' }}
      emptyState={emptyState}
      ariaLabel="Invites"
    />
  )
}
