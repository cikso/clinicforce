import { Skeleton, ConversationRowSkeleton } from '@/app/components/ui/Skeleton'

export default function SmsLoading() {
  return (
    <div className="flex h-[calc(100vh-56px)] -m-6">
      {/* Conversation list */}
      <div className="w-[360px] border-r border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="p-4 border-b border-[var(--border-default)]">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <ConversationRowSkeleton key={i} />
        ))}
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-default)]">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4">
          {/* Incoming message */}
          <div className="flex gap-2 max-w-[60%]">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="h-16 w-64 rounded-xl rounded-tl-md" />
          </div>
          {/* Outgoing message */}
          <div className="flex justify-end">
            <Skeleton className="h-12 w-48 rounded-xl rounded-tr-md" />
          </div>
          {/* Incoming message */}
          <div className="flex gap-2 max-w-[60%]">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="h-10 w-56 rounded-xl rounded-tl-md" />
          </div>
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t border-[var(--border-default)]">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
