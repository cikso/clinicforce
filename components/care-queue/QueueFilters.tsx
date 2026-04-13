'use client'

import { cn } from '@/lib/utils'
import type { TriageLevel, QueueStatus } from '@/lib/types'

// ─── Triage filter ────────────────────────────────────────────────────────────

const triageLevels: { value: TriageLevel | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All urgency' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
]

const triageActive: Record<string, string> = {
  ALL: 'bg-foreground text-background',
  URGENT: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  ROUTINE: 'bg-teal-600 text-white',
  FOLLOW_UP: 'bg-gray-500 text-white',
}

// ─── Status filter ────────────────────────────────────────────────────────────

const statusOptions: { value: QueueStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'WITH_VET', label: 'With vet' },
  { value: 'PENDING_DISCHARGE', label: 'Pending discharge' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface QueueFiltersProps {
  triageFilter: TriageLevel | 'ALL'
  statusFilter: QueueStatus | 'ALL'
  onTriageChange: (value: TriageLevel | 'ALL') => void
  onStatusChange: (value: QueueStatus | 'ALL') => void
  totalCount: number
  filteredCount: number
}

function FilterPill({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean
  activeClass: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
        active
          ? cn(activeClass, 'border-transparent shadow-sm')
          : 'bg-white text-muted-foreground border-border hover:bg-muted'
      )}
    >
      {children}
    </button>
  )
}

export default function QueueFilters({
  triageFilter,
  statusFilter,
  onTriageChange,
  onStatusChange,
  totalCount,
  filteredCount,
}: QueueFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      {/* Triage filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        {triageLevels.map(({ value, label }) => (
          <FilterPill
            key={value}
            active={triageFilter === value}
            activeClass={triageActive[value]}
            onClick={() => onTriageChange(value as TriageLevel | 'ALL')}
          >
            {label}
          </FilterPill>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-5 bg-border shrink-0" />

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        {statusOptions.map(({ value, label }) => (
          <FilterPill
            key={value}
            active={statusFilter === value}
            activeClass="bg-foreground text-background"
            onClick={() => onStatusChange(value as QueueStatus | 'ALL')}
          >
            {label}
          </FilterPill>
        ))}
      </div>

      {/* Count */}
      <div className="sm:ml-auto shrink-0 text-xs text-muted-foreground">
        {filteredCount === totalCount
          ? `${totalCount} patients`
          : `${filteredCount} of ${totalCount}`}
      </div>
    </div>
  )
}
