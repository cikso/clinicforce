import TopBar from './TopBar'

interface PageShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  searchPlaceholder?: string
  clinicName?: string
  showAiBadge?: boolean
  onNewCase?: () => void
}

export default function PageShell({ title, subtitle, children, searchPlaceholder, clinicName, showAiBadge, onNewCase }: PageShellProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      <TopBar title={title} subtitle={subtitle} searchPlaceholder={searchPlaceholder} clinicName={clinicName} showAiBadge={showAiBadge} onNewCase={onNewCase} />
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {children}
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            © 2026 VETDESK OPERATIONS. SYSTEM STATUS: ACTIVE
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">HELP CENTER</a>
            <a href="#" className="hover:text-slate-600 transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-slate-600 transition-colors">SECURITY</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
