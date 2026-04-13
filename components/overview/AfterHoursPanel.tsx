import { Phone } from 'lucide-react'
import { mockCalls } from '@/data/mock-calls'
import { formatRelative } from '@/lib/formatters'
import Link from 'next/link'

export default function AfterHoursPanel() {
  const recent = mockCalls.slice(0, 3)

  return (
    <section>
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Phone className="w-4 h-4 text-slate-400" />
        After-Hours Calls
      </h3>
      <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
        {recent.map((call) => {
          const isUrgent = call.urgency === 'CRITICAL' || call.urgency === 'URGENT'
          return (
            <div key={call.id} className="relative">
              <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isUrgent ? 'bg-red-500' : 'bg-slate-300'
              }`}></div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-slate-900'}`}>
                    {call.callerName}{call.petName && call.petName !== '—' ? ` — ${call.petName}` : ''}
                  </h4>
                  <span className="text-xs text-slate-400">{formatRelative(call.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{call.summary}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Link href="/calls" className="mt-3 block text-center text-sm font-medium text-[#17C4BE] hover:text-[#13ADA8] transition-colors">
        View all calls →
      </Link>
    </section>
  )
}
