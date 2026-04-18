'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Press `?` (or `shift+/`) anywhere to open. Esc or `?` again closes.
 * Skips when focus is in an input/textarea/contenteditable so typing "?" in
 * the command palette or a search field doesn't trigger it.
 */
export default function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    setIsMac(/Mac|iPhone|iPad|iPod/.test(ua))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')

      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key === '?' && !isEditable) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const mod = isMac ? '⌘' : 'Ctrl'

  const sections: Array<{
    title: string
    items: Array<{ keys: string[]; label: string }>
  }> = [
    {
      title: 'General',
      items: [
        { keys: [mod, 'K'], label: 'Open command palette' },
        { keys: ['?'], label: 'Show this shortcuts panel' },
        { keys: ['Esc'], label: 'Close dialog or panel' },
      ],
    },
    {
      title: 'Navigation',
      items: [
        { keys: ['G', 'O'], label: 'Go to Command Centre' },
        { keys: ['G', 'C'], label: 'Go to Call Inbox' },
        { keys: ['G', 'A'], label: 'Go to Action Queue' },
        { keys: ['G', 'I'], label: 'Go to Insights' },
        { keys: ['G', 'S'], label: 'Go to Settings' },
      ],
    },
    {
      title: 'Lists & tables',
      items: [
        { keys: ['↑', '↓'], label: 'Move selection' },
        { keys: ['↵'], label: 'Open selected row' },
        { keys: ['/'], label: 'Focus search' },
      ],
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div className="w-full max-w-[640px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(15,23,42,0.25)] border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] font-heading">
              Keyboard shortcuts
            </h2>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
              Hit <Kbd>?</Kbd> any time to reopen this panel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 px-6 py-5 max-h-[60vh] overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="eyebrow text-[var(--text-tertiary)] mb-2.5">{section.title}</h3>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)] truncate">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, idx) => (
                        <Kbd key={idx}>{k}</Kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            Tip: most destructive actions have confirmation dialogs — shortcuts
            won&rsquo;t trigger them.
          </span>
          <span className="text-[11px] text-[var(--text-tertiary)]">
            Close with <Kbd>Esc</Kbd>
          </span>
        </div>
      </div>
    </div>
  )
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-semibold text-[var(--text-secondary)] bg-white border border-[var(--border)] rounded-md shadow-[0_1px_0_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
