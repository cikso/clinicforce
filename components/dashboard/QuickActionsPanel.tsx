'use client'

import { Plus, AlertTriangle, UserCheck, Clock, ArrowRightLeft, Image, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface QuickActionsPanelProps {
  onNewCase: () => void
  onEscalate: () => void
  onAssign: () => void
  onBookSlot: () => void
}

interface Action {
  icon: React.ReactNode
  label: string
  sublabel: string
  onClick?: () => void
  href?: string
  color: string
}

export default function QuickActionsPanel({ onNewCase, onEscalate, onAssign, onBookSlot }: QuickActionsPanelProps) {
  const actions: Action[] = [
    {
      icon: <Plus className="w-4 h-4" />,
      label: 'New Case',
      sublabel: 'Start intake',
      onClick: onNewCase,
      color: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]',
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Escalate to ER',
      sublabel: 'Emergency flag',
      onClick: onEscalate,
      color: 'bg-rose-50 text-[#b91c1c] hover:bg-rose-100',
    },
    {
      icon: <UserCheck className="w-4 h-4" />,
      label: 'Assign Clinician',
      sublabel: 'Open case',
      onClick: onAssign,
      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Book Emergency Slot',
      sublabel: 'Reserve time',
      onClick: onBookSlot,
      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    },
    {
      icon: <ArrowRightLeft className="w-4 h-4" />,
      label: 'Send Referral',
      sublabel: 'Phase 2',
      href: '/referrals',
      color: 'bg-slate-100 text-slate-400 cursor-not-allowed',
    },
    {
      icon: <Image className="w-4 h-4" />,
      label: 'Review Media',
      sublabel: 'Phase 2',
      href: '/media-review',
      color: 'bg-slate-100 text-slate-400 cursor-not-allowed',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
      </div>

      <div className="p-3 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const inner = (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left w-full ${action.color}`}>
              <div className="shrink-0">{action.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{action.label}</p>
                <p className="text-[10px] opacity-70 truncate">{action.sublabel}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            </div>
          )

          if (action.href) {
            return (
              <Link key={action.label} href={action.href} className="block">
                {inner}
              </Link>
            )
          }

          return (
            <button key={action.label} onClick={action.onClick} className="block">
              {inner}
            </button>
          )
        })}
      </div>
    </div>
  )
}
