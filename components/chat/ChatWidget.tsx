'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, AlertTriangle, Clock, Info } from 'lucide-react'
import type { ChatMessage, ChatResponse } from '@/app/api/chat/route'

interface Message {
  role: 'user' | 'assistant'
  content: string
  triage?: string
}

const TRIAGE_CONFIG = {
  EMERGENCY: {
    color: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    icon: AlertTriangle,
    label: 'Emergency',
  },
  URGENT: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
    label: 'Urgent',
  },
  ROUTINE: {
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    icon: Info,
    label: 'Routine',
  },
  CLINIC_INFO: {
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    icon: Info,
    label: 'Clinic Info',
  },
}

const CLINIC_ID = 'demo-clinic'

const STARTER_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi, I'm Stella — the virtual assistant for Downtown Emergency Veterinary Clinic. How can I help your pet today?",
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([STARTER_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentTriage, setCurrentTriage] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Build history for context (exclude starter, map to API shape)
    const history: ChatMessage[] = messages
      .filter((m) => m.content !== STARTER_MESSAGE.content)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: CLINIC_ID,
          message: text,
          history,
          channel: 'chat',
        }),
      })

      if (!res.ok) throw new Error('Chat failed')

      const data: ChatResponse = await res.json()
      setCurrentTriage(data.triage)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, triage: data.triage },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please call us on (03) 9123 4567.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const triageInfo = currentTriage ? TRIAGE_CONFIG[currentTriage as keyof typeof TRIAGE_CONFIG] : null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className="w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-[var(--brand)] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Stella</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white/70 text-[11px]">AI Veterinary Assistant</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Triage badge */}
          {triageInfo && (
            <div className={`px-4 py-2 flex items-center gap-2 border-b text-[11px] font-semibold ${triageInfo.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${triageInfo.dot}`} />
              {triageInfo.label} — {
                currentTriage === 'EMERGENCY'
                  ? 'Please call us or go to emergency immediately'
                  : currentTriage === 'URGENT'
                  ? 'Your pet should be seen today'
                  : currentTriage === 'ROUTINE'
                  ? 'A scheduled appointment is appropriate'
                  : 'Clinic information'
              }
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--brand)] text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                  <span className="text-xs text-slate-400">Stella is thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/10 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Describe your pet's concern..."
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-7 h-7 bg-[var(--brand)] rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-[var(--brand-hover)] transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              AI assistant — not a substitute for veterinary care
            </p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 bg-[var(--brand)] hover:bg-[var(--brand-hover)] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  )
}
