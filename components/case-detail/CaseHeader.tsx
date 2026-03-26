import { Phone, User, Calendar } from 'lucide-react'
import type { Case } from '@/lib/types'
import TriageBadge from '@/components/shared/TriageBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatTime } from '@/lib/formatters'

interface CaseHeaderProps {
  caseData: Case
}

export default function CaseHeader({ caseData }: CaseHeaderProps) {
  const { patient, triageLevel, chiefConcern, openedAt } = caseData

  return (
    <div className="px-5 py-4 border-b border-border">
      {/* Patient identity */}
      <div className="flex items-start gap-3 mb-3">
        <PatientAvatar name={patient.name} species={patient.species} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-foreground">{patient.name}</h2>
            <TriageBadge level={triageLevel} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {patient.species} · {patient.breed} · {patient.age}
          </p>
        </div>
      </div>

      {/* Chief concern */}
      <div className="bg-muted/50 rounded-lg px-3 py-2.5 mb-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Chief concern
        </p>
        <p className="text-xs text-foreground leading-relaxed">{chiefConcern}</p>
      </div>

      {/* Owner + meta */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{patient.ownerName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>{patient.ownerPhone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Case opened {formatTime(openedAt)}</span>
        </div>
      </div>
    </div>
  )
}
