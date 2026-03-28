export function LandingTrustStrip() {
  return (
    <section className="py-16 border-y border-black/5 bg-[#F4F2ED] relative overflow-hidden">
      <div className="bg-noise" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left shrink-0">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#E25F38] animate-pulse" />
              <h3 className="micro-label text-[#0A0A0A]/50">Trusted Standard</h3>
            </div>
            <p className="text-base font-medium text-[#0A0A0A]/80 tracking-tight max-w-md">Instant front desk coverage for lunch breaks, staff meetings, sick days, overflow, and after-hours.</p>
          </div>
          <div className="w-full lg:w-px lg:h-12 bg-black/5" />
          <div className="flex flex-wrap justify-center lg:justify-end items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 w-full">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-6 h-6 rounded bg-[#0A0A0A] group-hover:bg-[#E25F38] transition-colors duration-500" />
              <span className="font-bold text-xl tracking-tight text-[#0A0A0A]">VETPARTNERS</span>
            </div>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-6 h-6 rounded-full bg-[#0A0A0A] group-hover:bg-[#0A3622] transition-colors duration-500" />
              <span className="font-semibold text-xl tracking-tighter text-[#0A0A0A]">OAK&amp;BONE</span>
            </div>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-6 h-6 rounded-tl-xl rounded-br-xl bg-[#0A0A0A] group-hover:bg-[#E25F38] transition-colors duration-500" />
              <span className="font-medium text-xl tracking-wide text-[#0A0A0A]">CLINICARE</span>
            </div>
            <div className="hidden md:flex items-center gap-3 group cursor-default">
              <div className="w-6 h-6 rotate-45 bg-[#0A0A0A] group-hover:bg-[#0A3622] transition-colors duration-500" />
              <span className="font-bold text-xl tracking-tight text-[#0A0A0A]">APEX VET</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
