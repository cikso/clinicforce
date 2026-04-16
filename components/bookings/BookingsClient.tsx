'use client'

import { useState } from 'react'
import {
  CheckCircle2, Clock, History, List, Calendar,
  ChevronDown, ChevronLeft, ChevronRight, Plus
} from 'lucide-react'
import { mockBookings } from '@/data/mock-bookings'
import { formatRelative } from '@/lib/formatters'

export default function BookingsClient() {
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const newRequests = mockBookings.filter((b) => b.isNewRequest)
  const confirmed = mockBookings.filter((b) => !b.isNewRequest && b.status === 'CONFIRMED')
  const checkedIn = mockBookings.filter((b) => !b.isNewRequest && b.status === 'CHECKED_IN')

  return (
    <div className="flex flex-col">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Queue Status</p>
          <h3 className="text-4xl font-bold text-[var(--brand)] mb-3">{confirmed.length + checkedIn.length} Booked</h3>
          <p className="text-sm font-semibold text-teal-700 flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            {newRequests.length} new requests pending
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Today&apos;s Capacity</p>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-4xl font-bold text-slate-900">84%</h3>
            <span className="text-sm font-semibold text-slate-600">Full</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-[var(--brand)] h-2.5 rounded-full w-[84%]"></div>
          </div>
        </div>
        <div className="bg-[#eaf8f4] rounded-3xl p-6 border border-[#ccede4]">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Slot</p>
          <h3 className="text-4xl font-bold text-[var(--brand)] mb-3">2:30 PM</h3>
          <p className="text-sm font-semibold text-teal-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Immediate Availability
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex bg-slate-100 p-1.5 rounded-full">
          <button onClick={() => setView('list')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-colors ${view === 'list' ? 'bg-white shadow-sm text-[var(--brand)]' : 'text-slate-500'}`}>
            <List className="w-4 h-4" />
            List View
          </button>
          <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-[var(--brand)]' : 'text-slate-500'}`}>
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Filter by:</span>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Urgency <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Patient Type <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left: New Requests */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-900">New Requests</h2>
            <span className="px-2.5 py-0.5 bg-[var(--brand)] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              {newRequests.length} New
            </span>
          </div>
          <div className="space-y-4">
            {newRequests.map((booking) => {
              const isEmergency = booking.appointmentType.toLowerCase().includes('emergency') || booking.appointmentType.toLowerCase().includes('triage')
              return (
                <div key={booking.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isEmergency ? 'bg-[#b91c1c]' : 'bg-[#bae6fd]'}`}></div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.patient.ownerName.replace(/\s/g, '')}&backgroundColor=1e293b`}
                          alt={booking.patient.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{booking.patient.name}</h3>
                        <p className="text-sm text-slate-600">Owner: {booking.patient.ownerName} • {booking.patient.species} ({booking.patient.age})</p>
                      </div>
                    </div>
                    {isEmergency && (
                      <span className="px-3 py-1 bg-red-100 text-[#b91c1c] text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {booking.appointmentType}
                      </span>
                    )}
                  </div>
                  {booking.triageReason && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <List className="w-3.5 h-3.5" />
                        Triage Reason
                      </p>
                      <p className="text-sm text-slate-700 italic">&ldquo;{booking.triageReason}&rdquo;</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{isEmergency ? 'ASAP' : booking.assignedVet}</p>
                          <p className="text-xs text-slate-500">Today</p>
                        </div>
                      </div>
                      {booking.submittedAt && (
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-slate-400" />
                          <p className="text-xs text-slate-500">{formatRelative(booking.submittedAt)}</p>
                        </div>
                      )}
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-bold hover:bg-[var(--brand-hover)] transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Notify
                    </button>
                  </div>
                </div>
              )
            })}
            {newRequests.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200">
                No pending requests
              </div>
            )}
          </div>
        </div>

        {/* Right: Slot Availability */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Slot Availability</h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {/* Date selector */}
            <div className="flex items-center justify-between mb-8">
              <button className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <h3 className="text-lg font-bold text-slate-900">Thursday, Mar 26</h3>
              <button className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
            </div>
            {/* Timeline */}
            <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-[72px] before:w-px before:bg-slate-100">
              {[
                { time: '09:00 AM', label: 'Surgery Room 1 • Occupied', badge: 'CRITICAL', badgeBg: 'bg-red-100 text-[#b91c1c]', barColor: 'bg-[#b91c1c]', filled: true },
                { time: '10:30 AM', label: null, badge: null, barColor: null, filled: false },
                { time: '11:00 AM', label: 'Checkup • Bella (Cavalier)', vet: 'Dr. Walsh', filled: true, blue: true },
                { time: '01:30 PM', label: null, filled: false },
                { time: '02:00 PM', label: 'Shift Change / Break', muted: true, filled: true },
              ].map((slot) => (
                <div key={slot.time} className="flex items-center gap-6 relative">
                  <div className="w-16 text-right shrink-0">
                    <span className={`text-xs font-bold ${slot.muted ? 'text-slate-400' : 'text-slate-900'}`}>{slot.time}</span>
                  </div>
                  {slot.filled ? (
                    <div className={`flex-1 ${slot.muted ? 'bg-slate-50' : 'bg-slate-100'} rounded-full py-3 px-5 flex items-center justify-between relative overflow-hidden`}>
                      {slot.barColor && <div className={`absolute left-0 top-0 bottom-0 w-1 ${slot.barColor}`}></div>}
                      <span className={`text-sm font-bold ${slot.muted ? 'text-slate-400 font-medium' : 'text-slate-700'}`}>{slot.label}</span>
                      {slot.badge && <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${slot.badgeBg}`}>{slot.badge}</span>}
                      {slot.vet && <span className="text-xs font-medium text-slate-500">{slot.vet}</span>}
                    </div>
                  ) : (
                    <div className="flex-1 border border-dashed border-slate-300 rounded-full py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-400">Available Slot</span>
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Plus className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Resource utilization */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Resource Utilization</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Exam Rooms</p>
                  <div className="flex gap-1 mb-2">
                    {[true, true, false, false].map((on, i) => (
                      <div key={i} className={`h-2 flex-1 rounded-full ${on ? 'bg-[var(--brand)]' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-900">2 of 4 Free</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Staffing</p>
                  <div className="flex gap-1 mb-2">
                    {[true, true, true, false].map((on, i) => (
                      <div key={i} className={`h-2 flex-1 rounded-full ${on ? 'bg-teal-600' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-900">75% On Duty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
