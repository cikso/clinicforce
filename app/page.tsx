import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingTrustStrip } from '@/components/landing/LandingTrustStrip'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingSolution } from '@/components/landing/LandingSolution'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingDifferentiation } from '@/components/landing/LandingDifferentiation'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingBenefits } from '@/components/landing/LandingBenefits'
import { LandingCta } from '@/components/landing/LandingCta'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-[#0A0A0A] bg-[#F4F2ED] selection:bg-[#0A3622] selection:text-[#F4F2ED]">
      <LandingNavbar />
      <main className="flex-grow">
        <LandingHero />
        <LandingTrustStrip />
        <LandingProblem />
        <LandingSolution />
        <LandingFeatures />
        <LandingDifferentiation />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
