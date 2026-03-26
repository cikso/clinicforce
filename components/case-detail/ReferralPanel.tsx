import { Send, CheckCircle2, Clock, Hourglass, MapPin } from 'lucide-react'
import type { Referral } from '@/lib/types'
import { formatTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const statusConfig = {
  NOTIFIED: {
    label: 'Notified',
    icon: Clock,
    className: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  CASE_SENT: {
    label: 'Case Sent',
    icon: Send,
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    icon: Hourglass,
    className: 'text-teal-600 bg-teal-50 border-teal-200',
  },
  ARRIVED: {
    label: 'Arrived',
    icon: CheckCircle2,
    className: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
}

interface ReferralPanelProps {
  referral: Referral
}

export default function ReferralPanel({ referral }: ReferralPanelProps) {
  const cfg = statusConfig[referral.status]
  const StatusIcon = cfg.icon

  return (
    <div className="mx-5 mb-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Send className="w-3.5 h-3.5 text-teal-500" strokeWidth={2} />
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Emergency Referral
        </h4>
        <span
          className={cn(
            'ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
            cfg.className
          )}
        >
          <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
          {cfg.label}
        </span>
      </div>
      <p className="text-xs font-semibold text-foreground mb-0.5">{referral.referredTo}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{referral.reason}</p>
      {referral.clinicPhone && (
        <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {referral.clinicDistance ?? ''} · {referral.clinicPhone}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground/60 mt-2">
        Sent {formatTime(referral.sentAt)}
      </p>
    </div>
  )
}
