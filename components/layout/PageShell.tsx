import TopBar from './TopBar'

interface CoverageStatus {
  status: 'ACTIVE' | 'INACTIVE'
  reason?: string
  startTime?: string
}

interface PageShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  searchPlaceholder?: string
  clinicName?: string
  coverage?: CoverageStatus
  onNewCase?: () => void
  // legacy compat
  showAiBadge?: boolean
}

export default function PageShell({ title, subtitle, children, searchPlaceholder, clinicName, coverage, onNewCase }: PageShellProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      <TopBar
        title={title}
        subtitle={subtitle}
        searchPlaceholder={searchPlaceholder}
        clinicName={clinicName}
        coverage={coverage}
        onNewCase={onNewCase}
      />
      <main className="flex-1 overflow-y-auto px-6 py-5 bg-[#f7f8fa]">
        {children}
        <footer className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0891b2]" />
            © 2026 VetForce — All systems operational
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-500 transition-colors">Help</a>
            <a href="#" className="hover:text-slate-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-500 transition-colors">Security</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
