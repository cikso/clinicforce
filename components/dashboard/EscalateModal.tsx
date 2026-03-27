'use client'

import { AlertTriangle, X } from 'lucide-react'

interface EscalateModalProps {
  isOpen: boolean
  caseId: string | null
  caseName?: string
  onClose: () => void
  onConfirm: (caseId: string) => void
}

export default function EscalateModal({ isOpen, caseId, caseName, onClose, onConfirm }: EscalateModalProps) {
  if (!isOpen || !caseId) return null

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm pointer-events-auto">
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-[#b91c1c]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Escalate to ER?</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {caseName
                ? `This will escalate ${caseName}'s case to Emergency status and notify the ER team immediately.`
                : 'This will escalate the selected case to Emergency status and notify the ER team.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => { onConfirm(caseId); onClose() }}
                className="flex-1 py-3 bg-[#b91c1c] text-white font-bold rounded-full hover:bg-red-800 transition-colors text-sm"
              >
                Escalate Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
