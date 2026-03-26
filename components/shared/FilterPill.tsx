'use client'

import { cn } from '@/lib/utils'

interface FilterPillProps {
  active: boolean
  activeClassName?: string
  onClick: () => void
  children: React.ReactNode
}

export default function FilterPill({
  active,
  activeClassName = 'bg-foreground text-background border-transparent shadow-sm',
  onClick,
  children,
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap',
        active
          ? cn(activeClassName, 'border-transparent shadow-sm')
          : 'bg-white text-muted-foreground border-border hover:bg-muted'
      )}
    >
      {children}
    </button>
  )
}
