import DashboardClient from '@/components/dashboard/DashboardClient'
import { fetchDashboardCases, fetchDashboardCalls } from '@/lib/supabase/queries'

export const revalidate = 30 // revalidate every 30 seconds

export default async function OverviewPage() {
  const [cases, calls] = await Promise.all([
    fetchDashboardCases(),
    fetchDashboardCalls(),
  ])

  return <DashboardClient initialCases={cases} initialCalls={calls} />
}
