import { ClinicCapacity } from '@/data/mock-dashboard'
import { DoorOpen, Clock, Users, AlertCircle } from 'lucide-react'

interface ClinicCapacityCardProps {
  capacity: ClinicCapacity
  pendingCount: number
}

function getLoadStatus(capacity: ClinicCapacity, pendingCount: number) {
  const roomsFree = capacity.totalRooms - capacity.occupiedRooms
  if (roomsFree === 0 || pendingCount > 6)
    return { label: 'Critical Load', color: 'text-[#b91c1c]', bg: 'bg-rose-50', dot: 'bg-[#b91c1c]' }
  if (roomsFree <= 1 || pendingCount > 4)
    return { label: 'High Load', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' }
  if (pendingCount > 2)
    return { label: 'Busy', color: 'text-[#00BFA5]', bg: 'bg-teal-50', dot: 'bg-[#00BFA5]' }
  return { label: 'Stable', color: 'text-teal-700', bg: 'bg-teal-50', dot: 'bg-teal-500' }
}

export default function ClinicCapacityCard({ capacity, pendingCount }: ClinicCapacityCardProps) {
  const { totalRooms, occupiedRooms, nextSlotTime, cliniciansOnDuty, cliniciansAvailable } = capacity
  const roomsFree = totalRooms - occupiedRooms
  const status = getLoadStatus(capacity, pendingCount)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Clinic Capacity</h3>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Rooms */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-600">
            <DoorOpen className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">Exam Rooms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: totalRooms }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm transition-colors ${i < occupiedRooms ? 'bg-[#00BFA5]' : 'bg-slate-100'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500 ml-1">{roomsFree} free</span>
          </div>
        </div>

        {/* Next slot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">Next ER Slot</span>
          </div>
          <span className="text-sm font-bold text-teal-700">{nextSlotTime}</span>
        </div>

        {/* Clinicians */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">Clinicians</span>
          </div>
          <span className="text-xs font-bold text-slate-700">
            <span className="text-[#00BFA5]">{cliniciansAvailable}</span> / {cliniciansOnDuty} available
          </span>
        </div>

        {/* Queue load */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-600">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">Queue Load</span>
          </div>
          <span className={`text-xs font-bold ${pendingCount > 4 ? 'text-[#b91c1c]' : 'text-slate-700'}`}>
            {pendingCount} pending triage
          </span>
        </div>
      </div>
    </div>
  )
}
