import { Skeleton } from '@/app/components/ui/Skeleton'

export default function KnowledgeLoading() {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Skeleton className="h-11 w-full rounded-lg" />

      {/* Article cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 space-y-3"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
