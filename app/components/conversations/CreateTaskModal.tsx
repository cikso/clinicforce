'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/app/components/ui/Button'

interface StaffMember {
  id: string
  name: string
  role: string
}

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  clinicId: string
  defaultTitle: string
  defaultDescription: string
  callId: string
}

export default function CreateTaskModal({
  open,
  onClose,
  onCreated,
  clinicId,
  defaultTitle,
  defaultDescription,
  callId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState(defaultDescription)
  const [assignee, setAssignee] = useState('')
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(false)

  // Reset form when opened with new defaults
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle)
      setDescription(defaultDescription)
      setPriority('NORMAL')
      setDueDate(new Date().toISOString().split('T')[0])
    }
  }, [open, defaultTitle, defaultDescription])

  // Load staff list
  useEffect(() => {
    if (!open || !clinicId) return
    const supabase = createClient()
    supabase
      .from('clinic_users')
      .select('id, name, role')
      .eq('clinic_id', clinicId)
      .then(({ data }) => {
        setStaff((data ?? []) as StaffMember[])
      })
  }, [open, clinicId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()

      // Create task
      await supabase.from('tasks').insert({
        clinic_id: clinicId,
        title,
        description,
        priority,
        status: 'PENDING',
        assigned_to: assignee || null,
        due_at: dueDate ? `${dueDate}T17:00:00` : null,
        case_id: callId,
        created_at: new Date().toISOString(),
      })

      // Mark call as actioned
      await supabase
        .from('call_inbox')
        .update({ status: 'ACTIONED', updated_at: new Date().toISOString() })
        .eq('id', callId)

      onCreated()
      onClose()
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] shadow-[var(--shadow-lg)] w-full max-w-[480px] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)] font-heading">Create Callback Task</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l8 8M13 5l-8 8" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-medium mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors resize-none"
            />
          </div>

          {/* Assignee + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-medium mb-1.5">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-medium mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'NORMAL' | 'HIGH' | 'URGENT')}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-medium mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={loading}>Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
