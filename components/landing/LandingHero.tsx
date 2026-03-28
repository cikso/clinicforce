'use client'
import { motion } from 'motion/react'
import { ArrowRight, Activity, ShieldCheck, Clock } from 'lucide-react'
import Link from 'next/link'
import { LandingButton } from './LandingButton'

export function LandingHero() {
  const customEase = [0.16, 1, 0.3, 1] as const

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-[#F4F2ED]">
      <div className="bg-noise" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          <div className="lg:col-span-7 max-w-3xl relative z-30 lg:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: customEase }}
              className="mb-10 flex items-center gap-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A3622]/5 border border-[#0A3622]/10">
                <div className="w-2 h-2 rounded-full bg-[#0A3622] animate-pulse" />
                <span className="micro-label text-[#0A3622] tracking-wide">System Online</span>
              </div>
              <div className="h-px w-12 bg-[#0A0A0A]/10 hidden sm:block" />
              <span className="micro-label text-[#0A0A0A]/50 hidden sm:block">Built for the operational realities of veterinary medicine.</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: customEase }}
              className="text-[4rem] md:text-[5.5rem] lg:text-[7rem] leading-[0.85] font-bold text-[#0A0A0A] mb-10 tracking-[-0.04em]"
            >
              The on-demand front desk for modern veterinary clinics.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: customEase }}
              className="text-xl md:text-2xl text-[#0A0A0A]/60 mb-14 max-w-xl leading-relaxed font-light"
            >
              Whether your team is at lunch, in a meeting, or off the clock — VetDesk answers, captures, and handles every call.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: customEase }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="#how-it-works" className="inline-flex items-center justify-center h-16 px-10 text-lg rounded-full bg-[#0A0A0A] text-[#F4F2ED] font-semibold hover:bg-[#0A0A0A]/80 transition-colors group">
                See How It Works
                <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/overview" className="inline-flex items-center justify-center h-16 px-10 text-lg rounded-full border border-black/10 text-[#0A0A0A]/70 font-semibold hover:bg-black/5 transition-colors">
                View Dashboard →
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative lg:h-[800px] flex items-center justify-center lg:justify-end lg:-ml-20 mt-16 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: customEase }}
              className="relative w-full max-w-[550px] aspect-[3/4] z-20"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[#0A3622]/5 rounded-full blur-[120px] pointer-events-none" />

              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, -1, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-0 w-[90%] h-[75%] bg-[#0A0A0A] rounded-[2.5rem] p-8 shadow-2xl border border-white/10 z-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                    <span className="micro-label text-white/40">Coverage Active</span>
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E25F38] animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-px w-full bg-white/10 relative overflow-hidden">
                      <motion.div className="absolute top-0 left-0 h-full w-1/4 bg-[#E25F38]" animate={{ x: ['-100%', '400%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
                    </div>
                    <div className="flex items-start gap-5">
                      <Activity className="w-6 h-6 text-white/30 shrink-0 mt-1" />
                      <div>
                        <p className="text-[11px] text-white/50 font-mono mb-2 uppercase tracking-wider">Live Call Analysis</p>
                        <p className="text-base text-white/90 font-medium leading-relaxed">&quot;He&apos;s been retching but nothing is coming up, and his stomach feels hard.&quot;</p>
                      </div>
                    </div>
                    <div className="mt-10 p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-white/50 font-medium tracking-wide">Priority Level</span>
                        <span className="text-sm font-bold text-[#E25F38]">98%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-[#E25F38] h-1.5 rounded-full w-[98%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-12 left-0 w-[85%] bg-white/95 backdrop-blur-2xl rounded-[2rem] p-7 shadow-[0_24px_48px_-12px_rgba(10,10,10,0.08)] border border-black/5 z-20"
              >
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-black/5">
                  <div className="w-12 h-12 rounded-full bg-[#E25F38]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#E25F38]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A0A0A] tracking-tight">Coverage Active</h3>
                    <p className="text-xs text-[#0A0A0A]/50 mt-0.5">Caller Handled — Message Sent to Clinic</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#0A0A0A]/40 font-medium">Patient</span>
                    <span className="text-sm font-medium text-[#0A0A0A]">Buster (Great Dane, 6y)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#0A0A0A]/40 font-medium">Owner</span>
                    <span className="text-sm font-medium text-[#0A0A0A]">Michael T. — Callback requested</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-[#0A0A0A]/40 font-medium">Action</span>
                    <span className="text-xs font-semibold text-[#0A3622] bg-[#0A3622]/5 px-2.5 py-1 rounded-md">Summary sent to front desk</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/3 -left-12 bg-white rounded-2xl p-4 shadow-[0_24px_48px_-12px_rgba(10,10,10,0.08)] border border-black/5 z-30 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8E5DF] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#0A0A0A]/60" />
                </div>
                <div>
                  <p className="micro-label text-[#0A0A0A]/40 mb-0.5">Response Time</p>
                  <p className="text-sm font-semibold text-[#0A0A0A]">0.4 Seconds</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0], x: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -top-6 left-8 bg-white rounded-2xl p-5 shadow-[0_24px_48px_-12px_rgba(10,10,10,0.08)] border border-black/5 z-40 flex items-center gap-5"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0A] mb-1">VetDesk Coverage</p>
                  <p className="text-[11px] text-[#0A0A0A]/50 font-medium">Active (Lunch Hour)</p>
                </div>
                <div className="w-12 h-6 bg-[#0A3622] rounded-full relative shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
