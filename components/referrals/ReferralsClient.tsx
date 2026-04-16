'use client'

import { useState } from 'react'
import {
  PlusSquare,
  PawPrint,
  Check,
  Clock,
  Hourglass,
  Compass,
  Phone,
  Map,
  Zap,
  Search,
  ChevronDown,
  Bot,
  Send,
  Asterisk,
} from 'lucide-react'
import { mockReferrals, mockPartnerClinics } from '@/data/mock-referrals'
import type { Referral } from '@/lib/types'

export default function ReferralsClient() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedClinic, setSelectedClinic] = useState(mockPartnerClinics[0].name)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Referral Hub</h1>
          <p className="text-lg text-slate-600 font-medium">
            Coordinating emergency care with 24/7 partners.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-[#b91c1c] rounded-full font-bold">
          <Asterisk className="w-5 h-5" />
          <span>{mockReferrals.length} Active Referrals</span>
        </div>
      </div>

      <div className="flex gap-8 flex-1">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-8">
          {/* In-Flight Referrals */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PlusSquare className="w-6 h-6 text-[#00D68F]" />
                <h2 className="text-2xl font-bold text-slate-900">In-Flight Referrals</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Last Synced: 2m ago
              </span>
            </div>
            <div className="space-y-6">
              {mockReferrals.map((ref) => (
                <ReferralCard key={ref.id} referral={ref} />
              ))}
            </div>
          </section>

          {/* Partner ER Directory */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Compass className="w-6 h-6 text-[#00D68F]" />
              <h2 className="text-2xl font-bold text-slate-900">Partner ER Directory</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {mockPartnerClinics.map((clinic) => {
                const borderColor = clinic.isAtCapacity
                  ? 'border-t-[#b91c1c]'
                  : clinic.waitMinutes && clinic.waitMinutes <= 20
                  ? 'border-t-emerald-400'
                  : 'border-t-[#00D68F]'
                const statusBg = clinic.isAtCapacity
                  ? 'bg-red-100 text-[#b91c1c]'
                  : 'bg-emerald-100 text-emerald-700'
                const statusLabel = clinic.isAtCapacity ? 'At Capacity' : 'Open Now'
                const waitColor = clinic.isAtCapacity
                  ? 'text-[#b91c1c]'
                  : clinic.waitMinutes && clinic.waitMinutes <= 20
                  ? 'text-emerald-600'
                  : 'text-[#00D68F]'
                const waitText = clinic.isAtCapacity
                  ? '>3 hours'
                  : `~${clinic.waitMinutes} mins`

                return (
                  <div
                    key={clinic.id}
                    className={`bg-white rounded-[2rem] p-6 border-t-[6px] ${borderColor} shadow-sm flex flex-col`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900">{clinic.name}</h3>
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${statusBg}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span>
                          Wait:{' '}
                          <span className={`font-bold ${waitColor}`}>{waitText}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <Phone className="w-5 h-5 text-slate-400" />
                        <span>{clinic.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <Map className="w-5 h-5 text-slate-400" />
                        <span>
                          {clinic.distanceMiles} miles &bull; {clinic.driveMinutes}m drive
                        </span>
                      </div>
                    </div>
                    <button
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                        clinic.isAtCapacity
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {clinic.isAtCapacity ? 'Referral Delayed' : 'Quick Call Partner'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right: Quick Send */}
        <div className="w-96 shrink-0">
          <div className="bg-slate-50 rounded-[2.5rem] p-8 h-full flex flex-col border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-[#00D68F]" />
              <h2 className="text-2xl font-bold text-slate-900">Quick Send</h2>
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Patient Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="Start typing patient name..."
                    className="w-full pl-5 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#00D68F]/20 outline-none placeholder:text-slate-400 shadow-sm"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Receiving ER
                </label>
                <div className="relative">
                  <select
                    value={selectedClinic}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#00D68F]/20 outline-none appearance-none text-slate-900 shadow-sm"
                  >
                    {mockPartnerClinics
                      .filter((c) => !c.isAtCapacity)
                      .map((c) => (
                        <option key={c.id}>
                          {c.name} ({c.distanceMiles}mi)
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="bg-white rounded-[1.5rem] p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-[#00D68F]" />
                  <span className="text-[11px] font-bold text-[#00D68F] uppercase tracking-widest">
                    AI Triage Summary
                  </span>
                </div>
                <p className="text-sm text-slate-500 italic leading-relaxed">
                  {selectedPatient
                    ? `Generating summary for "${selectedPatient}"...`
                    : 'Select a patient to generate critical summary and vital signs export.'}
                </p>
              </div>
            </div>
            <button className="w-full py-4 bg-[#00D68F] text-white rounded-full text-base font-bold hover:bg-[#00B578] transition-colors flex items-center justify-center gap-2 shadow-sm mt-8">
              <Send className="w-5 h-5" />
              Dispatch Referral
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReferralCard({ referral }: { referral: Referral }) {
  const isStat = referral.urgencyLevel === 'STAT'
  const borderColor = isStat ? 'border-l-[#b91c1c]' : 'border-l-[#00D68F]'
  const iconBg = isStat ? 'bg-red-100 text-[#b91c1c]' : 'bg-teal-100 text-[#00D68F]'
  const stepColor = isStat ? '#b91c1c' : '#00D68F'
  const badgeBg = isStat ? 'bg-[#b91c1c] text-white' : 'bg-[#00D68F] text-white'

  const stepLabels = ['Notified', 'Case Sent', 'Ack', 'Arrived']

  return (
    <div
      className={`bg-white rounded-[2rem] p-8 border-l-[6px] ${borderColor} shadow-sm flex flex-col gap-6`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg}`}
          >
            <PawPrint className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {referral.patient.name} ({referral.patient.species}, {referral.patient.age})
            </h3>
            <p className="text-slate-500 font-medium">
              {referral.reason} &bull;{' '}
              <span style={{ color: stepColor }} className="font-bold">
                {referral.urgencyLevel}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${badgeBg}`}
          >
            {stepLabels[referral.progressStep]}
          </span>
          <span className="text-sm text-slate-500 font-medium">
            {referral.progressStep === 3
              ? `Arrived at ${referral.referredTo}`
              : `Pending at ${referral.referredTo}`}
          </span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-1.5 bg-slate-200 z-0">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(referral.progressStep / (stepLabels.length - 1)) * 100}%`,
              backgroundColor: stepColor,
            }}
          ></div>
        </div>
        {stepLabels.map((label, i) => {
          const done = i <= referral.progressStep
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-[4px] border-white shadow-sm transition-colors"
                style={{
                  backgroundColor: done ? stepColor : '#e2e8f0',
                  color: done ? 'white' : '#94a3b8',
                }}
              >
                {i < referral.progressStep ? (
                  <Check className="w-5 h-5" />
                ) : i === referral.progressStep && referral.progressStep < 3 ? (
                  <Clock className="w-4 h-4" />
                ) : i === 3 && done ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Hourglass className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  done ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
