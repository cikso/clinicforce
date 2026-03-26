'use client'

import { useState } from 'react'
import {
  UserPlus,
  MapPin,
  ArrowUpCircle,
  Send,
  StickyNote,
  LogOut,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  icon: React.ElementType
  label: string
  variant?: 'default' | 'urgent' | 'success'
  onClick: () => void
  done?: boolean
}

function ActionButton({ icon: Icon, label, variant = 'default', onClick, done }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left border',
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

interface CaseActionsProps {
  hasReferral: boolean
  queueStatus: string
}

type ActionKey =
  | 'assign'
  | 'room'
  | 'escalate'
  | 'referral'
  | 'note'
  | 'discharge'

export default function CaseActions({ hasReferral, queueStatus }: CaseActionsProps) {
  const [done, setDone] = useState<Set<ActionKey>>(new Set())

  const toggle = (key: ActionKey) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="px-5 py-4 border-t border-border">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Staff actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          icon={UserPlus}
          label="Assign vet"
          done={done.has('assign')}
          onClick={() => toggle('assign')}
        />
        <ActionButton
          icon={MapPin}
          label="Assign room"
          done={done.has('room')}
          onClick={() => toggle('room')}
        />
        <ActionButton
          icon={ArrowUpCircle}
          label="Escalate urgency"
          variant="urgent"
          done={done.has('escalate')}
          onClick={() => toggle('escalate')}
        />
        <ActionButton
          icon={Send}
          label={hasReferral ? 'Update referral' : 'Flag for referral'}
          variant="success"
          done={done.has('referral')}
          onClick={() => toggle('referral')}
        />
        <ActionButton
          icon={StickyNote}
          label="Add note"
          done={done.has('note')}
          onClick={() => toggle('note')}
        />
        {queueStatus !== 'PENDING_DISCHARGE' && (
          <ActionButton
            icon={LogOut}
            label="Mark for discharge"
            done={done.has('discharge')}
            onClick={() => toggle('discharge')}
          />
        )}
      </div>
    </div>
  )
}
