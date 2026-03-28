import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export const metadata = {
  title: 'Set Up Your Clinic — VetDesk',
}

export default function OnboardingPage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo strip */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-full bg-[#0ea5e9] flex items-center justify-center shrink-0">
          <div className="w-5 h-5 bg-white rounded-sm relative flex items-center justify-center">
            <div className="w-3 h-0.5 bg-[#0ea5e9] absolute" />
            <div className="w-0.5 h-3 bg-[#0ea5e9] absolute" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-[#0f5b8a] leading-tight">VetDesk</h1>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Front Desk AI</p>
        </div>
      </div>

      <OnboardingWizard />
    </div>
  )
}
