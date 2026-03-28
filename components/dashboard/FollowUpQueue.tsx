'use client'

import { Phone, Calendar, MessageSquare, AlertTriangle } from 'lucide-react'
import type { FollowUpItem } from '@/data/mock-dashboard'

interface FollowUpQueueProps {
  items: FollowUpItem[]
  onAction: (id: string, action: string) => void
}

export default function FollowUpQueue({ items, onAction }: FollowUpQueueProps) {
  const urgent = items.filter(i => i.urgency === 'CRITICAL' || i.urgency === 'URGENT')
  const bookings = items.filter(i => i.type === 'BOOKING_REQUEST')
  const routineCallbacks = items.filter(i => i.type === 'ROUTINE_CALLBACK')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-900">Needs Follow-Up</span>
        </div>
        <span className="text-xs font-bold text-white bg-[#0f5b8a] px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Urgent callbacks */}
        {urgent.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Urgent Callbacks ({urgent.length})</span>
            </div>
            <div className="space-y-2">
              {urgent.map(item => (
                <div key={item.id} className="bg-red-50/60 border border-red-100 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">{item.callerName} — {item.petName}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{item.summary}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{item.receivedAt}</p>
                    </div>
                    <button
                      onClick={() => onAction(item.id, 'CALL_BACK')}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking requests */}
        {bookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Booking Requests ({bookings.length})</span>
            </div>
            <div className="space-y-2">
              {bookings.map(item => (
                <div key={item.id} className="bg-sky-50/60 border border-sky-100 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">{item.callerName} — {item.petName}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{item.summary}</p>
                    </div>
                    <button
                      onClick={() => onAction(item.id, 'BOOK')}
                      className="shrink-0 px-2.5 py-1.5 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routine callbacks */}
        {routineCallbacks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Routine Callbacks ({routineCallbacks.length})</span>
            </div>
            <div className="space-y-2">
              {routineCallbacks.map(item => (
                <div key={item.id} className="border border-slate-100 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">{item.callerName}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{item.summary}</p>
                    </div>
                    <button
                      onClick={() => onAction(item.id, 'CALL_BACK')}
                      className="shrink-0 px-2.5 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
