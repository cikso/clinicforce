'use client'

import { useState } from 'react'
import { MoreHorizontal, Phone, CheckSquare } from 'lucide-react'
import { mockTasks } from '@/data/mock-tasks'
import type { FollowUpTask, TaskColumn } from '@/lib/types'

const columns: { id: TaskColumn; label: string; dotColor: string }[] = [
  { id: 'POST_CALL', label: 'POST-CALL FOLLOW-UP', dotColor: 'bg-teal-600' },
  { id: 'TRIAGE_REVIEW', label: 'TRIAGE REVIEW', dotColor: 'bg-red-600' },
  { id: 'OWNER_CHECKIN', label: 'OWNER CHECK-IN', dotColor: 'bg-[#00D68F]' },
]

export default function TasksClient() {
  const [view, setView] = useState<'board' | 'list'>('board')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Clinical Follow-Ups
          </h1>
          <p className="text-slate-500 text-base mt-1">
            Manage recovery check-ins, triage reviews, and owner communication.
          </p>
        </div>
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
          <button
            onClick={() => setView('board')}
            className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${
              view === 'board' ? 'bg-slate-50 text-[#00D68F] shadow-sm' : 'text-slate-500'
            }`}
          >
            Board View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
              view === 'list' ? 'bg-slate-50 text-[#00D68F] shadow-sm' : 'text-slate-500'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map((col) => {
          const tasks = mockTasks.filter((t) => t.column === col.id)
          return (
            <div key={col.id} className="flex flex-col gap-4">
              {/* Column header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-wide">{col.label}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Task cards */}
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} colId={col.id} />
              ))}

              {/* Add button for Owner Check-In */}
              {col.id === 'OWNER_CHECKIN' && (
                <button className="h-28 rounded-3xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 transition-colors text-slate-400 hover:text-slate-500">
                  <CheckSquare className="w-6 h-6" />
                  <span className="text-xs font-bold tracking-widest uppercase">
                    Add Check-In Task
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TaskCard({ task, colId }: { task: FollowUpTask; colId: TaskColumn }) {
  const isCritical = task.priority === 'CRITICAL'
  const isHigh = task.priority === 'HIGH'

  const cardBg =
    isCritical && colId === 'TRIAGE_REVIEW'
      ? 'bg-red-50 border-red-100'
      : 'bg-white border-slate-200'
  const borderAccent = isCritical
    ? 'border-l-red-600'
    : isHigh
    ? 'border-l-[#00D68F]'
    : 'border-l-teal-600'

  const labelBg = isCritical
    ? 'bg-red-100 text-red-700'
    : isHigh
    ? 'bg-teal-50 text-[#00D68F]'
    : 'bg-teal-50 text-teal-700'

  const dividerColor =
    isCritical && colId === 'TRIAGE_REVIEW' ? 'border-red-100' : 'border-slate-100'

  return (
    <div
      className={`rounded-3xl p-6 shadow-sm border border-l-[6px] ${cardBg} ${borderAccent} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${labelBg}`}
        >
          {task.label}
        </span>
        <span
          className={`text-xs font-medium ${
            isCritical ? 'text-red-600 font-bold' : 'text-slate-500'
          }`}
        >
          Due: {task.dueTime}
        </span>
      </div>

      <div>
        <h4 className="font-bold text-lg text-slate-900">
          {task.patient.name} ({task.patientSpecies})
        </h4>
        <p
          className={`text-sm mt-1.5 leading-relaxed ${
            isCritical && colId === 'TRIAGE_REVIEW' ? 'text-slate-700' : 'text-slate-600'
          }`}
        >
          {task.task}
        </p>
      </div>

      <div className={`flex items-center justify-between mt-1 pt-3 border-t ${dividerColor}`}>
        <div className="flex -space-x-2">
          {task.assignedAvatars.map((seed) => (
            <img
              key={seed}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=e2e8f0`}
              alt={seed}
              className="w-6 h-6 rounded-full border-2 border-white"
            />
          ))}
        </div>
        <button
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
            isCritical ? 'text-red-600 hover:text-red-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {isCritical ? '\u2731' : '\uD83D\uDD17'} {task.caseId}
        </button>
      </div>

      {colId === 'OWNER_CHECKIN' && (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Phone className="w-3.5 h-3.5 text-[#00D68F]" />
          Contact Ready
        </div>
      )}
    </div>
  )
}
