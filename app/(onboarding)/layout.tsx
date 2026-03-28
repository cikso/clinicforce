export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-6 py-16">
      {children}
    </div>
  )
}
