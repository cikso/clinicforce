import { LandingNavbar }    from '@/components/landing/LandingNavbar'
import { LandingHero }       from '@/components/landing/LandingHero'
import { LandingTrustStrip } from '@/components/landing/LandingTrustStrip'
import { LandingProblem }    from '@/components/landing/LandingProblem'
import { LandingFeatures }   from '@/components/landing/LandingFeatures'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingBenefits }   from '@/components/landing/LandingBenefits'
import { LandingPricing }    from '@/components/landing/LandingPricing'
import { LandingCta }        from '@/components/landing/LandingCta'
import { LandingFooter }     from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div
      style={{
        background: '#080B12',
        color: '#F0F4FF',
        fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
        overflowX: 'hidden',
      }}
      className="min-h-screen antialiased"
    >
      {/* Noise overlay */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 999,
        }}
      />
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingTrustStrip />
        <LandingProblem />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingPricing />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
