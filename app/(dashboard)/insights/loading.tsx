import { Skeleton, StatCardSkeleton } from '@/app/components/ui/Skeleton'

export default function InsightsLoading() {
  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-5 space-y-4"
          >
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
            <div className="h-48 rounded-md bg-[var(--bg-secondary)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
