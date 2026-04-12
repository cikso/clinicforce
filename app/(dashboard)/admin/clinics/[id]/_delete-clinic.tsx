'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

      // Success — redirect to admin
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setDeleting(false)
    }
  }, [canDelete, clinicId, router])

  if (!showConfirm) {
    return (
      <div className="bg-[var(--bg-primary)] border border-red-200 rounded-xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-red-400">
              Danger Zone
            </p>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
              Permanently delete this clinic and all associated data
            </p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-red-300 text-red-600 bg-white hover:bg-red-50 transition-colors"
          >
            Delete Clinic
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-primary)] border border-red-300 rounded-xl p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 6v4M10 14h.01" />
            <circle cx="10" cy="10" r="8" />
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-bold text-red-700">
            Delete {clinicName}?
          </p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
            This will permanently delete the clinic, all users, calls, tasks, voice agents, coverage sessions, subscriptions, and all other data. This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
          Type <span className="font-bold text-[var(--text-primary)]">{clinicName}</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={clinicName}
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all"
          disabled={deleting}
        />
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
            canDelete && !deleting
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {deleting ? 'Deleting...' : 'Permanently Delete'}
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
