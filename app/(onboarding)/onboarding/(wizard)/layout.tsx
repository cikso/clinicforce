import OnboardingShell from '../../onboarding-shell'

export default function WizardLayout({ children }: { children: React.ReactNode }) {
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
