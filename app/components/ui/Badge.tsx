import { cn } from '@/lib/utils'

const variants = {
  routine: {
    bg: 'bg-[var(--success-light)]',
    text: 'text-[var(--success)]',
    dot: 'bg-[var(--success)]',
  },
  urgent: {
    bg: 'bg-[var(--error-light)]',
    text: 'text-[var(--error)]',
    dot: 'bg-[var(--error)]',
  },
  high: {
    bg: 'bg-[var(--warning-light)]',
    text: 'text-[var(--warning)]',
    dot: 'bg-[var(--warning)]',
  },
  info: {
    bg: 'bg-[var(--info-light)]',
    text: 'text-[var(--info)]',
    dot: 'bg-[var(--info)]',
  },
  neutral: {
    bg: 'bg-[var(--bg-hover)]',
    text: 'text-[var(--text-secondary)]',
    dot: 'bg-[var(--text-tertiary)]',
  },
} as const

interface BadgeProps {
  variant?: keyof typeof variants
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  const style = variants[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-[12px] font-medium leading-none whitespace-nowrap',
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      {children}
    </span>
  )
}
