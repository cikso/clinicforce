'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

interface Props {
  clinicId: string
  clinicName: string
}

export default function DeleteClinicButton({ clinicId, clinicName }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expectedText = clinicName.toLowerCase().trim()
  const canDelete = confirmText.toLowerCase().trim() === expectedText

  const handleDelete = useCallback(async () => {
    if (!canDelete) return
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/clinics/${clinicId}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to delete clinic')
        setDeleting(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setDeleting(false)
    }
  }, [canDelete, clinicId, router])

  // Shared red-accented border style — token-driven, no raw Tailwind reds.
  const dangerBorder = '1px solid rgba(var(--error-rgb), 0.3)'
  const dangerBorderStrong = '1px solid rgba(var(--error-rgb), 0.45)'

  if (!showConfirm) {
    return (
      <div
        className="bg-[var(--bg-primary)] rounded-xl p-6 shadow-[var(--shadow-card)]"
        style={{ border: dangerBorder }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--error)]">
              Danger zone
            </p>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
              Permanently delete this clinic and all associated data
            </p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[var(--bg-primary)] text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
            style={{ border: dangerBorder }}
          >
            Delete clinic
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      role="dialog"
      aria-labelledby="delete-clinic-title"
      className="bg-[var(--bg-primary)] rounded-xl p-6 shadow-[var(--shadow-card)]"
      style={{ border: dangerBorderStrong }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full bg-[var(--error-light)] flex items-center justify-center shrink-0 text-[var(--error)]"
          aria-hidden
        >
          <AlertCircle className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p id="delete-clinic-title" className="text-[14px] font-bold text-[var(--error)]">
            Delete {clinicName}?
          </p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            This will permanently delete the clinic, all users, calls, tasks, voice agents,
            coverage sessions, subscriptions, and all other data. This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="delete-clinic-confirm" className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
          Type <span className="font-bold text-[var(--text-primary)]">{clinicName}</span> to confirm
        </label>
        <input
          id="delete-clinic-confirm"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={clinicName}
          disabled={deleting}
          className="w-full h-10 px-3 rounded-lg bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all"
          style={{
            border: '1px solid var(--border)',
            // Focus ring uses error accent since this is a destructive flow
            boxShadow: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--error)'
            e.target.style.boxShadow = '0 0 0 3px rgba(var(--error-rgb), 0.18)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 px-3 py-2 rounded-lg bg-[var(--error-light)] text-[13px] text-[var(--error)]"
          style={{ border: '1px solid rgba(var(--error-rgb), 0.22)' }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
            canDelete && !deleting
              ? 'text-white hover:brightness-110'
              : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
          }`}
          style={canDelete && !deleting ? { backgroundColor: 'var(--error)' } : undefined}
        >
          {deleting ? 'Deleting...' : 'Permanently delete'}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setConfirmText(''); setError(null) }}
          disabled={deleting}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
