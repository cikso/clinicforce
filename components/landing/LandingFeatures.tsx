'use client'
import { motion } from 'motion/react'
import { Mic, Activity, FileText, Settings, Database, ArrowUpRight } from 'lucide-react'

export function LandingFeatures() {
  return (
    <section className="py-32 md:py-48 bg-white relative overflow-hidden" id="features">
      <div className="bg-noise" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="mb-32 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#0A0A0A]/20" />
            <span className="micro-label text-[#0A0A0A]/50 block">PURPOSE-BUILT FOR VETERINARY</span>
          </div>
          <h2 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium text-[#0A0A0A] mb-8 tracking-[-0.03em] leading-[0.85] text-balance">
            Everything your front desk does. Available on demand.
          </h2>
          <p className="text-xl md:text-2xl text-[#0A0A0A]/60 leading-relaxed font-light max-w-2xl">
            Not just a chatbot. A complete front desk capability — coverage, intake, routine handling, and clean handoff — purpose-built for veterinary clinics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Feature 1 - Massive Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-12 bg-[#F4F2ED] rounded-[2.5rem] p-10 md:p-16 lg:p-20 border border-black/5 flex flex-col lg:flex-row gap-16 items-center relative"
          >
            <div className="flex-1 z-20 max-w-xl">
              <div className="w-16 h-16 rounded-full bg-white border border-black/5 flex items-center justify-center mb-10 shadow-sm relative">
                <Mic className="w-6 h-6 text-[#0A0A0A]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E25F38] border-2 border-[#F4F2ED]" />
              </div>
              <h3 className="text-4xl md:text-5xl font-medium text-[#0A0A0A] mb-6 tracking-tight">Instant Call Coverage</h3>
              <p className="text-[#0A0A0A]/60 leading-relaxed font-light mb-10 text-xl">
                Activates whenever your team is unavailable — lunch, meetings, sick leave, or after-hours. Every call is answered professionally, with full client and pet detail capture.
              </p>
              <ul className="space-y-5">
                {['Flexible activation — any time reception is unavailable', 'Client & pet detail capture on every call', 'Routine enquiry handling — appointments, hours, services'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-base font-medium text-[#0A0A0A]/80">
                    <div className="w-2 h-2 rounded-full bg-[#0A3622]/20" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 w-full relative h-[400px] lg:h-[500px] flex items-center justify-center lg:justify-end z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A3622]/5 to-transparent rounded-full blur-3xl" />

              <div className="relative w-full max-w-md bg-white rounded-[2rem] border border-black/5 premium-shadow p-8 lg:-mr-12 lg:translate-x-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wider">Live Call</span>
                  </div>
                  <span className="text-sm font-mono text-[#0A0A0A]/40">02:14</span>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8E5DF] shrink-0" />
                    <div className="bg-[#F4F2ED] p-4 rounded-2xl rounded-tl-none text-sm text-[#0A0A0A]/80 leading-relaxed">
                      &quot;My dog just ate a whole bar of dark chocolate about 10 minutes ago. He&apos;s a 20lb terrier.&quot;
                    </div>
                  </div>
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-[#0A3622] shrink-0 flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-[#0A3622] text-white p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed">
                      &quot;Of course — I&apos;ll take a note of that and let the team know. Can I take your name and your dog&apos;s details so we can have everything ready when you arrive?&quot;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Asymmetrical Dark Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-12 lg:col-span-5 bg-[#0A3622] rounded-[2.5rem] p-10 md:p-14 border border-black/5 text-white flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-10 border border-white/10 backdrop-blur-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-medium mb-6 tracking-tight">Urgency Detection & Escalation</h3>
              <p className="text-white/60 leading-relaxed font-light text-lg">
                When something urgent comes in, VetDesk recognises it and escalates appropriately — routing time-sensitive cases to the right person without delay.
              </p>
            </div>
            <div className="mt-16 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-white/60 font-medium tracking-wide uppercase">Toxicity Risk</span>
                <span className="text-sm font-bold text-[#E25F38] bg-[#E25F38]/10 px-3 py-1 rounded-full">Critical</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '95%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  className="bg-[#E25F38] h-full rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - Asymmetrical Light Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-12 lg:col-span-7 bg-[#E8E5DF] rounded-[2.5rem] p-10 md:p-14 border border-black/5 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-10 shadow-sm border border-black/5">
                <FileText className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-3xl font-medium text-[#0A0A0A] mb-6 tracking-tight">Callback Summaries</h3>
              <p className="text-[#0A0A0A]/60 leading-relaxed font-light text-lg max-w-lg">
                Every handled call ends with a clean handoff note sent to your team — caller name, pet details, reason for call, and next step. No voicemail, no scribbled messages.
              </p>
            </div>

            <div className="mt-12 bg-white rounded-2xl p-6 border border-black/5 premium-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F4F2ED] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0A0A0A]">SOAP</span>
                  </div>
                  <span className="text-sm font-medium text-[#0A0A0A]">Auto-generated Note</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#0A0A0A]/40" />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-3/4 bg-[#E8E5DF] rounded-full" />
                <div className="h-2 w-full bg-[#E8E5DF] rounded-full" />
                <div className="h-2 w-5/6 bg-[#E8E5DF] rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Feature 4 & 5 - Bottom Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-6 lg:col-span-6 bg-[#F4F2ED] rounded-[2.5rem] p-10 md:p-12 border border-black/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A3622]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm border border-black/5">
                <Settings className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <h3 className="text-2xl font-medium text-[#0A0A0A] mb-4 tracking-tight">Routine Enquiry Handling</h3>
              <p className="text-[#0A0A0A]/60 leading-relaxed font-light text-lg">
                Handles appointment requests, opening hours, pricing questions, and service enquiries — freeing your team to focus on the patients in front of them.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-6 lg:col-span-6 bg-[#F4F2ED] rounded-[2.5rem] p-10 md:p-12 border border-black/5 lg:mt-12 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#E25F38]/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm border border-black/5">
                <Database className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <h3 className="text-2xl font-medium text-[#0A0A0A] mb-4 tracking-tight">Practice Management Integration</h3>
              <p className="text-[#0A0A0A]/60 leading-relaxed font-light text-lg">
                Designed to securely sync with leading Practice Management Software — logging intake summaries directly into the patient record.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
