'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────── */

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

/* ─── Context ──────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/* ─── Provider ─────────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => dismiss(id), 5000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[380px]">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ─── Toast Item ───────────────────────────────────────────────────── */

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-4.5 w-4.5 text-[var(--success)]" />,
  error:   <AlertCircle className="h-4.5 w-4.5 text-[var(--error)]" />,
  warning: <AlertTriangle className="h-4.5 w-4.5 text-[var(--warning)]" />,
  info:    <Info className="h-4.5 w-4.5 text-[var(--brand)]" />,
}

const BG: Record<ToastType, string> = {
  success: 'border-[var(--success)]/20 bg-[var(--success-light)]',
  error:   'border-[var(--error)]/20 bg-[var(--error-light)]',
  warning: 'border-[var(--warning)]/20 bg-[var(--warning-light)]',
  info:    'border-[var(--brand)]/20 bg-[var(--brand-light)]',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-right-5 fade-in duration-200 ${BG[toast.type]}`}
      role="alert"
    >
      <div className="mt-0.5 shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{toast.title}</p>
        {toast.description && (
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 mt-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
