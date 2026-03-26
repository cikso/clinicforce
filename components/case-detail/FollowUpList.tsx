import { CheckSquare, Square, CalendarClock } from 'lucide-react'
import type { FollowUpTask } from '@/lib/types'
import { cn } from '@/lib/utils'

function formatDue(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.round((date.getTime() - now.getTime()) / 86400000)

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays} days`
}

interface FollowUpListProps {
  tasks: FollowUpTask[]
}

export default function FollowUpList({ tasks }: FollowUpListProps) {
  if (tasks.length === 0) return null

  return (
    <div className="px-5 pb-4">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        Follow-up tasks
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => {
          const dueLabel = formatDue(task.dueDate)
          const overdue = dueLabel === 'Overdue'

          return (
            <div
              key={task.id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-white"
            >
              {task.completed ? (
                <CheckSquare className="w-4 h-4 text-green-500 shrink-0 mt-0.5" strokeWidth={2} />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" strokeWidth={2} />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs text-foreground leading-relaxed',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.task}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <CalendarClock className="w-3 h-3 text-muted-foreground/60" />
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        overdue ? 'text-red-600' : 'text-muted-foreground'
                      )}
                    >
                      {dueLabel}
                    </span>
                  </div>
                  <span className="text-muted-foreground/30 text-[10px]">·</span>
                  <span className="text-[10px] text-muted-foreground">{task.assignedTo}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
