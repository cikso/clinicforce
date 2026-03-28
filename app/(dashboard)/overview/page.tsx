import DashboardClient from '@/components/dashboard/DashboardClient'

export const revalidate = 30 // revalidate every 30 seconds

export default async function OverviewPage() {
  return <DashboardClient />
}
