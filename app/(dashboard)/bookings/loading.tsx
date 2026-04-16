import { Skeleton } from '@/app/components/ui/Skeleton'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Calendar card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {DAYS.map((day) => (
            <div key={day} className="text-center">
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, col) => (
              <div
                key={col}
                className="aspect-square rounded-md bg-[var(--bg-secondary)] animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
