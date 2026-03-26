'use client'

import { FileImage, FileVideo, FileText, Flag } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import MediaStatusBadge from './MediaStatusBadge'
import { formatRelative } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const fileTypeConfig = {
  image: {
    icon: FileImage,
    bgClass: 'bg-blue-50',
    iconClass: 'text-blue-400',
    label: 'Image',
  },
  video: {
    icon: FileVideo,
    bgClass: 'bg-purple-50',
    iconClass: 'text-purple-400',
    label: 'Video',
  },
  document: {
    icon: FileText,
    bgClass: 'bg-teal-50',
    iconClass: 'text-teal-400',
    label: 'Document',
  },
}

interface MediaCardProps {
  item: MediaItem
  onClick: (item: MediaItem) => void
}

export default function MediaCard({ item, onClick }: MediaCardProps) {
  const cfg = fileTypeConfig[item.fileType]
  const FileIcon = cfg.icon

  return (
    <button
      onClick={() => onClick(item)}
      className={cn(
        'group bg-white rounded-xl border border-border shadow-sm overflow-hidden text-left w-full transition-shadow hover:shadow-md',
        item.status === 'FLAGGED' && 'border-red-200'
      )}
    >
      {/* Thumbnail area */}
      <div
        className={cn(
          'relative flex items-center justify-center h-28 w-full',
          cfg.bgClass
        )}
      >
        <FileIcon className={cn('w-10 h-10 opacity-40', cfg.iconClass)} strokeWidth={1.5} />
        {item.status === 'FLAGGED' && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <Flag className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/80 text-muted-foreground">
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <p className="text-xs font-semibold text-foreground truncate mb-0.5">
          {item.patient.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate mb-2">
          {item.fileName}
        </p>
        <div className="flex items-center justify-between gap-1">
          <MediaStatusBadge status={item.status} />
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatRelative(item.uploadedAt)}
          </span>
        </div>
      </div>
    </button>
  )
}
