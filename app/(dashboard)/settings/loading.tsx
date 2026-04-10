import { CardSkeleton } from '@/app/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <CardSkeleton rows={4} />
      <CardSkeleton rows={3} />
    </div>
  )
}
