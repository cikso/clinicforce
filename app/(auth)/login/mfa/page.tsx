import type { Metadata } from 'next'
import { Suspense } from 'react'
import MfaChallengeClient from './MfaChallengeClient'

export const metadata: Metadata = { title: 'Two-factor authentication — ClinicForce' }

export default function MfaChallengePage() {
  return (
    <Suspense fallback={null}>
      <MfaChallengeClient />
    </Suspense>
  )
}
