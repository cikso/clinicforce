import { cn } from '@/lib/utils'

const dotVariants = {
  active:  'bg-[var(--success)]',
  standby: 'bg-[var(--warning)]',
  offline: 'bg-[var(--text-tertiary)]',
  error:   'bg-[var(--error)]',
} as const

interface StatusDotProps {
  variant?: keyof typeof dotVariants
  className?: string
}

export default function StatusDot({ variant = 'offline', className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex h-2 w-2 shrink-0', className)}>
      {variant === 'active' && (
        <span
          className="absolute inset-0 rounded-full bg-[var(--success)] animate-[pulse-ring_1.5s_ease-out_infinite]"
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-2 w-2', dotVariants[variant])} />
    </span>
  )
}
