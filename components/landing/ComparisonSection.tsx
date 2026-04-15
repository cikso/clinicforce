'use client'

import { CheckCircle2, X, Minus } from 'lucide-react'

const rows: [string, string, string, string][] = [
  ['Available 24/7', 'yes', 'yes', 'yes'],
  ['Answers in <3 seconds', 'no', '~30 seconds', 'yes'],
  ['Understands clinical terminology', 'no', 'no', 'yes'],
  ['Emergency triage', 'no', 'Basic', 'AI-powered'],
  ['Captures booking intent', 'no', 'Sometimes', 'Always'],
  ['Structured summaries', 'no', 'no', 'yes'],
  ['Real-time dashboard', 'no', 'no', 'yes'],
  ['Cost per call', 'Free', '$5–10', 'Flat rate'],
  ['Handles multiple calls simultaneously', 'no', 'Limited', 'Unlimited'],
  ['Turn AI on/off anytime', 'no', 'no', 'yes'],
]

function CellContent({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === 'yes') {
    return <CheckCircle2 className={`h-5 w-5 ${highlight ? 'text-[#00D68F]' : 'text-[#7EEDC0]'}`} />
  }
  if (value === 'no') {
    return <X className="h-4 w-4 text-[#c4c4c4]" />
  }
  return (
    <span className={`text-sm font-medium ${highlight ? 'text-[#00D68F]' : 'text-[#566275]'}`}>
      {value}
    </span>
  )
}

export default function ComparisonSection() {
  return (
    <section className="px-1 py-24 sm:py-28">
      <div className="max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#00D68F]">
          Comparison
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
          Why clinics switch from voicemail and answering services
        </h2>
      </div>

      <div className="mt-12 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 pb-4 border-b border-[#E5EAF0]">
            <div className="text-sm font-semibold text-[#566275]">Feature</div>
            <div className="text-center text-sm font-semibold text-[#566275]">Voicemail</div>
            <div className="text-center text-sm font-semibold text-[#566275]">Answering Service</div>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6FBF2] px-3 py-1 text-sm font-bold text-[#00D68F]">
                ClinicForce
              </span>
            </div>
          </div>

          {/* Rows */}
          {rows.map(([feature, vm, as_, cf]) => (
            <div
              key={feature}
              className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 items-center py-4 border-b border-[#eef1f4]"
            >
              <div className="text-sm font-medium text-[#1A1A1A]">{feature}</div>
              <div className="flex justify-center">
                <CellContent value={vm} />
              </div>
              <div className="flex justify-center">
                <CellContent value={as_} />
              </div>
              <div className="flex justify-center rounded-lg bg-[#E6FBF2]/50 py-2">
                <CellContent value={cf} highlight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
