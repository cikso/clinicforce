'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { DashboardCase, CaseUrgency, IntakeSource } from '@/data/mock-dashboard'

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
    urgency: 'URGENT' as CaseUrgency,
    ownerName: '',
    ownerPhone: '',
    source: 'FRONT_DESK' as IntakeSource,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
    setForm({ patientName: '', species: 'Canine', breed: '', age: '', issue: '', urgency: 'URGENT', ownerName: '', ownerPhone: '', source: 'FRONT_DESK' })
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
              <div className="w-9 h-9 rounded-full bg-[#0f5b8a] flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Case Intake</h2>
                <p className="text-xs text-slate-500">Fill in details to add case to queue</p>
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
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none"
                  placeholder="e.g. Luna"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Species</label>
                <select
                  value={form.species}
                  onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none bg-white"
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
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none"
                  placeholder="e.g. Labrador"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                <input
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none"
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none"
                placeholder="e.g. Vomiting, lethargy"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as CaseUrgency }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none bg-white"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="URGENT">Urgent</option>
                  <option value="ROUTINE">Routine</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Intake Source</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as IntakeSource }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none bg-white"
                >
                  <option value="FRONT_DESK">Front Desk</option>
                  <option value="PHONE">Phone</option>
                  <option value="VOICE_AI">Voice AI</option>
                  <option value="WEB_CHAT">Web Chat</option>
                  <option value="REFERRAL">Referral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Name *</label>
                <input
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none"
                  placeholder="Owner full name"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Phone</label>
                <input
                  value={form.ownerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0f5b8a]/20 focus:border-[#0f5b8a] outline-none"
                  placeholder="+1 (555) ..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-200 transition-colors text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 bg-[#0f5b8a] text-white font-bold rounded-full hover:bg-[#0c4a70] transition-colors text-sm">
                Add to Queue
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
