import OnboardingShell from '../../onboarding-shell'

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingShell>{children}</OnboardingShell>
}
