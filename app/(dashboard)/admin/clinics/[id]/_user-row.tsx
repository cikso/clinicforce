'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'

interface Props {
  memberId: string
  memberName: string | null
  role: string
  canRemove: boolean
}

const ROLE_LABELS: Record<string, string> = {
  clinic_admin:   'Admin',
  clinic_owner:   'Owner',
  staff:          'Staff',
  receptionist:   'Receptionist',
  vet:            'Vet',
  nurse:          'Nurse',
  platform_owner: 'Platform Owner',
}

export default function UserRow({ memberId, memberName, role, canRemove }: Props) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function handleRemove() {
    const label = memberName ?? 'this teammate'
    if (!confirm(`Remove ${label} from this clinic? They will lose access immediately.`)) return
    setRemoving(true)
    try {
      const res = await fetch('/api/users/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert(j.error ?? 'Failed to remove member')
        return
      }
      router.refresh()
    } catch {
      alert('Failed to remove member')
    } finally {
      setRemoving(false)
    }
  }

  const isAdminish = role === 'clinic_admin' || role === 'clinic_owner'

  return (
    <div className="flex items-center justify-between py-3 gap-3">
      <p className="text-[14px] font-medium text-[var(--text-primary)] flex-1 min-w-0 truncate">
        {memberName ?? '—'}
      </p>
      <span
        className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
        style={{
          backgroundColor: isAdminish ? 'var(--success-light)' : 'var(--bg-secondary)',
          color:           isAdminish ? 'var(--success)'       : 'var(--text-secondary)',
          border:          isAdminish
            ? '1px solid rgba(var(--success-rgb), 0.2)'
            : '1px solid var(--border)',
        }}
      >
        {ROLE_LABELS[role] ?? role}
      </span>
      {canRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors disabled:opacity-50"
          aria-label={`Remove ${memberName ?? 'member'}`}
        >
          {removing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Trash2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}
