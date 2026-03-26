'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Call } from '@/lib/types'
import CallStatusBadge from './CallStatusBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatRelative, formatDuration, formatTime } from '@/lib/formatters'
import {
  Phone,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  CalendarPlus,
  UserPlus,
  StickyNote,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionBtnProps {
  icon: React.ElementType
  label: string
  variant?: 'default' | 'urgent' | 'success'
  done: boolean
  onClick: () => void
}

function ActionBtn({ icon: Icon, label, variant = 'default', done, onClick }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-left w-full',
        done
          ? 'bg-green-50 text-green-700 border-green-200'
          : variant === 'urgent'
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          : variant === 'success'
          ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
          : 'bg-white text-foreground border-border hover:bg-muted'
      )}
    >
      {done ? (
        <Check className="w-3.5 h-3.5 shrink-0 text-green-600" strokeWidth={2.5} />
      ) : (
        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      )}
      {done ? 'Done' : label}
    </button>
  )
}

type ActionKey = 'reviewed' | 'escalate' | 'followup' | 'link' | 'note'

interface CallDetailDrawerProps {
  call: Call | null
  open: boolean
  onClose: () => void
}

export default function CallDetailDrawer({ call, open, onClose }: CallDetailDrawerProps) {
  const [done, setDone] = useState<Set<ActionKey>>(new Set())

  const toggle = (key: ActionKey) =>
    setDone((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[460px] sm:max-w-[460px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{call ? `Call — ${call.callerName}` : 'Call detail'}</SheetTitle>
        </SheetHeader>

        {!call ? null : (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  {call.patient ? (
                    <PatientAvatar name={call.patient.name} species={call.patient.species} size="md" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-foreground">{call.callerName}</h2>
                      {call.urgencyFlag && (
                        <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2.5} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{call.callerPhone}</p>
                  </div>
                </div>
                <CallStatusBadge status={call.status} />
              </div>

              {/* Call meta */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg px-2 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Received</p>
                  <p className="text-xs font-semibold text-foreground">{formatRelative(call.timestamp)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg px-2 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Time</p>
                  <p className="text-xs font-semibold text-foreground">{formatTime(call.timestamp)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg px-2 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Duration</p>
                  <p className="text-xs font-semibold text-foreground">{formatDuration(call.durationSeconds)}</p>
                </div>
              </div>
            </div>

            {/* Linked patient */}
            {call.patient && (
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Linked patient
                </p>
                <div className="flex items-center gap-2">
                  <PatientAvatar name={call.patient.name} species={call.patient.species} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{call.patient.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {call.patient.species} · {call.patient.breed} · {call.patient.age}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Owner: {call.patient.ownerName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI summary */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-sm bg-primary/10 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary">AI</span>
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  AI triage summary
                </p>
              </div>
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2.5">
                <p className="text-xs text-foreground leading-relaxed">{call.aiSummary}</p>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                Auto-generated from call transcript. Staff to verify before acting.
              </p>
            </div>

            {/* Staff actions */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Staff actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn
                  icon={CheckCircle2}
                  label="Mark reviewed"
                  variant="success"
                  done={done.has('reviewed')}
                  onClick={() => toggle('reviewed')}
                />
                <ActionBtn
                  icon={ArrowUpCircle}
                  label="Escalate to queue"
                  variant="urgent"
                  done={done.has('escalate')}
                  onClick={() => toggle('escalate')}
                />
                <ActionBtn
                  icon={CalendarPlus}
                  label="Create follow-up"
                  done={done.has('followup')}
                  onClick={() => toggle('followup')}
                />
                <ActionBtn
                  icon={UserPlus}
                  label="Add to patient record"
                  done={done.has('link')}
                  onClick={() => toggle('link')}
                />
                <ActionBtn
                  icon={StickyNote}
                  label="Add note"
                  done={done.has('note')}
                  onClick={() => toggle('note')}
                />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
