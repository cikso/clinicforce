'use client'

import { useState, useCallback } from 'react'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Toggle from '@/app/components/ui/Toggle'
import Badge from '@/app/components/ui/Badge'
import StatusDot from '@/app/components/ui/StatusDot'
import { cn } from '@/lib/utils'

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface VoiceAgent {
  id: string
  clinic_id: string
  is_active: boolean
  mode: string
  elevenlabs_agent_id: string
  twilio_phone_number: string
}

interface AIAgentClientProps {
  voiceAgent: VoiceAgent | null
  clinicName: string
  callHandlingPrefs: Record<string, boolean>
  industryConfig: Record<string, unknown>
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors outline-none'

/* ── Toast ──────────────────────────────────────────────────────────────────── */

function Toast({ message, variant, onDismiss }: { message: string; variant: 'success' | 'error'; onDismiss: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-[var(--shadow-md)] border',
        variant === 'success'
          ? 'bg-[var(--success-light)] border-[var(--success)]/20 text-[var(--success)]'
          : 'bg-[var(--error-light)] border-[var(--error)]/20 text-[var(--error)]',
      )}>
        {variant === 'success' ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 7.5L6 10l4.5-6" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.01" /></svg>
        )}
        <span className="text-[13px] font-medium">{message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function AIAgentClient({ voiceAgent, clinicName, callHandlingPrefs, industryConfig }: AIAgentClientProps) {
  const [isActive, setIsActive] = useState(voiceAgent?.is_active ?? false)
  const [greeting, setGreeting] = useState(
    (callHandlingPrefs as Record<string, string | boolean>)?.greeting as string ??
    `Thank you for calling ${clinicName}, this is Sarah. How can I help you today?`,
  )

  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    emergency_triage: callHandlingPrefs.emergency_triage ?? true,
    appointment_capture: callHandlingPrefs.appointment_capture ?? true,
    transfers: callHandlingPrefs.transfers ?? true,
    followup_queue: callHandlingPrefs.followup_queue ?? true,
    post_call_sms: false,
    auto_booking: false,
  })

  const triageKeywordsRaw = (industryConfig?.triage_keywords as string[]) ?? []
  const [keywords, setKeywords] = useState<string[]>(triageKeywordsRaw)
  const [newKeyword, setNewKeyword] = useState('')

  const [savingAgent, setSavingAgent] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingKeywords, setSavingKeywords] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function handleToggleAgent() {
    if (!voiceAgent) return
    const newState = !isActive
    setIsActive(newState)
    setSavingAgent(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'voice_agents',
          id: voiceAgent.id,
          data: { is_active: newState },
        }),
      })
      showToast(res.ok ? `Sarah AI ${newState ? 'activated' : 'deactivated'}` : 'Failed to update', res.ok ? 'success' : 'error')
      if (!res.ok) setIsActive(!newState)
    } catch {
      setIsActive(!newState)
      showToast('Failed to update', 'error')
    } finally {
      setSavingAgent(false)
    }
  }

  async function handleSavePrefs(e: React.FormEvent) {
    e.preventDefault()
    setSavingPrefs(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'clinics',
          data: {
            call_handling_prefs: {
              ...prefs,
              greeting,
            },
          },
        }),
      })
      showToast(res.ok ? 'Call handling preferences saved' : 'Failed to save', res.ok ? 'success' : 'error')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSavingPrefs(false)
    }
  }

  async function handleSaveKeywords(e: React.FormEvent) {
    e.preventDefault()
    setSavingKeywords(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'clinics',
          data: {
            industry_config: { ...industryConfig, triage_keywords: keywords },
          },
        }),
      })
      showToast(res.ok ? 'Triage keywords saved' : 'Failed to save', res.ok ? 'success' : 'error')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSavingKeywords(false)
    }
  }

  function addKeyword() {
    const kw = newKeyword.trim().toLowerCase()
    if (!kw || keywords.includes(kw)) return
    setKeywords((prev) => [...prev, kw])
    setNewKeyword('')
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw))
  }

  function maskId(id: string) {
    if (!id) return '—'
    if (id.length <= 8) return id
    return id.slice(0, 4) + '••••' + id.slice(-4)
  }

  const PREF_ITEMS = [
    { key: 'emergency_triage', label: 'Emergency Triage', desc: 'Detect and escalate emergency calls immediately' },
    { key: 'appointment_capture', label: 'Appointment Capture', desc: 'Attempt to capture booking requests during calls' },
    { key: 'transfers', label: 'Call Transfers', desc: 'Allow Sarah to transfer calls to staff when requested' },
    { key: 'followup_queue', label: 'Follow-up Queue', desc: 'Create follow-up tasks for calls requiring action' },
    { key: 'post_call_sms', label: 'Post-Call SMS', desc: 'Send caller a summary SMS after each call', disabled: true, comingSoon: true },
    { key: 'auto_booking', label: 'Auto-Booking', desc: 'Book appointments directly during calls', disabled: true, comingSoon: true },
  ]

  return (
    <div className="space-y-5 max-w-[680px]">
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}

      {/* Agent Status Card */}
      <Card header={{ title: 'Agent Status', subtitle: 'Control your AI voice agent' }}>
        {voiceAgent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusDot variant={isActive ? 'active' : 'offline'} />
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    Sarah AI is {isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Mode: {voiceAgent.mode || 'default'}
                  </p>
                </div>
              </div>
              <Toggle checked={isActive} onChange={handleToggleAgent} disabled={savingAgent} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold mb-1">Phone Number</p>
                <p className="text-[13px] text-[var(--text-primary)] font-mono-data">{voiceAgent.twilio_phone_number || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                <p className="text-[11px] uppercase tracking-[0.5px] text-[var(--text-tertiary)] font-semibold mb-1">Agent ID</p>
                <p className="text-[13px] text-[var(--text-primary)] font-mono-data">{maskId(voiceAgent.elevenlabs_agent_id)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-[13px] text-[var(--text-tertiary)]">No voice agent configured for this clinic.</p>
          </div>
        )}
      </Card>

      {/* Greeting & Behaviour Card */}
      <Card header={{ title: 'Greeting & Behaviour', subtitle: 'Customise how Sarah greets callers' }}>
        <form onSubmit={handleSavePrefs} className="space-y-4">
          <div>
            <label className="block text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-1.5">
              Custom Greeting
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              className={cn(inputCls, 'resize-none')}
              placeholder={`Thank you for calling ${clinicName}, this is Sarah. How can I help you today?`}
            />
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
              Sarah will use your clinic name and industry context automatically.
            </p>
          </div>

          {/* Call Handling Toggles */}
          <div className="space-y-0.5">
            <p className="text-[12px] uppercase tracking-[0.5px] text-[var(--text-secondary)] font-semibold mb-2">Call Handling Rules</p>
            {PREF_ITEMS.map((item) => (
              <div
                key={item.key}
                className={cn(
                  'flex items-center justify-between py-3 px-3 rounded-lg',
                  item.disabled ? 'opacity-60' : 'hover:bg-[var(--bg-hover)]',
                )}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.label}</p>
                    {item.comingSoon && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)] font-medium">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{item.desc}</p>
                </div>
                <Toggle
                  checked={prefs[item.key] ?? false}
                  onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
                  disabled={item.disabled}
                />
              </div>
            ))}
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" loading={savingPrefs}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Triage Keywords Card */}
      <Card header={{ title: 'Triage Keywords', subtitle: 'Words that trigger urgent call escalation' }}>
        <form onSubmit={handleSaveKeywords} className="space-y-4">
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Sarah uses these keywords to detect urgent calls and escalate immediately.
          </p>

          {/* Keyword chips */}
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--error-light)] text-[var(--error)] text-[12px] font-medium"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="hover:bg-[var(--error)]/10 rounded-full p-0.5 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
                  </svg>
                </button>
              </span>
            ))}
            {keywords.length === 0 && (
              <span className="text-[12px] text-[var(--text-tertiary)] italic">No keywords configured</span>
            )}
          </div>

          {/* Add keyword */}
          <div className="flex gap-2">
            <input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
              className={cn(inputCls, 'flex-1')}
              placeholder="Add a keyword..."
            />
            <Button type="button" variant="secondary" size="md" onClick={addKeyword}>
              Add
            </Button>
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" loading={savingKeywords}>
              Save Keywords
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
