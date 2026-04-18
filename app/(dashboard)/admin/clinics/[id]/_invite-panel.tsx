'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Check, Copy, Loader2, Trash2 } from 'lucide-react'

interface Invite {
  id: string
  email: string
  role: string
  token: string
  accepted_at: string | null
  expires_at: string
  created_at: string
  invited_by: string | null
}

interface Props {
  clinicId: string
  clinicName: string
  invites: Invite[]
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all outline-none'

const labelClass = 'block text-[12px] font-semibold text-[var(--text-primary)] mb-1'

type InviteStatus = 'accepted' | 'expired' | 'pending'

const STATUS_META: Record<InviteStatus, { label: string; bg: string; color: string; borderRgb: string }> = {
  accepted: { label: 'Accepted', bg: 'var(--success-light)', color: 'var(--success)',   borderRgb: 'var(--success-rgb)' },
  expired:  { label: 'Expired',  bg: 'var(--bg-hover)',      color: 'var(--text-tertiary)', borderRgb: '' },
  pending:  { label: 'Pending',  bg: 'var(--warning-light)', color: 'var(--warning)',   borderRgb: 'var(--warning-rgb)' },
}

export default function InvitePanel({ clinicId, clinicName, invites }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'clinic_admin' | 'staff'>('clinic_admin')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function deleteInvite(id: string) {
    if (!confirm('Delete this invite? The link will no longer work.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/invite?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to delete invite.')
        return
      }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email.trim()) { setError('Email is required.'); return }

    startTransition(async () => {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, email: email.trim(), role }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to send invite.'); return }

      if (json.emailSent === false) {
        setSuccessMsg(`Invite created for ${email.trim()} but the email could not be sent — copy the link below to share manually.`)
      } else {
        setSuccessMsg(`Invite email sent to ${email.trim()}. They'll receive a link to set up their account.`)
      }
      setEmail('')
      router.refresh()
    })
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const isExpired = (expires_at: string) => new Date(expires_at) < new Date()

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] mb-5">
        Invite user to {clinicName}
      </p>

      {/* Invite form */}
      <form onSubmit={sendInvite} className="flex flex-wrap gap-3 items-end mb-5">
        <div className="flex-1 min-w-[220px]">
          <label htmlFor="invite-email" className={labelClass}>Email address</label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@clinic.com.au"
            className={inputClass}
          />
        </div>
        <div className="min-w-[150px]">
          <label htmlFor="invite-role" className={labelClass}>Role</label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'clinic_admin' | 'staff')}
            className={`${inputClass} appearance-none cursor-pointer pr-9`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A94A6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            <option value="clinic_admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.25} />
            : <Send className="w-4 h-4" strokeWidth={2} />
          }
          Send invite
        </button>
      </form>

      {/* Success */}
      {successMsg && (
        <div
          role="status"
          className="flex items-start gap-2 px-4 py-3 rounded-lg bg-[var(--success-light)] mb-4 text-[13px] text-[var(--success)] font-medium"
          style={{ border: '1px solid rgba(var(--success-rgb), 0.2)' }}
        >
          <Check className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2.25} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-[var(--error-light)] mb-4 text-[13px] text-[var(--error)] font-medium"
          style={{ border: '1px solid rgba(var(--error-rgb), 0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Invite list */}
      {invites.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] mb-3">
            Invite history
          </p>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {invites.map((inv) => {
              const expired = isExpired(inv.expires_at)
              const accepted = !!inv.accepted_at
              const status: InviteStatus = accepted ? 'accepted' : expired ? 'expired' : 'pending'
              const meta = STATUS_META[status]

              return (
                <li key={inv.id} className="flex justify-between items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                      {inv.email}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                      {inv.role === 'clinic_admin' ? 'Admin' : 'Staff'}
                      {' · Sent '}
                      {new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: meta.bg,
                        color: meta.color,
                        border: meta.borderRgb
                          ? `1px solid rgba(${meta.borderRgb}, 0.22)`
                          : '1px solid var(--border)',
                      }}
                    >
                      {meta.label}
                    </span>

                    {status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => copyLink(inv.token)}
                        title="Copy invite link"
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-[var(--border)] bg-transparent text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        style={copiedToken === inv.token ? { color: 'var(--brand-dark)' } : undefined}
                      >
                        {copiedToken === inv.token
                          ? <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
                          : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                        }
                        {copiedToken === inv.token ? 'Copied' : 'Copy link'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteInvite(inv.id)}
                      disabled={deletingId === inv.id}
                      title="Delete invite"
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-[var(--border)] bg-transparent text-[12px] font-medium text-[var(--error)] hover:bg-[var(--error-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {deletingId === inv.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
