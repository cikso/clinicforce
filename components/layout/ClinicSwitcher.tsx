'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { useClinic } from '@/context/ClinicContext'

export default function ClinicSwitcher() {
  const { clinics, activeClinicId, activeClinicName, switchClinic } = useClinic()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  // Focus search when opening
  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 min-w-0 group"
      >
        <p className="text-[11px] text-slate-500 truncate mt-px group-hover:text-slate-700 transition-colors">
          {activeClinicName}
        </p>
        <ChevronDown className={`w-3 h-3 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="fixed mt-2 w-56 bg-white border border-[#dddbda] rounded-lg shadow-lg z-50 overflow-hidden" style={{ left: 12, top: ref.current ? ref.current.getBoundingClientRect().bottom : 0 }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#dddbda]">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clinics..."
              className="flex-1 text-[13px] text-slate-700 placeholder:text-slate-400 bg-transparent outline-none"
            />
          </div>

          {/* Clinic list */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-[12px] text-slate-400 text-center">No clinics found</p>
            )}
            {filtered.map(clinic => {
              const isActive = clinic.id === activeClinicId
              return (
                <button
                  key={clinic.id}
                  onClick={() => {
                    switchClinic(clinic.id)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-[#E0F7F3]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] truncate ${isActive ? 'font-semibold text-[#00BFA5]' : 'font-medium text-slate-800'}`}>
                      {clinic.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{clinic.vertical}</p>
                  </div>
                  {isActive && <Check className="w-4 h-4 shrink-0 text-[#00BFA5]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
