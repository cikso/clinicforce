'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Badge from '@/app/components/ui/Badge'
import { cn } from '@/lib/utils'

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
  clinicId: string
}

const ROLE_STYLES: Record<string, { variant: 'info' | 'routine' | 'neutral' | 'urgent' | 'high'; label: string }> = {
  platform_owner: { variant: 'info', label: 'Platform Owner' },
  clinic_admin: { variant: 'info', label: 'Clinic Admin' },
  staff: { variant: 'neutral', label: 'Team Member' },
  receptionist: { variant: 'neutral', label: 'Team Member' },
  vet: { variant: 'neutral', label: 'Team Member' },
  nurse: { variant: 'neutral', label: 'Team Member' },
}

const INVITE_ROLES = [
  { value: 'clinic_admin', label: 'Clinic Admin' },
  { value: 'staff', label: 'Team Member' },
]

const EDITABLE_ROLES = ['clinic_admin', 'staff']

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors outline-none'
const selectCls = cn(inputCls, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8')

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

export default function TeamClient({ members, pendingInvites, currentUserId, clinicId }: TeamClientProps) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      // Try the admin invite endpoint first, fall back to settings API
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          clinicId,
        }),
      })
      if (res.ok) {
        showToast(`Invitation sent to ${inviteEmail}`, 'success')
        setInviteEmail('')
        router.refresh()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast((err as { error?: string }).error ?? 'Failed to send invite', 'error')
      }
    } catch {
      showToast('Failed to send invite', 'error')
    } finally {
      setInviting(false)
    }
  }

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

  async function handleCancelInvite(inviteId: string) {
    try {
      const res = await fetch(`/api/settings?table=clinic_invites&id=${inviteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast('Invitation cancelled', 'success')
        router.refresh()
      } else {
        showToast('Failed to cancel invite', 'error')
      }
    } catch {
      showToast('Failed to cancel invite', 'error')
    }
  }

  async function handleResendInvite(invite: Invite) {
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invite.email,
          role: invite.role,
          clinicId,
        }),
      })
      showToast(res.ok ? `Resent to ${invite.email}` : 'Failed to resend', res.ok ? 'success' : 'error')
    } catch {
      showToast('Failed to resend', 'error')
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
            <p className="text-[13px] text-[var(--text-tertiary)] text-center py-4">No team members found</p>
          )}
        </div>
      </Card>

      {/* Invite New Member */}
      <Card header={{ title: 'Invite New Member', subtitle: 'Send an email invitation to join your clinic' }}>
        <form onSubmit={handleInvite} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={inputCls}
                placeholder="colleague@clinic.com.au"
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className={selectCls}
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" variant="primary" size="md" loading={inviting}>
            Send Invite
          </Button>
        </form>
      </Card>

      {/* Pending Invitations */}
      <Card header={{ title: 'Pending Invitations', subtitle: `${pendingInvites.length} pending` }}>
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleResendInvite(inv)}>
                      Resend
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCancelInvite(inv.id)}>
                      Cancel
                    </Button>
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
