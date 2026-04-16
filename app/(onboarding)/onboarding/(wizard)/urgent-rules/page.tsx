'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  StepCard, Field, Select, SubmitButton, ErrorBanner, BackButton,
  stepHeading, stepSubheading,
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
      <p style={{ fontFamily: "'DM Sans'", fontSize: '0.925rem', color: '#6B6B6B', marginBottom: '2rem', lineHeight: 1.5 }}>
        Select which symptoms your AI receptionist should flag as urgent. Callers reporting these will be prioritised for same-day follow-up.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Symptom checklist */}
        <div>
          <p style={{ fontFamily: "'DM Sans'", fontSize: '0.82rem', fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
            Urgent symptoms
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            {PRESET_SYMPTOMS.map((sym) => {
              const isChecked = selected.has(sym)
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    padding: '0.75rem',
                    backgroundColor: isChecked ? 'rgba(23,196,190,0.06)' : '#F9F8F6',
                    border: isChecked ? '1px solid rgba(23,196,190,0.35)' : '1px solid #E8E4DE',
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      backgroundColor: isChecked ? '#00D68F' : '#ffffff',
                      border: isChecked ? '1px solid #00D68F' : '1px solid #D0CCC6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      transition: 'all 0.15s',
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
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.825rem',
                      color: isChecked ? '#1A1A1A' : '#6B6B6B',
                      lineHeight: 1.4,
                      fontWeight: isChecked ? 500 : 400,
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
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Always collect the pet's age and weight for any urgent call..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid #E8E4DE',
              borderRadius: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.95rem',
              color: '#1A1A1A',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00D68F')}
            onBlur={(e) => (e.target.style.borderColor = '#E8E4DE')}
          />
        </Field>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        <SubmitButton isPending={isPending} label="Complete Setup" pendingLabel="Saving..." />
      </form>
    </StepCard>
  )
}
