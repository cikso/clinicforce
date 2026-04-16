import {
  LayoutGrid,
  Phone,
  ListChecks,
  BarChart3,
  Calendar,
  MessageSquare,
  ClipboardList,
  Settings,
  Shield,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

export type CommandGroup =
  | 'navigation'
  | 'platform'
  | 'clinics'
  | 'actions'

export interface Command {
  id:         string
  label:      string
  group:      CommandGroup
  /** Lucide icon component — rendered at 18×18. */
  icon:       LucideIcon
  /** If set, selecting the command navigates here. */
  href?:      string
  /** If set, selecting the command runs this instead of navigating. */
  action?:    string
  /** Alternate words to match against the query (e.g. "team" → Users). */
  keywords?:  string[]
  /** Optional subtitle shown below the label in the list. */
  hint?:      string
  /** Hide the command when true — used for gated items. */
  hidden?:    boolean
}

// Navigation commands — kept in sync with DashboardSidebar NAV_ITEMS.
// Lucide icons are used here (rather than the inline SVGs in the sidebar)
// because icon swaps at 18px are visually identical and lucide is already a
// dependency. If the sidebar set changes, mirror it here.
export const NAVIGATION_COMMANDS: Command[] = [
  {
    id: 'nav-overview',
    label: 'Command Centre',
    group: 'navigation',
    icon: LayoutGrid,
    href: '/overview',
    keywords: ['home', 'dashboard', 'overview'],
  },
  {
    id: 'nav-conversations',
    label: 'Call Inbox',
    group: 'navigation',
    icon: Phone,
    href: '/conversations',
    keywords: ['calls', 'inbox', 'conversations'],
  },
  {
    id: 'nav-actions',
    label: 'Action Queue',
    group: 'navigation',
    icon: ListChecks,
    href: '/actions',
    keywords: ['tasks', 'todo', 'callbacks', 'queue'],
  },
  {
    id: 'nav-insights',
    label: 'Insights',
    group: 'navigation',
    icon: BarChart3,
    href: '/insights',
    keywords: ['analytics', 'charts', 'metrics', 'reports'],
  },
  {
    id: 'nav-bookings',
    label: 'Bookings',
    group: 'navigation',
    icon: Calendar,
    href: '/bookings',
    hint: 'Coming soon',
    keywords: ['appointments', 'schedule', 'calendar'],
  },
  {
    id: 'nav-sms',
    label: 'SMS Hub',
    group: 'navigation',
    icon: MessageSquare,
    href: '/sms',
    hint: 'Coming soon',
    keywords: ['messages', 'text', 'messaging'],
  },
  {
    id: 'nav-surveys',
    label: 'Surveys',
    group: 'navigation',
    icon: ClipboardList,
    href: '/surveys',
    keywords: ['nps', 'feedback', 'responses', 'reviews'],
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    group: 'navigation',
    icon: Settings,
    href: '/settings',
    keywords: ['preferences', 'config', 'profile', 'team'],
  },
]

// Platform-owner-only commands (DashboardSidebar shows these conditionally).
export const PLATFORM_COMMANDS: Command[] = [
  {
    id: 'nav-admin',
    label: 'Platform Admin',
    group: 'platform',
    icon: Shield,
    href: '/admin',
    keywords: ['admin', 'platform', 'clinics', 'invites'],
  },
]

// Quick actions that can't be reached by just navigating.
export const ACTION_COMMANDS: Command[] = [
  {
    id: 'action-sign-out',
    label: 'Sign out',
    group: 'actions',
    icon: LogOut,
    action: 'sign-out',
    keywords: ['logout', 'log out', 'leave'],
  },
]

/**
 * Simple case-insensitive substring match against label + keywords. Returns
 * the commands that match, in the original order. Empty query returns the
 * full list. Fuzzy matching is a follow-up.
 */
export function filterCommands(commands: Command[], query: string): Command[] {
  const q = query.trim().toLowerCase()
  if (!q) return commands.filter((c) => !c.hidden)
  return commands.filter((c) => {
    if (c.hidden) return false
    if (c.label.toLowerCase().includes(q)) return true
    return c.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false
  })
}

export const GROUP_LABELS: Record<CommandGroup, string> = {
  navigation: 'Navigation',
  platform:   'Platform',
  clinics:    'Switch clinic',
  actions:    'Actions',
}
