'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Booking } from '@/lib/types'
import BookingStatusBadge from './BookingStatusBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatTime } from '@/lib/formatters'
import {
  CalendarDays,
  User,
  Phone,
  LogIn,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  StickyNote,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ActionKey = 'checkin' | 'complete' | 'cancel' | 'reschedule' | 'note'

interface ActionBtnProps {
  icon: React.ElementType
  label: string
  variant?: 'default' | 'danger' | 'success'
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
          : variant === 'danger'
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

interface BookingDetailDrawerProps {
  booking: Booking | null
  open: boolean
  onClose: () => void
}

export default function BookingDetailDrawer({ booking, open, onClose }: BookingDetailDrawerProps) {
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
          <SheetTitle>
            {booking ? `Booking — ${booking.patient.name}` : 'Booking detail'}
          </SheetTitle>
        </SheetHeader>

        {!booking ? null : (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header — patient */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-start gap-3 mb-3">
                <PatientAvatar
                  name={booking.patient.name}
                  species={booking.patient.species}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h2 className="text-base font-bold text-foreground">{booking.patient.name}</h2>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {booking.patient.species} · {booking.patient.breed} · {booking.patient.age}
                  </p>
                </div>
              </div>

              {/* Owner */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  {booking.patient.ownerName}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {booking.patient.ownerPhone}
                </div>
              </div>
            </div>

            {/* Appointment detail */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Appointment
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{booking.appointmentType}</span>
                  <span className="text-muted-foreground">at {formatTime(booking.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  {booking.assignedVet}
                </div>
                {booking.notes && (
                  <div className="bg-muted/50 rounded-lg px-3 py-2 mt-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Notes
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff actions */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Staff actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn
                  icon={LogIn}
                  label="Check in patient"
                  variant="success"
                  done={done.has('checkin')}
                  onClick={() => toggle('checkin')}
                />
                <ActionBtn
                  icon={CheckCircle2}
                  label="Mark completed"
                  done={done.has('complete')}
                  onClick={() => toggle('complete')}
                />
                <ActionBtn
                  icon={XCircle}
                  label="Cancel booking"
                  variant="danger"
                  done={done.has('cancel')}
                  onClick={() => toggle('cancel')}
                />
                <ActionBtn
                  icon={CalendarPlus}
                  label="Reschedule"
                  done={done.has('reschedule')}
                  onClick={() => toggle('reschedule')}
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
