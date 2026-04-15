'use client'

import { useState, useTransition } from 'react'
import Button from '@/app/components/ui/Button'

type PlanKey = 'starter' | 'growth' | 'enterprise'

export function SubscribeButton({
  plan,
  label,
}: {
  plan: Exclude<PlanKey, 'enterprise'>
  label: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onClick = () => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
        if (!res.ok || !json.url) {
          setError(json.error ?? 'Could not start checkout. Please try again.')
          return
        }
        window.location.href = json.url
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  return (
    <>
      <Button variant="primary" size="sm" className="w-full" onClick={onClick} disabled={isPending}>
        {isPending ? 'Redirecting…' : label}
      </Button>
      {error && <p className="mt-2 text-[11px] text-[var(--error)]">{error}</p>}
    </>
  )
}

export function ContactSalesButton() {
  return (
    <a
      href="mailto:hello@clinicforce.io?subject=ClinicForce%20Enterprise%20enquiry"
      className="block w-full"
    >
      <Button variant="secondary" size="sm" className="w-full">
        Contact Sales
      </Button>
    </a>
  )
}

export function ManageSubscriptionButton() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onClick = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Could not open the billing portal.')
        return
      }
      window.location.href = json.url
    })
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={onClick} disabled={isPending}>
        {isPending ? 'Opening…' : 'Manage subscription'}
      </Button>
      {error && <p className="mt-2 text-[11px] text-[var(--error)]">{error}</p>}
    </>
  )
}
