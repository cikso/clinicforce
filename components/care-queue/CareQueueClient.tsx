'use client'

import { useState, useMemo } from 'react'
import { TrendingDown, SlidersHorizontal, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { mockQueue } from '@/data/mock-queue'
import { mockStats } from '@/data/mock-stats'
import type { TriageLevel } from '@/lib/types'
import QueueTable from './QueueTable'
import CaseDetailDrawer from '@/components/case-detail/CaseDetailDrawer'

type TabFilter = 'pending' | 'active' | 'discharged'

export default function CareQueueClient() {
  const [tab, setTab] = useState<TabFilter>('pending')
  const [triageFilter, setTriageFilter] = useState<TriageLevel | 'ALL'>('ALL')
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = mockQueue
    if (tab === 'pending') list = list.filter((e) => e.queueStatus === 'WAITING')
    else if (tab === 'active') list = list.filter((e) => e.queueStatus === 'WITH_VET')
    else list = list.filter((e) => e.queueStatus === 'PENDING_DISCHARGE')
    if (triageFilter !== 'ALL') list = list.filter((e) => e.triageLevel === triageFilter)
    return list
  }, [tab, triageFilter])

  function openCase(id: string) {
    setSelectedEntryId(id)
    setDrawerOpen(true)
  }

  const tabCounts = {
    pending: mockQueue.filter((e) => e.queueStatus === 'WAITING').length,
    active: mockQueue.filter((e) => e.queueStatus === 'WITH_VET').length,
    discharged: mockQueue.filter((e) => e.queueStatus === 'PENDING_DISCHARGE').length,
  }

  return (
    <>
      {/* Header row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f5b8a] mb-1">Active Care Queue</h1>
          <p className="text-slate-600">{mockStats.patientsInQueue} Urgent Cases Pending Review</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-full">
          {(['pending', 'active', 'discharged'] as TabFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t ? 'bg-white shadow-sm text-[#0f5b8a]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'pending'
                ? `Pending Triage (${tabCounts.pending})`
                : t === 'active'
                ? `Active Care (${tabCounts.active})`
                : 'Discharged'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-36">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AVG. WAIT TIME</p>
          <div>
            <h3 className="text-4xl font-bold text-[#0f5b8a] mb-1">{mockStats.avgWaitMinutes}m</h3>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              -4m from yesterday
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-l-3xl" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">EMERGENCY LEVEL</p>
          <div className="pl-2">
            <h3 className="text-4xl font-bold text-red-600 mb-1">
              {String(mockStats.emergencyLevel).padStart(2, '0')}
            </h3>
            <p className="text-sm font-medium text-slate-700">Immediate intervention required</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-36">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">CLINICIANS ON-DUTY</p>
          <div>
            <h3 className="text-4xl font-bold text-slate-900 mb-1">
              {String(mockStats.cliniciansOnDuty).padStart(2, '0')}
            </h3>
            <p className="text-sm font-medium text-slate-600">3 DVMs, 3 LVTs active</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-36">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL QUEUE VOLUME</p>
          <div>
            <h3 className="text-4xl font-bold text-slate-900 mb-3">{mockStats.totalQueueVolume}</h3>
            <div className="w-full flex h-2.5 rounded-full overflow-hidden bg-slate-100">
              <div className="bg-[#0f5b8a] rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-900">Current Active Queue</span>
            <div className="w-px h-4 bg-slate-300" />
            <span className="text-sm text-slate-500 font-medium">Showing {filtered.length} cases</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Sort: Urgency
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <QueueTable entries={filtered} onOpenCase={openCase} />

        {/* Pagination */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">
            Showing {filtered.length} of {mockQueue.length} cases
          </span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0f5b8a] text-white font-semibold text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Case Drawer */}
      <CaseDetailDrawer
        entryId={selectedEntryId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedEntryId(null)
        }}
      />
    </>
  )
}
