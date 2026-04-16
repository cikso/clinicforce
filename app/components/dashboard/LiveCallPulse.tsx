'use client'

import Link from 'next/link'
import { useActiveCall } from '@/lib/hooks/useActiveCall'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Signature micro-interaction: when Stella is handling a live call, a subtle
 * pulsing pill appears in the topbar. Clicking jumps to the call inbox.
 *
 * Hidden when no call is active — does not take up space.
 */
export default function LiveCallPulse() {
  const call = useActiveCall()

  if (!call) return null

  return (
    <Link
      href={`/calls?id=${encodeURIComponent(call.id)}`}
      className="group relative inline-flex items-center gap-2.5 rounded-full border border-[var(--brand)]/20 bg-[var(--brand-light)] pl-2 pr-3.5 py-1 text-[12px] font-semibold text-[var(--brand-hover)] transition-all hover:border-[var(--brand)]/40 hover:shadow-[0_0_0_4px_rgba(0,214,143,0.10)]"
      aria-label={`Stella is on a call with ${call.callerName}. Duration ${formatDuration(call.duration)}. Click to view.`}
    >
      {/* Pulsing dot */}
      <span className="relative inline-flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-[live-ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-[var(--brand)] opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand)]" />
      </span>

      <span className="font-medium text-[var(--text-primary)]">
        Stella is on a call
      </span>

      <span className="text-[var(--text-tertiary)]">·</span>

      <span className="font-mono-data tabular-nums text-[11px] text-[var(--brand-hover)]">
        {formatDuration(call.duration)}
      </span>
    </Link>
  )
}
