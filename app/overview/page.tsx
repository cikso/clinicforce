import PageShell from '@/components/layout/PageShell'
import OverviewStats from '@/components/overview/OverviewStats'
import AlertsPanel from '@/components/overview/AlertsPanel'
import CareQueuePanel from '@/components/overview/CareQueuePanel'
import AfterHoursPanel from '@/components/overview/AfterHoursPanel'
import QuickActions from '@/components/overview/QuickActions'
import { formatDashboardDate } from '@/lib/formatters'

export default function OverviewPage() {
  return (
    <PageShell title="Dashboard" subtitle={formatDashboardDate()}>
      {/* KPI Stats Row */}
      <OverviewStats />

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left col — Alerts + Care Queue */}
        <div className="lg:col-span-2 space-y-6">
          <AlertsPanel />
          <CareQueuePanel />
        </div>

        {/* Right col — Quick Actions + After-Hours Feed */}
        <div className="space-y-6">
          <QuickActions />
          <AfterHoursPanel />
        </div>
      </div>
    </PageShell>
  )
}
