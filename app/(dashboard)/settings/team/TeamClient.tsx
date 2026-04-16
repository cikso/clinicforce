'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import EmptyState from '@/app/components/ui/EmptyState'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// NOTE: Invitations are sent exclusively from /admin (platform_owner only).
// This page shows members + pending invites as read-mostly; invite sending UI lives there.

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface Member {
  id: string
  user_id: string
  name: string | null
  role: string
}

interface Invite {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string | null
}

interface TeamClientProps {
  members: Member[]
  pendingInvites: Invite[]
  currentUserId: string
}

const ROLE_STYLES: Record<string, { variant: 'info' | 'routine' | 'neutral' | 'urgent' | 'high'; label: string }> = {
  platform_owner: { variant: 'info', label: 'Platform Owner' },
  clinic_admin: { variant: 'info', label: 'Clinic Admin' },
  staff: { variant: 'neutral', label: 'Team Member' },
  receptionist: { variant: 'neutral', label: 'Team Member' },
  vet: { variant: 'neutral', label: 'Team Member' },
  nurse: { variant: 'neutral', label: 'Team Member' },
}

const EDITABLE_ROLES = ['clinic_admin', 'staff']

function Toast({ message, variant, onDismiss }: { message: string; variant: 'success' | 'error'; onDismiss: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-[var(--shadow-md)] border',
        variant === 'success'
          ? 'bg-[var(--success-light)] border-[var(--success)]/20 text-[var(--success)]'
          : 'bg-[var(--error-light)] border-[var(--error)]/20 text-[var(--error)]',
      )}>
        <span className="text-[13px] font-medium">{message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function initialsColor(name: string | null): string {
  const colors = ['#00D68F', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4']
  const hash = (name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function TeamClient({ members, pendingInvites, currentUserId }: TeamClientProps) {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function handleRoleChange(memberId: string, newRole: string) {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'clinic_users',
          id: memberId,
          data: { role: newRole },
        }),
      })
      if (res.ok) {
        showToast('Role updated', 'success')
        router.refresh()
      } else {
        showToast('Failed to update role', 'error')
      }
    } catch {
      showToast('Failed to update role', 'error')
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-5 max-w-[680px]">
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Current Team */}
      <Card header={{ title: 'Current Team', subtitle: `${members.length} member${members.length === 1 ? '' : 's'}` }}>
        <div className="space-y-2">
          {members.map((m) => {
            const roleStyle = ROLE_STYLES[m.role] ?? ROLE_STYLES.staff
            const isCurrentUser = m.user_id === currentUserId
            const canEditRole = !isCurrentUser && m.role !== 'platform_owner'

            return (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: initialsColor(m.name) + '20', color: initialsColor(m.name) }}
                >
                  <span className="text-[11px] font-bold">{getInitials(m.name)}</span>
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {m.name || 'Unnamed'}
                    </p>
                    {isCurrentUser && (
                      <span className="text-[10px] text-[var(--text-tertiary)] font-medium">(You)</span>
                    )}
                  </div>
                </div>

                {/* Role badge or dropdown */}
                {canEditRole ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    className="text-[12px] px-2 py-1 rounded-md border border-[var(--border)] bg-white text-[var(--text-primary)] cursor-pointer focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] outline-none"
                  >
                    {EDITABLE_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_STYLES[r]?.label ?? r}</option>
                    ))}
                  </select>
                ) : (
                  <Badge variant={roleStyle.variant}>{roleStyle.label}</Badge>
                )}
              </div>
            )
          })}

          {members.length === 0 && (
            <EmptyState
              icon={<Users className="w-6 h-6" strokeWidth={1.5} />}
              title="No team members yet"
              description="Invite your first teammate below so they can answer callbacks and follow up on actions."
              className="py-6"
            />
          )}
        </div>
      </Card>

      {/* Pending Invitations (read-only) */}
      <Card
        header={{
          title: 'Pending Invitations',
          subtitle: `${pendingInvites.length} pending · Managed from Clinic Admin`,
        }}
      >
        {pendingInvites.length > 0 ? (
          <div className="space-y-2">
            {pendingInvites.map((inv) => {
              const roleStyle = ROLE_STYLES[inv.role] ?? ROLE_STYLES.staff
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={roleStyle.variant}>{roleStyle.label}</Badge>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        Sent {formatDate(inv.created_at)}
                      </span>
                      {inv.expires_at && (
                        <span className="text-[11px] text-[var(--text-tertiary)]">
                          · Expires {formatDate(inv.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-[13px] text-[var(--text-tertiary)] text-center py-4">No pending invitations</p>
        )}
      </Card>
    </div>
  )
}
