'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import EmptyState from '@/app/components/ui/EmptyState'

interface TaskItem {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  created_at: string
  case_id: string | null
}

interface ActionQueuePreviewProps {
  initialTasks: TaskItem[]
  pendingCount: number
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function priorityVariant(p: string): 'urgent' | 'high' | 'routine' {
  if (p === 'URGENT' || p === 'CRITICAL') return 'urgent'
  if (p === 'HIGH') return 'high'
  return 'routine'
}

export default function ActionQueuePreview({
  initialTasks,
  pendingCount,
}: ActionQueuePreviewProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)

  const handleComplete = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try {
      const supabase = createClient()
      await supabase
        .from('tasks')
        .update({ status: 'DONE' })
        .eq('id', taskId)
    } catch { /* ignore */ }
  }, [])

  return (
    <Card
      header={{
        title: 'Action Queue',
        subtitle: 'Items requiring staff attention',
        action: pendingCount > 0 ? (
          <Badge variant="high">{pendingCount} pending</Badge>
        ) : undefined,
      }}
      footer={
        <Link
          href="/actions"
          className="text-[13px] font-medium text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
        >
          View all actions &rarr;
        </Link>
      }
    >
      {tasks.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
              <circle cx="24" cy="24" r="18" />
              <path d="M18 24l4 4 8-8" />
            </svg>
          }
          title="All caught up!"
          description="No pending actions."
        />
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 py-2.5 px-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleComplete(task.id)}
                className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded border border-[var(--border)] bg-white flex items-center justify-center hover:border-[var(--brand)] hover:bg-[var(--brand-light)] transition-colors"
                aria-label="Mark as done"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={priorityVariant(task.priority)}>
                  {task.priority}
                </Badge>
                <span className="text-[11px] text-[var(--text-tertiary)] font-mono-data whitespace-nowrap">
                  {relativeTime(task.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
