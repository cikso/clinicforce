'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.875rem',
  backgroundColor: '#ffffff',
  border: '1px solid #E8E4DE',
  borderRadius: 8,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
  color: '#1A1A1A',
  outline: 'none',
  transition: 'border-color 0.15s',
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
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E4DE', borderRadius: 14, padding: '1.75rem' }}>
      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
        Invite user to {clinicName}
      </p>

      {/* Invite form */}
      <form onSubmit={sendInvite} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ fontFamily: "'DM Sans'", fontSize: '0.8rem', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '0.3rem' }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@clinic.com.au"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            onFocus={(e) => (e.target.style.borderColor = '#17C4BE')}
            onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
          />
        </div>
        <div style={{ minWidth: 150 }}>
          <label style={{ fontFamily: "'DM Sans'", fontSize: '0.8rem', fontWeight: 500, color: '#1A1A1A', display: 'block', marginBottom: '0.3rem' }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'clinic_admin' | 'staff')}
            style={{
              ...inputStyle, appearance: 'none', cursor: 'pointer', width: '100%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239B9B9B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.625rem center', paddingRight: '2rem',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#17C4BE')}
            onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
          >
            <option value="clinic_admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: isPending ? '#45c5bf' : '#17C4BE',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontFamily: "'DM Sans'",
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexShrink: 0,
            height: 40,
          }}
        >
          {isPending ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'inv-spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
          Send Invite
        </button>
      </form>

      {/* Success message */}
      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(23,196,190,0.06)', border: '1px solid rgba(23,196,190,0.2)', borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#17C4BE', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#DC2626', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Invite list */}
      {invites.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: '1.25rem' }}>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
              Invite history
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {invites.map((inv, i) => {
                const expired = isExpired(inv.expires_at)
                const accepted = !!inv.accepted_at
                const status = accepted ? 'accepted' : expired ? 'expired' : 'pending'
                const statusColors = {
                  accepted: { bg: 'rgba(23,196,190,0.07)', color: '#17C4BE', border: 'rgba(23,196,190,0.2)' },
                  expired:  { bg: '#F5F4F2',              color: '#9B9B9B',  border: '#E8E4DE' },
                  pending:  { bg: 'rgba(245,158,11,0.07)', color: '#B45309', border: 'rgba(245,158,11,0.2)' },
                }[status]

                return (
                  <div
                    key={inv.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: i < invites.length - 1 ? '1px solid #F0EDE8' : 'none',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', fontWeight: 500, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.email}
                      </p>
                      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', color: '#9B9B9B' }}>
                        {inv.role === 'clinic_admin' ? 'Admin' : 'Staff'} · Sent {new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{
                        padding: '0.2rem 0.625rem', borderRadius: 999, fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600,
                        backgroundColor: statusColors.bg, color: statusColors.color, border: `1px solid ${statusColors.border}`,
                      }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>

                      {/* Copy link — only for pending */}
                      {status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => copyLink(inv.token)}
                          title="Copy invite link"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.3rem 0.625rem', backgroundColor: 'transparent',
                            border: '1px solid #E8E4DE', borderRadius: 6,
                            fontFamily: "'DM Sans'", fontSize: '0.75rem',
                            color: copiedToken === inv.token ? '#17C4BE' : '#6B6B6B',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                              Copy link
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete invite */}
                      <button
                        type="button"
                        onClick={() => deleteInvite(inv.id)}
                        disabled={deletingId === inv.id}
                        title="Delete invite"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.3rem 0.625rem', backgroundColor: 'transparent',
                          border: '1px solid #E8E4DE', borderRadius: 6,
                          fontFamily: "'DM Sans'", fontSize: '0.75rem',
                          color: deletingId === inv.id ? '#9B9B9B' : '#DC2626',
                          cursor: deletingId === inv.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          opacity: deletingId === inv.id ? 0.5 : 1,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        {deletingId === inv.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes inv-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}
