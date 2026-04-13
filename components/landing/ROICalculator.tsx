'use client'

import { useState } from 'react'

function formatCurrency(n: number): string {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 })
}

export default function ROICalculator() {
  const [callsPerDay, setCallsPerDay] = useState(40)
  const [missRate, setMissRate] = useState(25)
  const [bookingValue, setBookingValue] = useState(280)

  const workingDays = 22
  const missedPerMonth = Math.round(callsPerDay * (missRate / 100) * workingDays)
  const lostRevenue = missedPerMonth * bookingValue
  const recoveredRevenue = Math.round(lostRevenue * 0.85)
  const annualRecovery = recoveredRevenue * 12

  return (
    <section className="relative rounded-[36px] overflow-hidden bg-[#0F172A] px-6 py-20 sm:px-8 lg:px-12">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#00BFA5]/10 blur-[120px]" />
        <div className="absolute -left-20 -bottom-20 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#80DFCC]">
            ROI Calculator
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            What missed calls cost your clinic
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#94a3b8] sm:text-lg">
            Most clinics miss 20–30% of inbound calls during peak hours. Here&apos;s what that means for your revenue.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-start">
          {/* Sliders */}
          <div className="space-y-8">
            <SliderField
              label="Calls per day"
              value={callsPerDay}
              min={10}
              max={100}
              step={5}
              display={String(callsPerDay)}
              onChange={setCallsPerDay}
            />
            <SliderField
              label="Missed call rate"
              value={missRate}
              min={5}
              max={50}
              step={1}
              display={`${missRate}%`}
              onChange={setMissRate}
            />
            <SliderField
              label="Average booking value"
              value={bookingValue}
              min={50}
              max={500}
              step={10}
              display={formatCurrency(bookingValue)}
              onChange={setBookingValue}
            />
          </div>

          {/* Results card */}
          <div className="rounded-3xl border border-[#1e293b] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] lg:-mt-4">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7d8b]">
              Your estimated impact
            </p>

            <div className="space-y-5">
              <ResultRow label="Missed calls per month" value={String(missedPerMonth)} />
              <ResultRow
                label="Estimated lost revenue"
                value={`${formatCurrency(lostRevenue)} /month`}
                highlight="red"
              />
              <div className="border-t border-[#eef1f4] pt-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#00BFA5]">
                  With ClinicForce
                </p>
                <p className="text-sm text-[#61717f] mb-4">
                  Recover up to 85% of missed calls
                </p>
                <ResultRow
                  label="Potential recovered revenue"
                  value={`${formatCurrency(recoveredRevenue)} /month`}
                  highlight="green"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#E0F7F3] border border-[#00BFA5]/15 p-5 text-center">
              <p className="text-sm text-[#536171]">That&apos;s</p>
              <p className="text-3xl font-bold tracking-[-0.04em] text-[#00BFA5]">
                {formatCurrency(annualRecovery)}
              </p>
              <p className="text-sm text-[#536171]">per year your clinic could recover</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#c6d3df]">{label}</span>
        <span className="text-lg font-bold tabular-nums text-white">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="roi-slider w-full"
        style={{
          background: `linear-gradient(to right, #00BFA5 ${pct}%, #1e293b ${pct}%)`,
        }}
      />
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-[#475569]">{min}</span>
        <span className="text-[11px] text-[#475569]">{max}</span>
      </div>
    </div>
  )
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: 'red' | 'green'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#61717f]">{label}</span>
      <span
        className={`text-base font-bold tabular-nums ${
          highlight === 'red'
            ? 'text-red-500'
            : highlight === 'green'
              ? 'text-[#00BFA5]'
              : 'text-[#1A1A1A]'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
