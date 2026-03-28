'use client'

import { Phone, Calendar, MessageSquare } from 'lucide-react'
import type { FollowUpItem } from '@/data/mock-dashboard'

interface FollowUpQueueProps {
  items: FollowUpItem[]
  onAction: (id: string, action: string) => void
}

export default function FollowUpQueue({ items, onAction }: FollowUpQueueProps) {
  const urgent   = items.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT')
  const bookings = items.filter(i => i.type === 'BOOKING_REQUEST')
  const routine  = items.filter(i => i.type === 'ROUTINE_CALLBACK')

  return (
    <div className="bg-white rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(15,39,68,0.06)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-bold text-slate-900">Follow-Up Queue</span>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-bold text-white bg-[#0f2744] px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-slate-400">Nothing pending right now</p>
        </div>
      )}

      <div className="divide-y divide-slate-50">

        {/* Urgent callbacks */}
        {urgent.map(item => (
          <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {item.callerName}
                {item.petName ? <span className="text-slate-400 font-normal"> · {item.petName}</span> : null}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">{item.summary}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.receivedAt}</p>
            </div>
            <button
              onClick={() => onAction(item.id, 'CALL_BACK')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Phone className="w-3 h-3" />
              Call
            </button>
          </div>
        ))}

        {/* Booking requests */}
        {bookings.map(item => (
          <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {item.callerName}
                {item.petName ? <span className="text-slate-400 font-normal"> · {item.petName}</span> : null}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">{item.summary}</p>
            </div>
            <button
              onClick={() => onAction(item.id, 'BOOK')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Calendar className="w-3 h-3" />
              Book
            </button>
          </div>
        ))}

        {/* Routine callbacks */}
        {routine.map(item => (
          <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{item.callerName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">{item.summary}</p>
            </div>
            <button
              onClick={() => onAction(item.id, 'CALL_BACK')}
              className="shrink-0 px-2.5 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Call
            </button>
          </div>
        ))}

      </div>
    </div>
  )
}
