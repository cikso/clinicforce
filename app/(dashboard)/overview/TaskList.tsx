'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export type Task = {
  id: string
  caller_name: string | null
  summary: string | null
  urgency: string | null
  action_required: string | null
  created_at: string
}

type BadgeKind = 'Callback' | 'Escalated' | 'Message'

const BADGE_STYLES: Record<BadgeKind, string> = {
  Callback:  'bg-[#E6F0FB] text-[#1A5FA8] border-[#C5DAF0]',
  Escalated: 'bg-[#FDEEEE] text-[#C0392B] border-[#F5BDB9]',
  Message:   'bg-[#F4F6F9] text-[#5A6778] border-[#DDE1E7]',
}

function badgeFor(task: Task): BadgeKind {
  if (task.urgency === 'URGENT' || task.urgency === 'CRITICAL') return 'Escalated'
  if (/\b(call.?back|callback|ring back|phone back)\b/i.test(task.action_required ?? '')) return 'Callback'
  return 'Message'
}

function truncate(s: string | null, max = 80): string {
  const t = (s ?? '').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).trimEnd() + '…'
}

function relTime(iso: string): string {
  const now = new Date()
  const d = new Date(iso)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfToday.getTime() - startOfD.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const [done, setDone] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#0A2540]">Tasks for your team</h2>
        <span className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Unresolved</span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-[#8A94A6] py-6 text-center">
          No pending tasks — Sarah handled everything.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-[#EEF1F4]">
            {tasks.map((task) => {
              const checked = done.has(task.id)
              const badge = badgeFor(task)
              return (
                <li
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 py-2.5 transition-opacity',
                    checked && 'opacity-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(task.id)}
                    aria-label={`Mark ${task.caller_name || 'task'} as done`}
                    className="h-4 w-4 rounded border border-[#DDE1E7] text-[#0A7A5B] cursor-pointer shrink-0"
                  />
                  <span
                    className={cn(
                      'text-xs font-semibold text-[#0A2540] w-32 truncate shrink-0',
                      checked && 'line-through',
                    )}
                  >
                    {task.caller_name || 'Unknown'}
                  </span>
                  <span
                    className={cn(
                      'flex-1 text-xs text-[#5A6778] truncate',
                      checked && 'line-through',
                    )}
                    title={task.summary ?? ''}
                  >
                    {truncate(task.summary, 80)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0',
                      BADGE_STYLES[badge],
                    )}
                  >
                    {badge}
                  </span>
                  <span className="text-[10px] text-[#8A94A6] w-16 text-right shrink-0 tabular-nums">
                    {relTime(task.created_at)}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="text-[10px] text-[#B0BAC9] mt-4">(changes not saved)</p>
        </>
      )}
    </div>
  )
}
