import type { CoverageMode } from '@/data/mock-dashboard'

interface CoverageStatus {
  status:    'ACTIVE' | 'INACTIVE'
  mode?:     CoverageMode | null
  startTime?: string
}

interface PageShellProps {
  // Legacy props — these used to feed a child TopBar that has since moved to
  // the dashboard layout's DashboardTopbar. Kept on the interface so existing
  // call sites don't break; the values are no-ops in the render.
  title?: string
  subtitle?: string
  children: React.ReactNode
  searchPlaceholder?: string
  clinicName?: string
  userName?: string
  coverage?: CoverageStatus
  onNewCase?: () => void
  showAiBadge?: boolean
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <>
      {children}
      <footer className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0891b2]" />
          © 2026 ClinicForce — All systems operational
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-slate-500 transition-colors">Help</a>
          <a href="/privacy" className="hover:text-slate-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-500 transition-colors">Security</a>
        </div>
      </footer>
    </>
  )
}
