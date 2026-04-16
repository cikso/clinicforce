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
