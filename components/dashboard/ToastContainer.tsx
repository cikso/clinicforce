'use client'

import { useEffect, useState } from 'react'
import { Check, AlertTriangle, Info, X } from 'lucide-react'

export interface ToastItem {
  id: string
  message: string
  variant: 'success' | 'warning' | 'info'
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

const variantConfig = {
  success: { bg: 'bg-white border-l-4 border-l-teal-500', icon: <Check className="w-4 h-4 text-teal-600" />, iconBg: 'bg-teal-50' },
  warning: { bg: 'bg-white border-l-4 border-l-[#b91c1c]', icon: <AlertTriangle className="w-4 h-4 text-[#b91c1c]" />, iconBg: 'bg-rose-50' },
  info: { bg: 'bg-white border-l-4 border-l-[#0891b2]', icon: <Info className="w-4 h-4 text-[#0891b2]" />, iconBg: 'bg-[#0891b2]/[0.07]' },
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const cfg = variantConfig[toast.variant]

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 4s
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 4000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [toast.id, onDismiss])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-[0_4px_16px_rgba(15,39,68,0.12)] border border-slate-200/70 min-w-[280px] max-w-[360px] transition-all duration-300 ${cfg.bg} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className={`w-7 h-7 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}>
        {cfg.icon}
      </div>
      <p className="text-sm font-medium text-slate-700 flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
