'use client'
import { motion } from 'motion/react'
import { ShieldCheck, Brain, Layers, Sparkles } from 'lucide-react'

export function LandingDifferentiation() {
  return (
    <section className="py-32 md:py-48 bg-[#F4F2ED] border-y border-black/5 relative overflow-hidden">
      <div className="bg-noise" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-24 items-center">

          <div className="order-2 lg:order-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-square md:aspect-[4/5] rounded-[2.5rem] bg-[#F9F8F6] border border-black/5 shadow-2xl p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:32px_32px]" />

              <div className="relative z-10 space-y-8 w-full max-w-md mx-auto">
                {/* Layer 1 */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-black/5 shadow-sm flex items-center justify-between transform -rotate-2 group-hover:rotate-0 transition-transform duration-700 ease-out"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E8E5DF] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#0A0A0A]/60" />
                    </div>
                    <span className="text-sm font-medium text-[#0A0A0A]/80 tracking-wide">Client Inputs (Voice & Web)</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]/20" />
                  </div>
                </motion.div>

                {/* Layer 2 - Core */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#0A0A0A] p-8 rounded-2xl border border-black/10 shadow-2xl relative z-20 scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <Brain className="w-6 h-6 text-[#F4F2ED]" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#E25F38] tracking-widest uppercase block mb-1">Core Engine</span>
                      <span className="text-lg font-medium text-white tracking-wide">ClinicForce Coverage</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#E25F38] w-1/3 rounded-full" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
                  </div>
                </motion.div>

                {/* Layer 3 */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-black/5 shadow-sm flex items-center justify-between transform rotate-2 group-hover:rotate-0 transition-transform duration-700 ease-out"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A3622]/10 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-[#0A3622]" />
                    </div>
                    <span className="text-sm font-medium text-[#0A0A0A]/80 tracking-wide">Clinic PMS & Staff Handoff</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0A3622]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0A3622]/20" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2 lg:pl-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-[#E25F38]/50" />
              <span className="micro-label text-[#E25F38] block">ClinicForce IN ACTION</span>
            </div>
            <h2 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium text-[#0A0A0A] mb-8 tracking-[-0.03em] leading-[0.85] text-balance">
              11:30 AM. Reception is flat out. The phone rings.
            </h2>
            <p className="text-xl md:text-2xl text-[#0A0A0A]/60 mb-16 leading-relaxed font-light max-w-2xl">
              It could be a booking request, a billing question, or something urgent. Traditional voicemail can&apos;t tell the difference. ClinicForce can.
            </p>

            <div className="space-y-12">
              <div className="flex gap-8 group relative">
                <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-10" />
                  <ShieldCheck className="w-7 h-7 text-[#0A3622] relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-2xl font-medium text-[#0A0A0A] mb-3 tracking-tight">The Scenario</h4>
                  <p className="text-lg text-[#0A0A0A]/60 leading-relaxed font-light">
                    Your reception team is occupied with a patient at the front desk. They cannot answer the phone. A client is calling — it could be anything from an appointment request to a worried owner.
                  </p>
                </div>
              </div>

              <div className="flex gap-8 group relative">
                <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-10" />
                  <Brain className="w-7 h-7 text-[#0A3622] relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-2xl font-medium text-[#0A0A0A] mb-3 tracking-tight">ClinicForce Answers</h4>
                  <p className="text-lg text-[#0A0A0A]/60 leading-relaxed font-light">
                    ClinicForce picks up on the second ring. It greets the client warmly, captures their name, their pet&apos;s details, and the reason for the call — naturally and professionally.
                  </p>
                </div>
              </div>

              <div className="flex gap-8 group relative">
                <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-noise opacity-10" />
                  <Layers className="w-7 h-7 text-[#0A3622] relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-2xl font-medium text-[#0A0A0A] mb-3 tracking-tight">The Outcome</h4>
                  <p className="text-lg text-[#0A0A0A]/60 leading-relaxed font-light">
                    If it&apos;s routine, a clean summary is queued for the team. If it&apos;s urgent, ClinicForce flags it immediately and escalates to the right person. Either way — no voicemail delay, no dropped call, total continuity.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
