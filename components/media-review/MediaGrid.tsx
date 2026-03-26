'use client'

import type { MediaItem } from '@/lib/types'
import MediaCard from './MediaCard'
import { ImageOff } from 'lucide-react'

interface MediaGridProps {
  items: MediaItem[]
  onSelect: (item: MediaItem) => void
}

export default function MediaGrid({ items, onSelect }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <ImageOff className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium">No media matches these filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} onClick={onSelect} />
      ))}
    </div>
  )
}
