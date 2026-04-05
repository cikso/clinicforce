'use client'

import { Sparkles } from 'lucide-react'
import { mockQueue } from '@/data/mock-queue'
import Link from 'next/link'
import { useVertical } from '@/context/VerticalContext'

const triageBg: Record<string, string> = {
  URGENT: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  ROUTINE: 'bg-blue-50 text-[#0f5b8a] border-blue-200',
  FOLLOW_UP: 'bg-slate-100 text-slate-600 border-slate-200',
}

const triageDot: Record<string, string> = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-orange-500',
  ROUTINE: 'bg-[#0ea5e9]',
  FOLLOW_UP: 'bg-slate-400',
}

export default function CareQueuePanel() {
  const vertical = useVertical()
  const top5 = [...mockQueue]
    .sort((a, b) => {
      const order: Record<string, number> = { URGENT: 0, HIGH: 1, ROUTINE: 2, FOLLOW_UP: 3 }
      return order[a.triageLevel] - order[b.triageLevel]
    })
    .slice(0, 5)

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Active Care Queue</h2>
        <Link href="/care-queue" className="text-sm font-medium text-[#0f5b8a] hover:text-[#0c4a70] transition-colors">
          View Full Queue
        </Link>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
            <th className="px-6 py-3">{vertical.patientLabel}</th>
            <th className="px-4 py-3">Urgency</th>
            <th className="px-4 py-3">Wait</th>
            <th className="px-6 py-3">AI Summary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {top5.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-900 text-sm">{entry.patient.name}</p>
                <p className="text-xs text-slate-500">{entry.patient.species} / {entry.patient.breed}</p>
              </td>
              <td className="px-4 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${triageBg[entry.triageLevel]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${triageDot[entry.triageLevel]}`}></span>
                  {entry.triageLevel}
                </span>
              </td>
              <td className="px-4 py-4">
                <p className="font-bold text-slate-900 text-sm">{entry.waitMinutes}m</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 max-w-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f5b8a] shrink-0" />
                  <p className="text-xs text-slate-600 italic truncate">{entry.aiSummary}</p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
