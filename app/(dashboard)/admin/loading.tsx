import { AdminTableSkeleton } from '@/app/components/ui/Skeleton'

export default function AdminLoading() {
  return <AdminTableSkeleton kpis={4} rows={8} />
}
