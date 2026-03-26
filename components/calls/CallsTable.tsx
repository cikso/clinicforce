'use client'

import type { Call } from '@/lib/types'
import CallRow from './CallRow'
import { PhoneOff } from 'lucide-react'

interface CallsTableProps {
  calls: Call[]
  onSelect: (call: Call) => void
}

export default function CallsTable({ calls, onSelect }: CallsTableProps) {
  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <PhoneOff className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium">No calls match these filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Caller
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Patient
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                AI summary
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Received
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {calls.map((call) => (
              <CallRow key={call.id} call={call} onClick={onSelect} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
