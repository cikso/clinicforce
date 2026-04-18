'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import EmptyState from '@/app/components/ui/EmptyState'
import { useToast } from '@/app/components/ui/Toast'
import { Users, Send, Trash2, Loader2 } from 'lucide-react'

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
  clinicId: string
  members: Member[]
  pendingInvites: Invite[]
  currentUserId: string
}

const ROLE_STYLES: Record<string, { variant: 'info' | 'routine' | 'neutral' | 'urgent' | 'high'; label: string }> = {
  platform_owner: { variant: 'info', label: 'Platform Owner' },
  clinic_owner:   { variant: 'info', label: 'Clinic Owner' },
  clinic_admin:   { variant: 'info', label: 'Clinic Admin' },
  staff:          { variant: 'neutral', label: 'Staff' },
  receptionist:   { variant: 'neutral', label: 'Staff' },
  vet:            { variant: 'neutral', label: 'Staff' },
  nurse:          { variant: 'neutral', label: 'Staff' },
}

const EDITABLE_ROLES = ['clinic_admin', 'staff']

function getInitials(name: string | null, email?: string): string {
  if (name) return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

function initialsColor(seed: string | null): string {
  const colors = ['#00D68F', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4']
  const hash = (seed ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function TeamClient({ clinicId, members, pendingInvites, currentUserId }: TeamClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'clinic_admin' | 'staff'>('staff')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null)

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
        toast({ type: 'success', title: 'Role updated' })
        router.refresh()
      } else {
        toast({ type: 'error', title: 'Failed to update role' })
      }
    } catch {
      toast({ type: 'error', title: 'Failed to update role' })
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinic_id: clinicId, email: email.trim(), role }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast({ type: 'error', title: json.error ?? 'Failed to send invite' })
          return
        }
        toast({
          type: 'success',
          title: 'Invite sent',
          description: json.emailSent === false
            ? 'Account created, but the email could not be sent.'
            : `${email.trim()} will receive an email to set up their account.`,
        })
        setEmail('')
        setRole('staff')
        router.refresh()
      } catch {
        toast({ type: 'error', title: 'Failed to send invite' })
      }
    })
  }

  async function handleRemoveMember(member: Member) {
    const name = member.name ?? 'this teammate'
    if (!confirm(`Remove ${name} from the clinic? They will lose access immediately.`)) return
    setRemovingId(member.id)
    try {
      const res = await fetch('/api/users/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({ type: 'error', title: json.error ?? 'Failed to remove member' })
        return
      }
      toast({ type: 'success', title: `${name} removed` })
      router.refresh()
    } catch {
      toast({ type: 'error', title: 'Failed to remove member' })
    } finally {
      setRemovingId(null)
    }
  }

  async function handleDeleteInvite(invite: Invite) {
    if (!confirm(`Revoke the invite for ${invite.email}?`)) return
    setDeletingInviteId(invite.id)
    try {
      const res = await fetch(`/api/admin/invite?id=${invite.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({ type: 'error', title: json.error ?? 'Failed to revoke invite' })
        return
      }
      toast({ type: 'success', title: 'Invite revoked' })
      router.refresh()
    } catch {
      toast({ type: 'error', title: 'Failed to revoke invite' })
    } finally {
      setDeletingInviteId(null)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all outline-none'

  return (
    <div className="space-y-5 max-w-[720px]">
      {/* Invite form */}
      <Card header={{ title: 'Add a teammate', subtitle: 'They will get an email with a link to set their password.' }}>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@clinic.com.au"
              className={inputClass}
              disabled={isPending}
            />
          </div>
          <div className="sm:w-[180px]">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--text-tertiary)] mb-1">
              Access
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'clinic_admin' | 'staff')}
              className={inputClass}
              disabled={isPending}
            >
              <option value="staff">Staff</option>
              <option value="clinic_admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-[13px] font-semibold hover:bg-[var(--brand-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isPending ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      </Card>

      {/* Current Team */}
      <Card header={{ title: 'Current Team', subtitle: `${members.length} member${members.length === 1 ? '' : 's'}` }}>
        <div className="space-y-2">
          {members.map((m) => {
            const roleStyle = ROLE_STYLES[m.role] ?? ROLE_STYLES.staff
            const isCurrentUser = m.user_id === currentUserId
            const canEditRole = !isCurrentUser && m.role !== 'platform_owner' && m.role !== 'clinic_owner'
            const canRemove = !isCurrentUser && m.role !== 'platform_owner' && m.role !== 'clinic_owner'

            return (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: initialsColor(m.name) + '20', color: initialsColor(m.name) }}
                >
                  <span className="text-[11px] font-bold">{getInitials(m.name)}</span>
                </div>

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

                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m)}
                    disabled={removingId === m.id}
                    className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors disabled:opacity-50"
                    aria-label={`Remove ${m.name ?? 'member'}`}
                  >
                    {removingId === m.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            )
          })}

          {members.length === 0 && (
            <EmptyState
              icon={<Users className="w-6 h-6" strokeWidth={1.5} />}
              title="No team members yet"
              description="Invite your first teammate above."
              className="py-6"
            />
          )}
        </div>
      </Card>

      {/* Pending Invitations */}
      <Card header={{ title: 'Pending invitations', subtitle: `${pendingInvites.length} waiting to accept` }}>
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
                  <button
                    type="button"
                    onClick={() => handleDeleteInvite(inv)}
                    disabled={deletingInviteId === inv.id}
                    className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors disabled:opacity-50"
                    aria-label={`Revoke invite for ${inv.email}`}
                  >
                    {deletingInviteId === inv.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
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
