'use client'

import { Clinician } from '@/data/mock-dashboard'
import { X, Check } from 'lucide-react'

interface AssignClinicianModalProps {
  isOpen: boolean
  caseId: string | null
  clinicians: Clinician[]
  onClose: () => void
  onAssign: (caseId: string, clinician: Clinician) => void
}

export default function AssignClinicianModal({ isOpen, caseId, clinicians, onClose, onAssign }: AssignClinicianModalProps) {
  if (!isOpen || !caseId) return null

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assign Clinician</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select an available clinician for this case</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clinicians */}
          <div className="p-4 grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
            {clinicians.map((c) => (
              <button
                key={c.id}
                disabled={!c.available}
                onClick={() => { onAssign(caseId, c); onClose() }}
                className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-colors ${
                  c.available
                    ? 'hover:bg-[#f0f6ff] border border-slate-100 hover:border-[#0f5b8a]/30'
                    : 'opacity-50 border border-slate-100 cursor-not-allowed'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.avatar}&backgroundColor=e2e8f0`}
                  alt={c.name}
                  className="w-11 h-11 rounded-full border border-slate-200 shrink-0"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                </div>
                {c.available ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Available
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Busy
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100">
            <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-200 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
