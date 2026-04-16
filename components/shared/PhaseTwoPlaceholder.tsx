'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

interface PhaseTwoPlaceholderProps {
  title: string
  description: string
  icon: React.ReactNode
  phase?: string
}

export default function PhaseTwoPlaceholder({
  title,
  description,
  icon,
  phase = 'Phase 2',
}: PhaseTwoPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-8">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-slate-200 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-slate-50" />
        <span className="relative z-10 text-[#00D68F]">{icon}</span>
      </div>

      <div className="flex items-center gap-2 bg-[#E6FBF2] text-[#00D68F] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
        <Sparkles className="w-3.5 h-3.5" />
        Available in {phase}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-8">{description}</p>

      <Link
        href="/overview"
        className="flex items-center gap-2 px-6 py-2.5 bg-[#00D68F] text-white rounded-full text-sm font-bold hover:bg-[#00B578] transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  )
}
