export function LandingFooter() {
  return (
    <footer className="bg-[#F4F2ED] pt-32 pb-12 border-t border-black/5 relative overflow-hidden">
      <div className="bg-noise" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="col-span-1 md:col-span-4 lg:col-span-5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-[#F4F2ED] shadow-sm">
                <div className="w-3 h-3 bg-[#E25F38] rounded-full" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#0A0A0A]">VetForce</span>
            </div>
            <p className="text-lg text-[#0A0A0A]/60 leading-relaxed max-w-sm font-light mb-8">
              VetForce. The AI front desk for veterinary clinics.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                <span className="text-sm font-medium text-[#0A0A0A]/60">X</span>
              </div>
              <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                <span className="text-sm font-medium text-[#0A0A0A]/60">in</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="micro-label text-[#0A0A0A]/40 mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Features</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Coverage Logic</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Integrations</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Security</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="micro-label text-[#0A0A0A]/40 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">About Us</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Careers</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Contact</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Partners</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4 lg:col-span-3">
            <h4 className="micro-label text-[#0A0A0A]/40 mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Privacy Policy</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">Terms of Service</a></li>
              <li><a href="#" className="text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors font-light">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-[#0A0A0A]/40 font-light">
            © {new Date().getFullYear()} VetForce Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0A3622] animate-pulse" />
            <span className="text-sm text-[#0A0A0A]/40 font-light">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
