'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, Select, Textarea, SubmitButton, ErrorBanner, BackButton,
  stepHeading, stepSubheading, StepDescription,
} from '../../_components'

const PRESET_SYMPTOMS = [
  'Collapse or loss of consciousness',
  'Severe or uncontrolled bleeding',
  'Difficulty breathing or choking',
  'Suspected poisoning or toxin ingestion',
  'Severe trauma (hit by vehicle, fall)',
  'Pale or white gums',
  'Unable to urinate (especially male cats)',
  'Not eating for 24+ hours',
  'Persistent vomiting or diarrhoea',
  'Sudden lameness or limping',
  'Eye discharge or squinting',
  'Significant behavioural changes',
]

export default function UrgentRulesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [selected, setSelected] = useState<Set<string>>(
    new Set([
      'Collapse or loss of consciousness',
      'Severe or uncontrolled bleeding',
      'Difficulty breathing or choking',
      'Suspected poisoning or toxin ingestion',
      'Pale or white gums',
      'Unable to urinate (especially male cats)',
    ])
  )
  const [callbackPref, setCallbackPref] = useState('same_day')
  const [customNote, setCustomNote] = useState('')

  function toggleSymptom(sym: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(sym)) next.delete(sym)
      else next.add(sym)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const urgentRules = {
      urgent_symptoms: Array.from(selected),
      callback_preference: callbackPref,
      custom_note: customNote.trim(),
    }

    startTransition(async () => {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'urgent-rules',
          data: { urgent_rules: urgentRules },
          complete: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save.'); return }
      router.push('/onboarding/complete')
    })
  }

  return (
    <StepCard>
      <BackButton href="/onboarding/call-handling" />
      <p style={stepSubheading}>Step 4 of 4</p>
      <h1 style={stepHeading}>Urgent triage rules</h1>
      <StepDescription>
        Select which symptoms your AI receptionist should flag as urgent. Callers reporting these will be prioritised for same-day follow-up.
      </StepDescription>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Symptom checklist */}
        <div>
          <p style={{
            fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '12px',
            marginTop: 0,
          }}>
            Urgent symptoms
          </p>
          <div
            role="group"
            aria-label="Urgent symptoms"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >
            {PRESET_SYMPTOMS.map((sym) => {
              const isChecked = selected.has(sym)
              return (
                <button
                  key={sym}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => toggleSymptom(sym)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: isChecked ? 'var(--brand-light)' : 'var(--bg-secondary)',
                    border: isChecked ? '1px solid rgba(0, 214, 143, 0.35)' : '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 140ms ease, border-color 140ms ease',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    aria-hidden
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      backgroundColor: isChecked ? 'var(--brand)' : 'var(--bg-primary)',
                      border: isChecked ? '1px solid var(--brand)' : '1px solid var(--border-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      transition: 'background-color 140ms ease, border-color 140ms ease',
                    }}
                  >
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                      fontSize: '13px',
                      color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.4,
                      fontWeight: isChecked ? 600 : 500,
                    }}
                  >
                    {sym}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Callback preference */}
        <Field
          label="Callback priority for urgent callers"
          hint="How quickly should the team follow up after an urgent flag is raised?"
        >
          <Select
            value={callbackPref}
            onChange={(e) => setCallbackPref(e.target.value)}
          >
            <option value="same_day">Same day — as soon as possible</option>
            <option value="within_2h">Within 2 hours</option>
            <option value="within_4h">Within 4 hours</option>
            <option value="next_available">Next available appointment</option>
          </Select>
        </Field>

        {/* Custom note */}
        <Field
          label="Additional triage notes (optional)"
          hint="Any custom instructions for your AI receptionist when handling urgent calls."
        >
          <Textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Always collect the pet's age and weight for any urgent call..."
            rows={3}
          />
        </Field>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} label="Complete Setup" pendingLabel="Saving..." />
      </form>
    </StepCard>
  )
}
