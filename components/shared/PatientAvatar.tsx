import { cn } from '@/lib/utils'
import type { Species } from '@/lib/types'

const speciesEmoji: Record<Species, string> = {
  Canine: '🐕',
  Feline: '🐈',
  Avian: '🦜',
  Exotic: '🦎',
}

interface PatientAvatarProps {
  name: string
  species: Species
  size?: 'sm' | 'md'
  className?: string
}

export default function PatientAvatar({
  name,
  species,
  size = 'md',
  className,
}: PatientAvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-accent text-sm select-none shrink-0',
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm',
        className
      )}
      title={`${name} (${species})`}
    >
      {speciesEmoji[species]}
    </div>
  )
}
