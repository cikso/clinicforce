'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--bg-hover)]',
        className,
      )}
    />
  )
}

/* ─── Prebuilt skeleton compositions ────────────────────────────────── */

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function ActivityRowSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-3 w-16 shrink-0" />
    </div>
  )
}

export function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)]">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
    </div>
  )
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
      <Skeleton className="h-4 w-4 rounded shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full shrink-0" />
    </div>
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 space-y-4">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}

/* ─── Full-page skeleton for overview ────────────────────────────────── */

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 space-y-1">
        <Skeleton className="h-4 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function ConversationsSkeleton() {
  return (
    <div className="flex h-[calc(100vh-56px)] -m-6">
      <div className="w-[360px] border-r border-[var(--border)] bg-[var(--bg-primary)]">
        <div className="p-4 border-b border-[var(--border)]">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <ConversationRowSkeleton key={i} />
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}

export function ActionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/* ─── Admin clinics / invites / owners table skeleton ────────────────── */
export function AdminTableSkeleton({ kpis = 4, rows = 6 }: { kpis?: number; rows?: number }) {
  return (
    <div className="max-w-[1100px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* KPI row */}
      {kpis > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: kpis }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <div className="flex-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-[var(--border-subtle)] last:border-b-0">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-20 shrink-0" />
            <Skeleton className="h-3 w-14 shrink-0" />
            <Skeleton className="h-6 w-16 rounded-full shrink-0" />
            <Skeleton className="h-3 w-10 shrink-0" />
            <Skeleton className="h-3 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Users / team list skeleton ──────────────────────────────────────── */
export function UsersSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-b-0">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            <Skeleton className="h-4 w-4 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Form page skeleton (new clinic / edit / settings forms) ─────────── */
export function FormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-80" />
      </div>
      {Array.from({ length: sections }).map((_, s) => (
        <div key={s} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 space-y-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 justify-end">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function SurveysSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI row — 5 tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* NPS trend chart */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
        <div className="h-[220px] rounded-md bg-[var(--bg-secondary)] animate-pulse" />
      </div>

      {/* Tabs + table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
        <div className="flex gap-6 px-4 py-3 border-b border-[var(--border)]">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)] last:border-b-0">
            <Skeleton className="h-3 w-20 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-40" />
            </div>
            <Skeleton className="h-5 w-10 rounded-full shrink-0" />
            <Skeleton className="h-3 w-32 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
