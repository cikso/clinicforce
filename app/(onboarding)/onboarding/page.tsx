import { redirect } from 'next/navigation'

// Onboarding is now handled inside /login — redirect old route
export default function OnboardingPage() {
  redirect('/login')
}
