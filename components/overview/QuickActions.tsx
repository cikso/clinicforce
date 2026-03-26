import { Activity, ArrowRight, Clock, ChevronRight } from 'lucide-react'

const actions = [
  { icon: Activity, label: 'Create New Case' },
  { icon: ArrowRight, label: 'Refer Patient' },
  { icon: Clock, label: 'Book Emergency Slot' },
]

export default function QuickActions() {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-[#0f5b8a] rounded-md group-hover:bg-blue-100 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0f5b8a] transition-colors" />
          </button>
        ))}
      </div>
    </section>
  )
}
