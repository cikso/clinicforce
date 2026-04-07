import TopBar from './TopBar'
import type { CoverageMode } from '@/data/mock-dashboard'

interface CoverageStatus {
  status:     'ACTIVE' | 'INACTIVE'
  mode?:      CoverageMode | null
  startTime?: string
}

interface PageShellProps {
  title:              string
  subtitle?:          string
  children:           React.ReactNode
  searchPlaceholder?: string
  clinicName?:        string
  userName?:          string
  coverage?:          CoverageStatus
  onNewCase?:         () => void
  // legacy compat
  showAiBadge?:       boolean
}

export default function PageShell({
  title,
  subtitle,
  children,
  searchPlaceholder,
  clinicName,
  userName,
  coverage,
  onNewCase,
}: PageShellProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      <TopBar
        title={title}
        subtitle={subtitle}
        searchPlaceholder={searchPlaceholder}
        clinicName={clinicName}
        userName={userName}
        coverage={coverage}
        onNewCase={onNewCase}
      />

      <main className="flex-1 overflow-y-auto px-7 py-6 bg-[#f4f6f9]">

        {/* ── Page title (Salesforce pattern: title lives in content, not header) */}
        <div className="mb-5">
          <h1 className="text-[1.75rem] font-bold text-[#1a1a1a] leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#555] mt-1">{subtitle}</p>
          )}
        </div>

        {children}

        <footer className="mt-12 pt-5 border-t border-[#e9ecef] flex items-center justify-between text-xs font-medium text-[#aaa]">
          <div className="flex items-center gap-2">
            <span className="text-[#28a745]">✓</span>
            All systems operational · © 2026 ClinicForce
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#555] transition-colors">Help</a>
            <a href="#" className="hover:text-[#555] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#555] transition-colors">Security</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
