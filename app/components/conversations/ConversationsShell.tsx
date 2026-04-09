'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ConversationList, { type CallItem } from './ConversationList'
import ConversationDetail from './ConversationDetail'
import Button from '@/app/components/ui/Button'
import { cn } from '@/lib/utils'

interface ConversationsShellProps {
  initialCalls: CallItem[]
  hasExtraFields: boolean
  clinicId: string
}

export default function ConversationsShell({
  initialCalls,
  hasExtraFields,
  clinicId,
}: ConversationsShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialId = searchParams.get('id')

  const [selected, setSelected] = useState<CallItem | null>(
    initialId ? initialCalls.find(c => c.id === initialId) ?? null : null
  )
  // On mobile: track whether we're showing detail view
  const [mobileDetail, setMobileDetail] = useState(!!initialId)

  // If URL has ?id= and it matches a call, select it
  useEffect(() => {
    if (initialId && !selected) {
      const found = initialCalls.find(c => c.id === initialId)
      if (found) {
        setSelected(found)
        setMobileDetail(true)
      }
    }
  }, [initialId, initialCalls, selected])

  const handleSelect = useCallback((call: CallItem) => {
    setSelected(call)
    setMobileDetail(true)
    // Update URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.set('id', call.id)
    window.history.replaceState(null, '', url.toString())
  }, [])

  const handleStatusChange = useCallback((id: string, newStatus: string) => {
    // Update the selected call's status
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status: newStatus } : prev)
    }
    // Update the list via window bridge
    const updater = (window as unknown as Record<string, unknown>).__updateCallStatus as ((id: string, status: string) => void) | undefined
    updater?.(id, newStatus)
  }, [selected])

  const handleBack = useCallback(() => {
    setMobileDetail(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('id')
    window.history.replaceState(null, '', url.toString())
  }, [])

  return (
    <div className="flex h-[calc(100vh-56px)] -m-6 overflow-hidden">
      {/* Left: Call List */}
      <div className={cn(
        'w-full md:w-[380px] shrink-0 h-full',
        mobileDetail ? 'hidden md:block' : 'block',
      )}>
        <ConversationList
          initialCalls={initialCalls}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          hasExtraFields={hasExtraFields}
          clinicId={clinicId}
        />
      </div>

      {/* Right: Detail */}
      <div className={cn(
        'flex-1 h-full flex flex-col min-w-0',
        !mobileDetail ? 'hidden md:flex' : 'flex',
      )}>
        {/* Mobile back button */}
        {mobileDetail && (
          <div className="md:hidden shrink-0 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-primary)]">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M10 3L5 8l5 5" />
              </svg>
              Back
            </Button>
          </div>
        )}
        <ConversationDetail
          call={selected}
          hasExtraFields={hasExtraFields}
          clinicId={clinicId}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}
