'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Vim/Linear-style "g + <letter>" jump shortcuts.
 *
 * Press `g` then within 1500ms press a destination letter to navigate.
 * Skips when focus is in an editable field so typing "g" in a form still
 * inserts the character. Mirrors the bindings advertised in
 * KeyboardShortcutsOverlay so the help panel stays honest.
 */
const GOTO_MAP: Record<string, string> = {
  o: '/overview',        // Command Centre (Overview)
  c: '/conversations',   // Call Inbox
  a: '/actions',         // Action Queue
  i: '/insights',        // Insights
  s: '/settings',        // Settings
}

const PREFIX_WINDOW_MS = 1500

export default function KeyboardNavShortcuts() {
  const router = useRouter()

  useEffect(() => {
    let prefixActive = false
    let prefixTimer: number | null = null

    function clearPrefix() {
      prefixActive = false
      if (prefixTimer !== null) {
        window.clearTimeout(prefixTimer)
        prefixTimer = null
      }
    }

    function onKey(e: KeyboardEvent) {
      // Ignore anything with modifiers — those belong to the command palette
      // or browser shortcuts.
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target as HTMLElement | null
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')
      if (isEditable) return

      const key = e.key.toLowerCase()

      if (prefixActive) {
        const dest = GOTO_MAP[key]
        if (dest) {
          e.preventDefault()
          router.push(dest)
        }
        clearPrefix()
        return
      }

      if (key === 'g') {
        e.preventDefault()
        prefixActive = true
        prefixTimer = window.setTimeout(() => {
          clearPrefix()
        }, PREFIX_WINDOW_MS)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearPrefix()
    }
  }, [router])

  return null
}
