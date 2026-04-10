'use client'

import Link from 'next/link'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import EmptyState from '@/app/components/ui/EmptyState'
import { cn } from '@/lib/utils'

interface CallRow {
  id: string
  caller_name: string
  summary: string
  urgency: string
  status: string
  action_required: string | null
  created_at: string
  industry_data: Record<string, unknown> | null
}

interface ActivityFeedProps {
  calls: CallRow[]
  hasExtraFields: boolean
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function urgencyVariant(u: string): 'routine' | 'urgent' | 'high' {
  if (u === 'CRITICAL' || u === 'URGENT') return 'urgent'
  if (u === 'HIGH') return 'high'
  return 'routine'
}

function statusColor(s: string): string {
  if (s === 'UNREAD') return 'text-[var(--brand)]'
  if (s === 'ACTIONED') return 'text-[var(--success)]'
  return 'text-[var(--text-tertiary)]'
}

function statusLabel(s: string): string {
  if (s === 'UNREAD') return 'Unread'
  if (s === 'ACTIONED') return 'Actioned'
  if (s === 'READ') return 'Reviewed'
  return s
}

export default function ActivityFeed({ calls, hasExtraFields }: ActivityFeedProps) {
  return (
    <Card
      header={{
        title: 'Recent Activity',
        subtitle: 'Call log from today',
        action: (
          <Link href="/conversations">
            <Button variant="secondary" size="sm">View all</Button>
          </Link>
        ),
      }}
    >
      {calls.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
              <rect x="8" y="6" width="32" height="36" rx="4" />
              <path d="M16 18h16M16 26h10" />
            </svg>
          }
          title="No calls today"
          description="When Sarah handles calls, they'll appear here."
        />
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                  Time
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                  Caller
                </th>
                {hasExtraFields && (
                  <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                    Pet Name
                  </th>
                )}
                <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                  Reason
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                  Urgency
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                  Status
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const petName = hasExtraFields
                  ? (call.industry_data?.pet_name as string) || '—'
                  : null

                return (
                  <tr
                    key={call.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                    onClick={() => {
                      window.location.href = `/conversations?id=${call.id}`
                    }}
                  >
                    <td className="px-5 py-3">
                      <span className="text-[13px] text-[var(--text-tertiary)] font-mono-data">
                        {formatTime(call.created_at)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                        {call.caller_name || 'Unknown'}
                      </span>
                    </td>
                    {hasExtraFields && (
                      <td className="px-3 py-3">
                        <span className={cn(
                          'text-[13px]',
                          petName !== '—' ? 'text-[var(--info)] font-medium' : 'text-[var(--text-tertiary)]',
                        )}>
                          {petName}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3 max-w-[200px]">
                      <span className="text-[13px] text-[var(--text-secondary)] truncate block">
                        {call.summary || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={urgencyVariant(call.urgency)}>
                        {call.urgency}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('text-[13px] font-medium', statusColor(call.status))}>
                        {statusLabel(call.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {call.action_required ? (
                        <span className="text-[13px] text-[var(--brand)] font-medium truncate block max-w-[150px]">
                          {call.action_required}
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--success)]">None needed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
