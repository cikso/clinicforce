'use client'

import { useState } from 'react'
import { X, Plus, Loader2, Sparkles } from 'lucide-react'
import { DashboardCase, CaseUrgency, IntakeSource } from '@/data/mock-dashboard'
import type { TriageResult } from '@/app/api/triage/route'

interface NewCaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (caseData: Partial<DashboardCase>) => void
}

export default function NewCaseModal({ isOpen, onClose, onSubmit }: NewCaseModalProps) {
  const [form, setForm] = useState({
    patientName: '',
    species: 'Canine',
    breed: '',
    age: '',
    issue: '',
    ownerName: '',
    ownerPhone: '',
    source: 'FRONT_DESK' as IntakeSource,
  })
  const [triaging, setTriaging] = useState(false)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)
  const [triageError, setTriageError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTriaging(true)
    setTriageError(false)
    setTriageResult(null)

    let aiData: Partial<DashboardCase> = {
      urgency: 'URGENT',
      urgencyScore: 5.0,
      riskFactor: 'Under Review',
      aiSummary: 'Manual intake — AI triage pending.',
      aiJustification: 'Case submitted manually. AI analysis unavailable.',
    }

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.patientName,
          species: form.species,
          breed: form.breed,
          age: form.age,
          presentingIssue: form.issue,
        }),
      })

      if (res.ok) {
        const result: TriageResult = await res.json()
        setTriageResult(result)
        aiData = {
          urgency: result.urgency,
          urgencyScore: result.urgencyScore,
          riskFactor: result.riskFactor,
          aiSummary: result.aiSummary,
          aiJustification: result.aiJustification,
        }
      } else {
        setTriageError(true)
      }
    } catch {
      setTriageError(true)
    } finally {
      setTriaging(false)
    }

    onSubmit({ ...form, ...aiData })
    setForm({ patientName: '', species: 'Canine', breed: '', age: '', issue: '', ownerName: '', ownerPhone: '', source: 'FRONT_DESK' })
    setTriageResult(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--brand)] flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Case Intake</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  AI triage runs automatically on submission
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Patient Name *</label>
                <input
                  required
                  value={form.patientName}
                  onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none"
                  placeholder="e.g. Luna"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Species</label>
                <select
                  value={form.species}
                  onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none bg-white"
                >
                  <option>Canine</option>
                  <option>Feline</option>
                  <option>Avian</option>
                  <option>Exotic</option>
                  <option>Rabbit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Breed</label>
                <input
                  value={form.breed}
                  onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none"
                  placeholder="e.g. Labrador"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                <input
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none"
                  placeholder="e.g. 3y F/S"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Presenting Issue *</label>
              <input
                required
                value={form.issue}
                onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none"
                placeholder="e.g. Vomiting, lethargy"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Intake Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as IntakeSource }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none bg-white"
              >
                <option value="FRONT_DESK">Front Desk</option>
                <option value="PHONE">Phone</option>
                <option value="VOICE_AI">Voice AI</option>
                <option value="WEB_CHAT">Web Chat</option>
                <option value="REFERRAL">Referral</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Name *</label>
                <input
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none"
                  placeholder="Owner full name"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Phone</label>
                <input
                  value={form.ownerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-none"
                  placeholder="+61 4..."
                />
              </div>
            </div>

            {triageError && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                AI triage unavailable — case will be added with manual urgency.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-200 transition-colors text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={triaging}
                className="flex-1 py-3 bg-[var(--brand)] text-white font-bold rounded-full hover:bg-[var(--brand-hover)] transition-colors text-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {triaging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Triaging...
                  </>
                ) : (
                  'Add to Queue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
