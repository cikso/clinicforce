'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Phone, ListChecks, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClinic } from '@/context/ClinicContext'
import { createClient } from '@/lib/supabase/client'
import {
  NAVIGATION_COMMANDS,
  PLATFORM_COMMANDS,
  ACTION_COMMANDS,
  GROUP_LABELS,
  filterCommands,
  type Command,
} from '@/lib/command-palette/commands'

/**
 * Custom DOM event the topbar (or anywhere else) dispatches to open the
 * palette from a click. The keyboard shortcut is handled inside this
 * component directly.
 */
export const OPEN_COMMAND_PALETTE_EVENT = 'open-command-palette'

/**
 * Detect Cmd vs Ctrl for the display hint. Defaults to Ctrl during SSR and
 * snaps to the real platform once the component mounts — avoids hydration
 * flicker since the hint is only shown after mount.
 */
function useIsMac() {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    setIsMac(/Mac|iPhone|iPad|iPod/.test(ua))
  }, [])
  return isMac
}

export default function CommandPalette() {
  const router = useRouter()
  const { clinics, activeClinicId, isPlatformOwner, switchClinic } = useClinic()
  const isMac = useIsMac()

  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [dbResults, setDbResults] = useState<Command[]>([])
  const [dbSearching, setDbSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  // ── Build the full command list. Clinic switcher is only surfaced for
  //    platform owners AND only when there's more than one clinic to switch
  //    between.
  const clinicCommands: Command[] = useMemo(() => {
    if (!isPlatformOwner || clinics.length <= 1) return []
    return clinics.map((c) => ({
      id:       `clinic-${c.id}`,
      label:    c.name,
      group:    'clinics',
      icon:     Building2,
      action:   `switch-clinic:${c.id}`,
      hint:     c.id === activeClinicId ? 'Current clinic' : undefined,
      keywords: ['clinic', 'switch', c.vertical || ''],
    }))
  }, [clinics, activeClinicId, isPlatformOwner])

  const allCommands = useMemo(() => {
    const out: Command[] = [...NAVIGATION_COMMANDS]
    if (isPlatformOwner) out.push(...PLATFORM_COMMANDS)
    out.push(...clinicCommands)
    out.push(...ACTION_COMMANDS)
    return out
  }, [clinicCommands, isPlatformOwner])

  const staticFiltered = useMemo(() => filterCommands(allCommands, query), [allCommands, query])

  // DB results always appear first when the query is substantive — users
  // expect "search" to surface real records over nav items.
  const filtered = useMemo(() => {
    if (query.trim().length < 2) return staticFiltered
    return [...dbResults, ...staticFiltered]
  }, [staticFiltered, dbResults, query])

  // ── Debounced DB search across call_inbox + tasks for the active clinic.
  //    RLS scopes the query to the user's clinic automatically — no manual
  //    clinic_id filter needed. Bail out for short queries to avoid hammering
  //    Supabase on every keystroke.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setDbResults([])
      setDbSearching(false)
      return
    }

    setDbSearching(true)
    const handle = window.setTimeout(async () => {
      try {
        const supabase = createClient()
        const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`

        const [callRes, taskRes] = await Promise.all([
          supabase
            .from('call_inbox')
            .select('id, caller_name, caller_phone, summary, urgency, created_at')
            .or(
              `caller_name.ilike.${like},caller_phone.ilike.${like},summary.ilike.${like}`,
            )
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('tasks')
            .select('id, title, description, priority, status, created_at')
            .or(`title.ilike.${like},description.ilike.${like}`)
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        const calls = (callRes.data ?? []).map((c): Command => ({
          id:    `db-call-${c.id}`,
          label: c.caller_name || c.caller_phone || 'Unknown caller',
          group: 'results',
          icon:  Phone,
          href:  `/conversations?call=${c.id}`,
          hint:  c.urgency === 'CRITICAL' ? 'EMERGENCY'
               : c.urgency === 'URGENT'   ? 'Urgent call'
               : 'Call',
        }))

        const tasks = (taskRes.data ?? []).map((t): Command => ({
          id:    `db-task-${t.id}`,
          label: t.title as string,
          group: 'results',
          icon:  ListChecks,
          href:  `/actions?task=${t.id}`,
          hint:  (t.priority as string) ? `${t.priority} · task` : 'Task',
        }))

        setDbResults([...calls, ...tasks])
      } catch {
        setDbResults([])
      } finally {
        setDbSearching(false)
      }
    }, 220)

    return () => {
      window.clearTimeout(handle)
    }
  }, [query])

  // Reset active index when the filter changes or the modal opens.
  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  // ── Open / close handlers ──────────────────────────────────────────────
  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  // Global keyboard shortcut + click-to-open custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) / Ctrl+K (Win/Linux) toggles the palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery('')
      }
    }
    const handleOpenEvent = () => openPalette()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent)
    }
  }, [openPalette])

  // Focus the input when the modal opens
  useEffect(() => {
    if (open) {
      // Defer to the next tick so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Keep the active item scrolled into view
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  // ── Command execution ──────────────────────────────────────────────────
  const runCommand = useCallback(
    async (cmd: Command) => {
      closePalette()
      if (cmd.href) {
        router.push(cmd.href)
        return
      }
      if (!cmd.action) return

      if (cmd.action === 'sign-out') {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        return
      }
      if (cmd.action.startsWith('switch-clinic:')) {
        const id = cmd.action.slice('switch-clinic:'.length)
        switchClinic(id)
        return
      }
    },
    [router, switchClinic, closePalette],
  )

  // ── Keyboard navigation within the list ────────────────────────────────
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIndex]
      if (cmd) runCommand(cmd)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      closePalette()
      return
    }
    if (e.key === 'Tab') {
      // Trap focus — only the input is focusable in the palette.
      e.preventDefault()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (!open) return null

  // Group filtered results by group label, preserving command order within
  // each group.
  const groupedResults: Array<{ group: string; commands: Array<{ cmd: Command; absoluteIndex: number }> }> = []
  filtered.forEach((cmd, absoluteIndex) => {
    const lastGroup = groupedResults[groupedResults.length - 1]
    if (lastGroup && lastGroup.group === cmd.group) {
      lastGroup.commands.push({ cmd, absoluteIndex })
    } else {
      groupedResults.push({ group: cmd.group, commands: [{ cmd, absoluteIndex }] })
    }
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click (ignore clicks inside the modal).
        if (e.target === e.currentTarget) closePalette()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-[560px] bg-[var(--bg-primary,#FFFFFF)] rounded-xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.15)] border border-[var(--border,#E5EAF0)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border,#E5EAF0)]">
          <Search className="w-[18px] h-[18px] text-[var(--text-tertiary,#8A94A6)] shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search or jump to anywhere..."
            aria-label="Command palette search"
            className="flex-1 bg-transparent text-[14.5px] text-[var(--text-primary,#0D0E12)] placeholder:text-[var(--text-tertiary,#8A94A6)] outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 text-[10px] font-semibold text-[var(--text-tertiary,#8A94A6)] bg-[var(--bg-secondary,#F4F6F9)] border border-[var(--border,#E5EAF0)] rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Available commands"
          className="max-h-[380px] overflow-y-auto py-2"
        >
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center">
              {dbSearching ? (
                <p className="text-[13px] text-[var(--text-tertiary,#8A94A6)]">Searching your clinic…</p>
              ) : (
                <>
                  <p className="text-[13px] text-[var(--text-secondary,#566275)]">
                    No results for <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary,#8A94A6)] mt-1">
                    Try a shorter search or check spelling.
                  </p>
                </>
              )}
            </div>
          ) : (
            groupedResults.map((grp) => (
              <div key={grp.group} className="mb-1 last:mb-0">
                <div className="px-4 pt-1.5 pb-1 text-[10px] uppercase tracking-[0.8px] font-semibold text-[var(--text-tertiary,#8A94A6)]">
                  {GROUP_LABELS[grp.group as keyof typeof GROUP_LABELS] ?? grp.group}
                </div>
                {grp.commands.map(({ cmd, absoluteIndex }) => {
                  const Icon = cmd.icon
                  const isActive = absoluteIndex === activeIndex
                  const isCurrentClinic = cmd.group === 'clinics' && cmd.action === `switch-clinic:${activeClinicId}`
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-index={absoluteIndex}
                      onMouseEnter={() => setActiveIndex(absoluteIndex)}
                      onClick={() => runCommand(cmd)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive
                          ? 'bg-[var(--brand-light,#E6FBF2)] text-[var(--brand,#00D68F)]'
                          : 'text-[var(--text-primary,#0D0E12)] hover:bg-[var(--bg-hover,#F3F4F6)]',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[18px] h-[18px] shrink-0',
                          isActive ? 'text-[var(--brand,#00D68F)]' : 'text-[var(--text-tertiary,#8A94A6)]',
                        )}
                        strokeWidth={1.75}
                      />
                      <span className={cn('text-[14px] font-medium flex-1 truncate', !isActive && 'text-[var(--text-primary,#0D0E12)]')}>
                        {cmd.label}
                      </span>
                      {cmd.hint && (
                        <span className="text-[11px] text-[var(--text-tertiary,#8A94A6)]">{cmd.hint}</span>
                      )}
                      {isCurrentClinic && (
                        <Check className="w-4 h-4 text-[var(--brand,#00D68F)]" strokeWidth={2} />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border,#E5EAF0)] bg-[var(--bg-secondary,#F4F6F9)]">
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary,#8A94A6)]">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold bg-white border border-[var(--border,#E5EAF0)] rounded">↑</kbd>
              <kbd className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold bg-white border border-[var(--border,#E5EAF0)] rounded">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-4 px-1 text-[10px] font-semibold bg-white border border-[var(--border,#E5EAF0)] rounded">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary,#8A94A6)]">
            <kbd className="inline-flex items-center justify-center h-4 px-1 text-[10px] font-semibold bg-white border border-[var(--border,#E5EAF0)] rounded mr-1">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold bg-white border border-[var(--border,#E5EAF0)] rounded">K</kbd>
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Trigger-styled button used in the topbar. Click dispatches the custom
 * event; Cmd+K still works globally even if this button is offscreen.
 */
export function CommandPaletteTrigger() {
  const isMac = useIsMac()
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
      className="hidden sm:flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-1.5 border border-[var(--border-subtle)] w-[260px] text-left hover:bg-[var(--bg-hover)] hover:border-[var(--border)] transition-colors group"
      aria-label="Open command palette"
    >
      <Search className="w-[14px] h-[14px] text-[var(--text-tertiary)] shrink-0" strokeWidth={1.75} />
      <span className="text-[13px] text-[var(--text-tertiary)] flex-1 truncate">Search or jump to…</span>
      <kbd className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--text-tertiary)] shrink-0">
        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 bg-white border border-[var(--border)] rounded">
          {isMac ? '⌘' : 'Ctrl'}
        </span>
        <span className="inline-flex items-center justify-center w-4 h-4 bg-white border border-[var(--border)] rounded">K</span>
      </kbd>
    </button>
  )
}
