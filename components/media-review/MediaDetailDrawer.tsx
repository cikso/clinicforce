'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { MediaItem } from '@/lib/types'
import MediaStatusBadge from './MediaStatusBadge'
import PatientAvatar from '@/components/shared/PatientAvatar'
import { formatRelative, formatTime } from '@/lib/formatters'
import {
  FileImage,
  FileVideo,
  FileText,
  CheckCircle2,
  Flag,
  Link2,
  StickyNote,
  Check,
  User,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const fileTypeConfig = {
  image: { icon: FileImage, bgClass: 'bg-teal-50', iconClass: 'text-teal-400', label: 'Image' },
  video: { icon: FileVideo, bgClass: 'bg-purple-50', iconClass: 'text-purple-400', label: 'Video' },
  document: { icon: FileText, bgClass: 'bg-teal-50', iconClass: 'text-teal-400', label: 'Document' },
}

type ActionKey = 'approve' | 'flag' | 'link' | 'note'

interface ActionBtnProps {
  icon: React.ElementType
  label: string
  variant?: 'default' | 'danger' | 'success'
  done: boolean
  onClick: () => void
}

function ActionBtn({ icon: Icon, label, variant = 'default', done, onClick }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-left w-full',
        done
          ? 'bg-green-50 text-green-700 border-green-200'
          : variant === 'danger'
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          : variant === 'success'
          ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
          : 'bg-white text-foreground border-border hover:bg-muted'
      )}
    >
      {done ? (
        <Check className="w-3.5 h-3.5 shrink-0 text-green-600" strokeWidth={2.5} />
      ) : (
        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      )}
      {done ? 'Done' : label}
    </button>
  )
}

interface MediaDetailDrawerProps {
  item: MediaItem | null
  open: boolean
  onClose: () => void
}

export default function MediaDetailDrawer({ item, open, onClose }: MediaDetailDrawerProps) {
  const [done, setDone] = useState<Set<ActionKey>>(new Set())

  const toggle = (key: ActionKey) =>
    setDone((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const cfg = item ? fileTypeConfig[item.fileType] : null
  const FileIcon = cfg?.icon ?? FileImage

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[460px] sm:max-w-[460px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {item ? `Media — ${item.fileName}` : 'Media detail'}
          </SheetTitle>
        </SheetHeader>

        {!item || !cfg ? null : (
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* File preview */}
            <div className={cn('flex items-center justify-center h-40 w-full relative', cfg.bgClass)}>
              <FileIcon className={cn('w-14 h-14 opacity-30', cfg.iconClass)} strokeWidth={1.5} />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-[11px] font-medium px-2 py-1 rounded bg-white/80 text-muted-foreground">
                  {cfg.label}
                </span>
                <MediaStatusBadge status={item.status} />
              </div>
            </div>

            {/* File info */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground mb-0.5 break-all">{item.fileName}</p>
              <p className="text-[11px] text-muted-foreground">
                Uploaded {formatRelative(item.uploadedAt)} · {formatTime(item.uploadedAt)}
              </p>
              {item.linkedCaseId && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Link2 className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                  <span className="text-[11px] text-primary font-medium">Linked to case</span>
                </div>
              )}
            </div>

            {/* Patient */}
            <div className="px-5 py-3.5 border-b border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Patient
              </p>
              <div className="flex items-center gap-2.5">
                <PatientAvatar name={item.patient.name} species={item.patient.species} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.patient.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.patient.species} · {item.patient.breed} · {item.patient.age}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <User className="w-3 h-3 shrink-0" />
                  {item.patient.ownerName}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Phone className="w-3 h-3 shrink-0" />
                  {item.patient.ownerPhone}
                </div>
              </div>
            </div>

            {/* Review note (if any) */}
            {item.reviewNote && (
              <div className="px-5 py-3.5 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Review note
                </p>
                <div
                  className={cn(
                    'rounded-lg px-3 py-2.5',
                    item.status === 'FLAGGED'
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-muted/50'
                  )}
                >
                  <p className="text-xs text-foreground leading-relaxed">{item.reviewNote}</p>
                </div>
              </div>
            )}

            {/* Staff actions */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Review actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn
                  icon={CheckCircle2}
                  label="Approve / mark reviewed"
                  variant="success"
                  done={done.has('approve')}
                  onClick={() => toggle('approve')}
                />
                <ActionBtn
                  icon={Flag}
                  label="Flag for attention"
                  variant="danger"
                  done={done.has('flag')}
                  onClick={() => toggle('flag')}
                />
                <ActionBtn
                  icon={Link2}
                  label="Link to case"
                  done={done.has('link')}
                  onClick={() => toggle('link')}
                />
                <ActionBtn
                  icon={StickyNote}
                  label="Add review note"
                  done={done.has('note')}
                  onClick={() => toggle('note')}
                />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
