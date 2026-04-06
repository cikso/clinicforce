import type { Metadata } from 'next'
import OnboardingShell from './onboarding-shell'

export const metadata: Metadata = {
  title: 'ClinicForce — Setup',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <OnboardingShell>{children}</OnboardingShell>
    </>
  )
}
