import { Sparkles } from 'lucide-react'
import type { QueueEntry } from '@/lib/types'

const urgencyStyle: Record<string, string> = {
  URGENT: 'bg-[#b91c1c] text-white',
  HIGH: 'bg-orange-100 text-orange-700',
  ROUTINE: 'bg-teal-50 text-teal-700',
  FOLLOW_UP: 'bg-slate-100 text-slate-600',
}

const urgencyDot: Record<string, string> = {
  URGENT: 'bg-white',
  HIGH: 'bg-orange-500',
  ROUTINE: 'bg-teal-500',
  FOLLOW_UP: 'bg-slate-400',
}

const actionStyle: Record<string, string> = {
  URGENT: 'bg-[#0f5b8a] text-white hover:bg-[#0c4a70]',
  HIGH: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  ROUTINE: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  FOLLOW_UP: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
}

const actionLabel: Record<string, string> = {
  URGENT: 'ATTEND',
  HIGH: 'REVIEW',
  ROUTINE: 'ASSIGN',
  FOLLOW_UP: 'VIEW',
}

const speciesEmoji: Record<string, string> = {
  Canine: '🐕',
  Feline: '🐈',
  Avian: '🦜',
  Exotic: '🦎',
}

const speciesBg: Record<string, string> = {
  URGENT: 'bg-red-50',
  HIGH: 'bg-orange-50',
  ROUTINE: 'bg-teal-50',
  FOLLOW_UP: 'bg-slate-50',
}

interface Props {
  entries: QueueEntry[]
  onOpenCase: (id: string) => void
}

export default function QueueTable({ entries, onOpenCase }: Props) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
          <th className="px-8 py-4">PATIENT &amp; SPECIES</th>
          <th className="px-4 py-4">URGENCY</th>
          <th className="px-4 py-4">WAIT TIME</th>
          <th className="px-4 py-4">AI TRIAGE SUMMARY</th>
          <th className="px-4 py-4">CLINICIAN</th>
          <th className="px-8 py-4 text-right">ACTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <tr
            key={entry.id}
            className="hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => onOpenCase(entry.id)}
          >
            {/* Patient */}
            <td className="px-8 py-5">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    speciesBg[entry.triageLevel] ?? 'bg-slate-50'
                  }`}
                >
                  {speciesEmoji[entry.patient.species] ?? '🐾'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{entry.patient.name}</p>
                  <p className="text-sm text-slate-500">
                    {entry.patient.species} / {entry.patient.breed}
                  </p>
                </div>
              </div>
            </td>

            {/* Urgency */}
            <td className="px-4 py-5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${urgencyStyle[entry.triageLevel]}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot[entry.triageLevel]}`} />
                {entry.triageLevel === 'FOLLOW_UP' ? 'FOLLOW-UP' : entry.triageLevel}
              </span>
            </td>

            {/* Wait time */}
            <td className="px-4 py-5">
              <p className="font-bold text-slate-900">{entry.waitMinutes}m</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {entry.queueStatus.replace('_', ' ')}
              </p>
            </td>

            {/* AI summary */}
            <td className="px-4 py-5 max-w-xs">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#0f5b8a] shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 italic line-clamp-2">
                  &ldquo;{entry.aiSummary}&rdquo;
                </span>
              </div>
            </td>

            {/* Clinician */}
            <td className="px-4 py-5">
              <div className="flex items-center gap-3">
                {entry.assignedTo ? (
                  <>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.assignedAvatar ?? entry.assignedTo}&backgroundColor=e2e8f0`}
                        alt={entry.assignedTo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{entry.assignedTo}</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">
                      ?
                    </div>
                    <span className="text-sm font-semibold text-slate-400">Unassigned</span>
                  </>
                )}
              </div>
            </td>

            {/* Action */}
            <td className="px-8 py-5 text-right">
              <button
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-colors ${actionStyle[entry.triageLevel]}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenCase(entry.id)
                }}
              >
                {actionLabel[entry.triageLevel]}
              </button>
            </td>
          </tr>
        ))}

        {entries.length === 0 && (
          <tr>
            <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-sm">
              No cases match the current filter.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
