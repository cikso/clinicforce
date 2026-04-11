import { cn } from '@/lib/utils'

interface InboxCall {
  id: string
  caller_name: string
  summary: string
  urgency: string
  status: string
  action_required: string | null
  created_at: string
}

interface CallInboxPanelProps {
  calls: InboxCall[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch { return '—' }
}

type BadgeType = 'urgent' | 'callback' | 'routine'

function getBadge(call: InboxCall): { type: BadgeType; label: string } {
  if (call.urgency === 'CRITICAL' || call.urgency === 'URGENT') {
    return { type: 'urgent', label: 'Urgent' }
  }
  if (call.action_required) {
    return { type: 'callback', label: 'Callback' }
  }
  return { type: 'routine', label: 'Routine' }
}

const BADGE_STYLES: Record<BadgeType, string> = {
  urgent:   'bg-[#FDEEEE] text-[#C0392B] border-[#F5BDB9]',
  callback: 'bg-[#EAF7F1] text-[#0A6B4F] border-[#B3DFD0]',
  routine:  'bg-[#F4F6F9] text-[#637381] border-[#DDE1E7]',
}

export default function CallInboxPanel({ calls }: CallInboxPanelProps) {
  return (
    <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-[3px] h-4 rounded-full bg-[#0A7A5B]" />
        <h3 className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#8A94A6]">Call Inbox</h3>
      </div>

      {calls.length === 0 ? (
        <p className="text-[12px] text-[#8A94A6] text-center py-8">No calls today yet.</p>
      ) : (
        <div>
          {calls.map((call, i) => {
            const badge = getBadge(call)
            const isLast = i === calls.length - 1
            return (
              <div
                key={call.id}
                className={cn('flex items-center gap-3 py-3', !isLast && 'border-b border-[#F0F2F5]')}
              >
                {/* Avatar */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: '#D6E4F5',
                    border: '1px solid #B8CDE8',
                    color: '#1A5FA8',
                  }}
                >
                  {getInitials(call.caller_name || 'U')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#0A2540] truncate">{call.caller_name || 'Unknown'}</p>
                  <p className="text-[11px] text-[#8A94A6] truncate">{call.summary || 'No summary'}</p>
                </div>

                {/* Right: time + badge */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-[#B0BAC9]">{formatTime(call.created_at)}</span>
                  <span className={cn(
                    'text-[9px] font-semibold px-2 py-0.5 rounded border',
                    BADGE_STYLES[badge.type],
                  )}>
                    {badge.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
