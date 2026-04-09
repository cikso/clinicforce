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
]

function CellContent({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === 'yes') {
    return <CheckCircle2 className={`h-5 w-5 ${highlight ? 'text-[#1B6B4A]' : 'text-[#86C5A6]'}`} />
  }
  if (value === 'no') {
    return <X className="h-4 w-4 text-[#c4c4c4]" />
  }
  return (
    <span className={`text-sm font-medium ${highlight ? 'text-[#1B6B4A]' : 'text-[#61717f]'}`}>
      {value}
    </span>
  )
}

export default function ComparisonSection() {
  return (
    <section className="px-1 py-24 sm:py-28">
      <div className="max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#1B6B4A]">
          Comparison
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-4xl">
          Why clinics switch from voicemail and answering services
        </h2>
      </div>

      <div className="mt-12 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 pb-4 border-b border-[#dbe4eb]">
            <div className="text-sm font-semibold text-[#61717f]">Feature</div>
            <div className="text-center text-sm font-semibold text-[#61717f]">Voicemail</div>
            <div className="text-center text-sm font-semibold text-[#61717f]">Answering Service</div>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F4] px-3 py-1 text-sm font-bold text-[#1B6B4A]">
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
              <div className="flex justify-center rounded-lg bg-[#F0F7F4]/50 py-2">
                <CellContent value={cf} highlight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
