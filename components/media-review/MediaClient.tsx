'use client'

import { useState } from 'react'
import { Video, X, ZoomIn, Sparkles, CheckCircle2, AlertTriangle, History, Share2 } from 'lucide-react'
import { mockMedia } from '@/data/mock-media'
import type { MediaItem } from '@/lib/types'
import { formatRelative } from '@/lib/formatters'

type TabFilter = 'review' | 'flagged' | 'all'

export default function MediaClient() {
  const [tab, setTab] = useState<TabFilter>('review')
  const [selected, setSelected] = useState<MediaItem | null>(mockMedia[0])

  const filtered = mockMedia.filter((m) => {
    if (tab === 'review') return m.status === 'PENDING_REVIEW'
    if (tab === 'flagged') return m.status === 'FLAGGED'
    return true
  })

  const reviewCount = mockMedia.filter((m) => m.status === 'PENDING_REVIEW').length
  const flaggedCount = mockMedia.filter((m) => m.status === 'FLAGGED').length

  return (
    <div className="flex -mx-8 -mt-6 h-[calc(100vh-120px)]">
      {/* Main gallery */}
      <div className="flex-1 overflow-y-auto p-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-slate-100 p-1.5 rounded-full w-fit">
            <button
              onClick={() => setTab('review')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${tab === 'review' ? 'bg-white shadow-sm text-[var(--brand)]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Review Needed ({reviewCount})
            </button>
            <button
              onClick={() => setTab('flagged')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${tab === 'flagged' ? 'bg-white shadow-sm text-[var(--brand)]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Flagged ({flaggedCount})
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${tab === 'all' ? 'bg-white shadow-sm text-[var(--brand)]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Media
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selected?.id === item.id}
              onSelect={setSelected}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-24 text-center text-slate-400">
              No media in this view.
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 shadow-2xl z-20">
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand)] mb-1">
                Reviewing: {selected.patient.name}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                CASE #{selected.linkedCaseId ?? 'UNLINKED'} &bull;{' '}
                {formatRelative(selected.uploadedAt).toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            {/* Preview */}
            <div className="relative h-52 rounded-3xl overflow-hidden bg-slate-900">
              {selected.thumbnailUrl ? (
                <img
                  src={selected.thumbnailUrl}
                  alt={selected.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <span className="text-sm font-medium">{selected.fileName}</span>
                </div>
              )}
              <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-black transition-colors">
                <ZoomIn className="w-3.5 h-3.5" />
                Enlarge
              </button>
            </div>

            {/* Tags */}
            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--brand-light)] text-[var(--brand)] text-xs font-bold rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Patient history */}
            {selected.patientHistory && (
              <div className="bg-slate-50 rounded-3xl p-5">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Patient History
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {selected.patientHistory}
                </p>
              </div>
            )}

            {/* AI insights */}
            {selected.aiInsights && selected.aiInsights.length > 0 && (
              <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[var(--brand)]" />
                  <h3 className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-widest">
                    AI Insights
                  </h3>
                </div>
                <ul className="space-y-3">
                  {selected.aiInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {insight.type === 'ok' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-[var(--error)] shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm text-slate-700 font-medium">{insight.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Review note if exists */}
            {selected.reviewNote && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Review Note
                </p>
                <p className="text-sm text-amber-900">{selected.reviewNote}</p>
              </div>
            )}

            {/* Actions */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Required Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full py-4 bg-[var(--brand)] text-white rounded-full text-sm font-bold hover:bg-[var(--brand-hover)] transition-colors shadow-sm">
                  Approve &amp; Move to Follow-up
                </button>
                <button className="w-full py-4 bg-red-100 text-[var(--error)] rounded-full text-sm font-bold hover:bg-red-200 transition-colors">
                  Flag for Immediate Consult
                </button>
                <button className="w-full py-4 bg-slate-200 text-slate-800 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors">
                  Request Better Photo
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Active Review Session
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <History className="w-5 h-5" />
              </button>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaCard({
  item,
  selected,
  onSelect,
}: {
  item: MediaItem
  selected: boolean
  onSelect: (item: MediaItem) => void
}) {
  const isUrgent = item.status === 'FLAGGED'
  const isRoutine = item.status === 'REVIEWED'

  return (
    <div
      onClick={() => onSelect(item)}
      className={`relative rounded-[2rem] overflow-hidden cursor-pointer group shadow-sm border-2 transition-all duration-200 ${
        selected ? 'border-[var(--brand)]' : 'border-transparent hover:border-slate-300'
      }`}
      style={{ height: '280px' }}
    >
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt={item.fileName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
          <span className="text-slate-500 text-sm font-medium px-4 text-center">
            {item.fileName}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand)]/80 via-[var(--brand)]/10 to-transparent"></div>

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
            isUrgent
              ? 'bg-[var(--error)] text-white'
              : isRoutine
              ? 'bg-slate-800/70 text-white'
              : 'bg-[var(--brand)] text-white'
          }`}
        >
          {isUrgent ? 'Flagged' : isRoutine ? 'Reviewed' : 'Review Needed'}
        </span>
        {item.fileType === 'video' && (
          <span className="px-2.5 py-1 bg-black/40 text-white text-[11px] font-bold flex items-center gap-1.5 rounded-full">
            <Video className="w-3 h-3" />
            Video
          </span>
        )}
      </div>

      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="text-lg font-bold text-white mb-2">
          {item.patient.name} &mdash; {item.patient.breed}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[var(--brand-hover)]/80 text-teal-50 text-xs font-bold rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
