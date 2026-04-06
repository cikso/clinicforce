'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react'

export interface SetupStep {
  id:          string
  label:       string
  description: string
  done:        boolean
  href:        string
  cta:         string
}

interface Props {
  steps:      SetupStep[]
  clinicName: string
}

export default function GettingStartedPanel({ steps, clinicName }: Props) {
  const [collapsed,  setCollapsed]  = useState(false)
  const [dismissed,  setDismissed]  = useState(false)

  if (dismissed) return null

  const doneCount  = steps.filter(s => s.done).length
  const totalCount = steps.length
  const allDone    = doneCount === totalCount
  const pct        = Math.round((doneCount / totalCount) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(15,39,68,0.04)] mb-5 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Progress ring — simple pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-9 h-9">
              <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke={allDone ? '#10b981' : '#0891b2'}
                  strokeWidth="3"
                  strokeDasharray={`${pct * 0.942} 94.2`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.4s ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                {doneCount}/{totalCount}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {allDone
                ? `${clinicName} is fully set up`
                : `Finish setting up ${clinicName}`}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {allDone
                ? 'All setup steps complete — your AI receptionist is ready to go live.'
                : `${totalCount - doneCount} step${totalCount - doneCount !== 1 ? 's' : ''} remaining before going live`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {allDone && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Steps ── */}
      {!collapsed && (
        <div className="divide-y divide-slate-50">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                step.done ? 'opacity-60' : 'hover:bg-slate-50/60'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0">
                {step.done ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>

              {/* CTA */}
              {!step.done && (
                <Link
                  href={step.href}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0891b2]/8 text-[#0891b2] text-xs font-semibold hover:bg-[#0891b2]/15 transition-colors whitespace-nowrap"
                >
                  {step.cta}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}

              {step.done && (
                <span className="shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Done
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Footer progress bar ── */}
      {!collapsed && (
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">Setup progress</span>
            <span className="text-xs font-semibold text-slate-600">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-[#0891b2]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
