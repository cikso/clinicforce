'use client'

import { useState } from 'react'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Toggle from '@/app/components/ui/Toggle'
import StatusDot from '@/app/components/ui/StatusDot'
import { useToast } from '@/app/components/ui/Toast'
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

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function AIAgentClient({ voiceAgent, clinicName, callHandlingPrefs, industryConfig }: AIAgentClientProps) {
  const [isActive, setIsActive] = useState(voiceAgent?.is_active ?? false)
  const [greeting, setGreeting] = useState(
    (callHandlingPrefs as Record<string, string | boolean>)?.greeting as string ??
    `Thank you for calling ${clinicName}, this is Stella. How can I help you today?`,
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
  const { toast } = useToast()

  function showSuccess(title: string) { toast({ type: 'success', title }) }
  function showError(title: string)   { toast({ type: 'error', title }) }

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
      if (res.ok) {
        showSuccess(`Stella AI ${newState ? 'activated' : 'deactivated'}`)
      } else {
        showError('Failed to update')
        setIsActive(!newState)
      }
    } catch {
      setIsActive(!newState)
      showError('Failed to update')
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
      if (res.ok) {
        showSuccess('Call handling preferences saved')
      } else {
        showError('Failed to save')
      }
    } catch {
      showError('Failed to save')
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
      if (res.ok) {
        showSuccess('Triage keywords saved')
      } else {
        showError('Failed to save')
      }
    } catch {
      showError('Failed to save')
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
    { key: 'transfers', label: 'Call Transfers', desc: 'Allow Stella to transfer calls to staff when requested' },
    { key: 'followup_queue', label: 'Follow-up Queue', desc: 'Create follow-up tasks for calls requiring action' },
    { key: 'post_call_sms', label: 'Post-Call SMS', desc: 'Send caller a summary SMS after each call', disabled: true, comingSoon: true },
    { key: 'auto_booking', label: 'Auto-Booking', desc: 'Book appointments directly during calls', disabled: true, comingSoon: true },
  ]

  return (
    <div className="space-y-5 max-w-[680px]">
      {/* Agent Status Card */}
      <Card header={{ title: 'Agent Status', subtitle: 'Control your AI voice agent' }}>
        {voiceAgent ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusDot variant={isActive ? 'active' : 'offline'} />
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    Stella AI is {isActive ? 'Active' : 'Inactive'}
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
      <Card header={{ title: 'Greeting & Behaviour', subtitle: 'Customise how Stella greets callers' }}>
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
              placeholder={`Thank you for calling ${clinicName}, this is Stella. How can I help you today?`}
            />
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
              Stella will use your clinic name and industry context automatically.
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
            Stella uses these keywords to detect urgent calls and escalate immediately.
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
