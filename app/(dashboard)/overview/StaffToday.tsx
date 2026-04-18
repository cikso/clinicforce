'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Phone, AlertTriangle, ListChecks, Clock, ChevronRight, Shield } from 'lucide-react'
import OverviewHeader from './components/OverviewHeader'

/**
 * StaffToday — focused single-column view for receptionists, nurses, and
 * vets. Replaces the dense analytics-first Command Centre with a
 * mobile-first card stack that answers three questions in glance-time:
 *
 *   1. Is anything urgent right now?
 *   2. Whose callback is waiting on me?
 *   3. What tasks am I on the hook for?
 *
 * No analytics, no charts, no revenue numbers — staff don't own those
 * conversations. Admins and owners still get the full Command Centre.
 */

export interface StaffTodayUrgent {
  id: string
  callerName: string
  callerPhone: string
  summary: string
  urgency: 'CRITICAL' | 'URGENT'
  createdAt: string
}

export interface StaffTodayCallback {
  id: string
  callerName: string
  summary: string
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'
  createdAt: string
}

export interface StaffTodayTask {
  id: string
  title: string
  description: string | null
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
  dueAt: string | null
  createdAt: string
}

export interface StaffTodayProps {
  firstName: string
  greeting: string             // "Good morning" / "Good afternoon" / "Good evening"
  todayLabel: string           // "Monday, 14 April"
  clinicId: string
  clinicName: string
  clinicSuburb: string | null
  coverageMode: string | null  // 'after_hours' | 'business_hours' | 'always_on' etc.
  coverageLiveNow: boolean     // is Stella currently the one answering?
  urgentNow: StaffTodayUrgent[]
  myCallbacks: StaffTodayCallback[]
  myTasks: StaffTodayTask[]
  hasCallbacksButNotAssigned?: boolean  // when user isn't assigned-to anyone yet
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  return `${days}d ago`
}

function dueLabel(dueAt: string | null): { text: string; overdue: boolean } {
  if (!dueAt) return { text: 'No due date', overdue: false }
  const due = new Date(dueAt).getTime()
  const now = Date.now()
  const diff = due - now
  const mins = Math.round(diff / 60000)
  if (mins <= 0) return { text: 'Overdue', overdue: true }
  if (mins < 60) return { text: `Due in ${mins}m`, overdue: false }
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return { text: `Due in ${hrs}h`, overdue: false }
  const days = Math.round(hrs / 24)
  return { text: `Due in ${days}d`, overdue: false }
}

const PRIORITY_BADGE: Record<StaffTodayTask['priority'], { label: string; bg: string; color: string }> = {
  URGENT: { label: 'Urgent', bg: '#FEF2F2', color: '#DC2626' },
  HIGH:   { label: 'High',   bg: '#FFFBEB', color: '#D97706' },
  NORMAL: { label: 'Normal', bg: '#F3F4F6', color: '#6B7280' },
  LOW:    { label: 'Low',    bg: '#F3F4F6', color: '#9CA3AF' },
}

export default function StaffToday({
  firstName,
  greeting,
  todayLabel,
  clinicId,
  clinicName,
  clinicSuburb,
  coverageMode,
  coverageLiveNow,
  urgentNow,
  myCallbacks,
  myTasks,
  hasCallbacksButNotAssigned = false,
}: StaffTodayProps) {
  const coverageText = useMemo(() => {
    if (coverageLiveNow) return 'Stella is answering calls right now'
    if (coverageMode === 'always_on') return 'Stella is on · you can focus on clinic work'
    if (coverageMode === 'after_hours') return 'Business hours · you are answering'
    if (coverageMode === 'business_hours') return 'Stella is on after hours'
    return 'Coverage active'
  }, [coverageMode, coverageLiveNow])

  return (
    <div className="max-w-[720px] mx-auto space-y-4">
      {/* AI coverage mode toggle — same control admins + owners see on the
          Command Centre. Staff can flip modes too (e.g. receptionist turning
          Stella on during a lunch break). */}
      {clinicId && (
        <OverviewHeader
          initialMode={coverageMode ?? 'business_hours'}
          clinicId={clinicId}
        />
      )}

      {/* Header */}
      <header className="cf-enter">
        <p className="eyebrow text-[var(--text-tertiary)]">{todayLabel}</p>
        <h1 className="mt-1 text-[26px] sm:text-[30px] font-heading font-extrabold text-[var(--text-primary)] leading-tight tracking-[-0.02em]">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          {clinicName}{clinicSuburb ? ` · ${clinicSuburb}` : ''}
        </p>
      </header>

      {/* Coverage strip */}
      <div className="cf-enter cf-enter-delay-1 flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white px-4 py-3">
        <div className="relative w-2.5 h-2.5 shrink-0">
          <span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: coverageLiveNow ? 'var(--brand)' : 'var(--text-tertiary)' }}
          />
          {coverageLiveNow && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'var(--brand)',
                animation: 'pulse-ring 1.6s cubic-bezier(0.4,0,0.2,1) infinite',
              }}
            />
          )}
        </div>
        <p className="text-[13.5px] text-[var(--text-secondary)] flex-1">{coverageText}</p>
        <Shield className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" strokeWidth={1.5} />
      </div>

      {/* Urgent banner — only rendered when something is actually urgent */}
      {urgentNow.length > 0 && (
        <section className="cf-enter cf-enter-delay-2">
          <div className="rounded-xl border border-[color:rgba(220,38,38,0.25)] bg-[#FEF2F2] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[color:rgba(220,38,38,0.2)]">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" strokeWidth={2} />
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#DC2626]">
                Urgent now · {urgentNow.length}
              </span>
            </div>
            <ul className="divide-y divide-[color:rgba(220,38,38,0.12)]">
              {urgentNow.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/conversations?call=${item.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/60 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                          {item.callerName}
                        </p>
                        {item.urgency === 'CRITICAL' && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#DC2626]">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                        {item.summary}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                        {relativeTime(item.createdAt)}
                        {item.callerPhone ? ` · ${item.callerPhone}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 mt-1" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* My callbacks */}
      <SectionCard
        title={hasCallbacksButNotAssigned ? 'Callbacks waiting' : 'My callbacks'}
        subtitle={
          hasCallbacksButNotAssigned
            ? 'These aren\u2019t assigned yet — jump on whatever\u2019s yours.'
            : 'Calls asking for a callback'
        }
        count={myCallbacks.length}
        emptyIcon={<Phone className="w-5 h-5" strokeWidth={1.5} />}
        emptyTitle="No callbacks waiting"
        emptyBody="Nothing to return — Stella is keeping the queue clean."
        delayClass="cf-enter-delay-3"
      >
        {myCallbacks.length > 0 && (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {myCallbacks.map((cb) => (
              <li key={cb.id}>
                <Link
                  href={`/conversations?call=${cb.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-[12px] font-bold"
                    style={{
                      backgroundColor:
                        cb.urgency === 'CRITICAL' || cb.urgency === 'URGENT'
                          ? '#DC2626'
                          : 'var(--brand)',
                    }}
                  >
                    {cb.callerName
                      .split(/\s+/)
                      .map((p) => p[0] ?? '')
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '??'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                      {cb.callerName}
                    </p>
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {cb.summary}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      {relativeTime(cb.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 mt-1.5" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* My tasks */}
      <SectionCard
        title="My tasks"
        subtitle="Assigned to you, still open"
        count={myTasks.length}
        emptyIcon={<ListChecks className="w-5 h-5" strokeWidth={1.5} />}
        emptyTitle="Inbox zero"
        emptyBody="No open tasks assigned to you. Good work."
        delayClass="cf-enter-delay-4"
        footerAction={
          myTasks.length > 0 ? (
            <Link
              href="/actions"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--brand-dark)] hover:underline"
            >
              Open the queue <ChevronRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          ) : null
        }
      >
        {myTasks.length > 0 && (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {myTasks.map((t) => {
              const due = dueLabel(t.dueAt)
              const prio = PRIORITY_BADGE[t.priority] ?? PRIORITY_BADGE.NORMAL
              return (
                <li key={t.id}>
                  <Link
                    href={`/actions?task=${t.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: prio.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="inline-flex items-center h-[18px] px-2 rounded-full text-[10.5px] font-bold uppercase tracking-[0.05em]"
                          style={{ backgroundColor: prio.bg, color: prio.color }}
                        >
                          {prio.label}
                        </span>
                        <span
                          className={[
                            'inline-flex items-center gap-1 text-[11px]',
                            due.overdue ? 'text-[#DC2626] font-semibold' : 'text-[var(--text-tertiary)]',
                          ].join(' ')}
                        >
                          <Clock className="w-3 h-3" strokeWidth={1.75} /> {due.text}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 mt-1.5" strokeWidth={1.5} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  count,
  emptyIcon,
  emptyTitle,
  emptyBody,
  children,
  footerAction,
  delayClass,
}: {
  title: string
  subtitle?: string
  count: number
  emptyIcon: React.ReactNode
  emptyTitle: string
  emptyBody: string
  children?: React.ReactNode
  footerAction?: React.ReactNode
  delayClass?: string
}) {
  return (
    <section
      className={[
        'rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-[var(--shadow-card)]',
        'cf-enter',
        delayClass ?? '',
      ].join(' ')}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="min-w-0">
          <h2 className="text-[14px] font-bold text-[var(--text-primary)] font-heading">
            {title}
            {count > 0 && (
              <span className="ml-2 text-[12px] font-semibold text-[var(--text-tertiary)]">
                {count}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-[12px] text-[var(--text-tertiary)] mt-px">{subtitle}</p>
          )}
        </div>
        {footerAction}
      </header>
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-4 py-8">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-tertiary)] mb-2">
            {emptyIcon}
          </div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">{emptyTitle}</p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-[280px]">{emptyBody}</p>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
